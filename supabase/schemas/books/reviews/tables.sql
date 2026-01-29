-- =============================================
-- SISTEMA DE RATINGS Y REVIEWS DE LIBROS
-- =============================================
-- Permite a usuarios valorar (1-5 estrellas) y escribir reviews
-- Las reviews requieren aprobación opcional
-- =============================================

-- Tabla de ratings (valoraciones con estrellas)
CREATE TABLE IF NOT EXISTS books.book_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books.books(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_book_ratings UNIQUE(book_id, user_id),
    CONSTRAINT chk_rating_range CHECK (rating >= 1 AND rating <= 5)
);

-- Índices para book_ratings
CREATE INDEX IF NOT EXISTS idx_book_ratings_book ON books.book_ratings(book_id);
CREATE INDEX IF NOT EXISTS idx_book_ratings_user ON books.book_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_book_ratings_rating ON books.book_ratings(rating);

-- Tabla de reviews (reseñas escritas)
CREATE TABLE IF NOT EXISTS books.book_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books.books(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(200),
    content TEXT NOT NULL,
    -- Moderación
    is_approved BOOLEAN DEFAULT FALSE,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id),
    rejection_reason TEXT,
    -- Engagement
    helpful_count INTEGER DEFAULT 0, -- Votos "útil"
    reported_count INTEGER DEFAULT 0, -- Reportes
    -- Estado
    is_featured BOOLEAN DEFAULT FALSE, -- Review destacada
    is_hidden BOOLEAN DEFAULT FALSE, -- Oculta por reportes
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_book_reviews UNIQUE(book_id, user_id)
);

-- Índices para book_reviews
CREATE INDEX IF NOT EXISTS idx_book_reviews_book ON books.book_reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_book_reviews_user ON books.book_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_book_reviews_approved ON books.book_reviews(is_approved) WHERE is_approved = TRUE;
CREATE INDEX IF NOT EXISTS idx_book_reviews_featured ON books.book_reviews(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_book_reviews_not_deleted ON books.book_reviews(deleted_at) WHERE deleted_at IS NULL;

-- Tabla de votos "útil" para reviews
CREATE TABLE IF NOT EXISTS books.book_review_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES books.book_reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_review_votes UNIQUE(review_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_review_votes_review ON books.book_review_votes(review_id);

-- =============================================
-- TABLA DE ESTADÍSTICAS DE RATING POR LIBRO
-- (Materializada para mejor rendimiento)
-- =============================================

CREATE TABLE IF NOT EXISTS books.book_rating_stats (
    book_id UUID PRIMARY KEY REFERENCES books.books(id) ON DELETE CASCADE,
    total_ratings INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    rating_1_count INTEGER DEFAULT 0,
    rating_2_count INTEGER DEFAULT 0,
    rating_3_count INTEGER DEFAULT 0,
    rating_4_count INTEGER DEFAULT 0,
    rating_5_count INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_book_rating_stats_average ON books.book_rating_stats(average_rating DESC);

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger para actualizar estadísticas de rating
CREATE OR REPLACE FUNCTION books.update_book_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_book_id UUID;
BEGIN
    -- Determinar el book_id afectado
    IF TG_OP = 'DELETE' THEN
        v_book_id := OLD.book_id;
    ELSE
        v_book_id := NEW.book_id;
    END IF;

    -- Insertar o actualizar estadísticas
    INSERT INTO books.book_rating_stats (book_id, total_ratings, average_rating, rating_1_count, rating_2_count, rating_3_count, rating_4_count, rating_5_count, updated_at)
    SELECT
        v_book_id,
        COUNT(*),
        COALESCE(AVG(rating), 0),
        COUNT(*) FILTER (WHERE rating = 1),
        COUNT(*) FILTER (WHERE rating = 2),
        COUNT(*) FILTER (WHERE rating = 3),
        COUNT(*) FILTER (WHERE rating = 4),
        COUNT(*) FILTER (WHERE rating = 5),
        NOW()
    FROM books.book_ratings
    WHERE book_id = v_book_id
    ON CONFLICT (book_id) DO UPDATE SET
        total_ratings = EXCLUDED.total_ratings,
        average_rating = EXCLUDED.average_rating,
        rating_1_count = EXCLUDED.rating_1_count,
        rating_2_count = EXCLUDED.rating_2_count,
        rating_3_count = EXCLUDED.rating_3_count,
        rating_4_count = EXCLUDED.rating_4_count,
        rating_5_count = EXCLUDED.rating_5_count,
        updated_at = NOW();

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_book_rating_stats ON books.book_ratings;
CREATE TRIGGER trg_update_book_rating_stats
    AFTER INSERT OR UPDATE OR DELETE ON books.book_ratings
    FOR EACH ROW
    EXECUTE FUNCTION books.update_book_rating_stats();

-- Trigger para actualizar contador de reviews en stats
CREATE OR REPLACE FUNCTION books.update_book_review_count()
RETURNS TRIGGER AS $$
DECLARE
    v_book_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_book_id := OLD.book_id;
    ELSE
        v_book_id := NEW.book_id;
    END IF;

    UPDATE books.book_rating_stats
    SET
        total_reviews = (
            SELECT COUNT(*) FROM books.book_reviews
            WHERE book_id = v_book_id
            AND is_approved = TRUE
            AND deleted_at IS NULL
        ),
        updated_at = NOW()
    WHERE book_id = v_book_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_book_review_count ON books.book_reviews;
CREATE TRIGGER trg_update_book_review_count
    AFTER INSERT OR UPDATE OR DELETE ON books.book_reviews
    FOR EACH ROW
    EXECUTE FUNCTION books.update_book_review_count();

-- Trigger para actualizar helpful_count
CREATE OR REPLACE FUNCTION books.update_review_helpful_count()
RETURNS TRIGGER AS $$
DECLARE
    v_review_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_review_id := OLD.review_id;
    ELSE
        v_review_id := NEW.review_id;
    END IF;

    UPDATE books.book_reviews
    SET helpful_count = (
        SELECT COUNT(*) FROM books.book_review_votes
        WHERE review_id = v_review_id AND is_helpful = TRUE
    )
    WHERE id = v_review_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_review_helpful_count ON books.book_review_votes;
CREATE TRIGGER trg_update_review_helpful_count
    AFTER INSERT OR UPDATE OR DELETE ON books.book_review_votes
    FOR EACH ROW
    EXECUTE FUNCTION books.update_review_helpful_count();

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION books.update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_book_ratings_updated_at ON books.book_ratings;
CREATE TRIGGER trg_book_ratings_updated_at
    BEFORE UPDATE ON books.book_ratings
    FOR EACH ROW
    EXECUTE FUNCTION books.update_reviews_updated_at();

DROP TRIGGER IF EXISTS trg_book_reviews_updated_at ON books.book_reviews;
CREATE TRIGGER trg_book_reviews_updated_at
    BEFORE UPDATE ON books.book_reviews
    FOR EACH ROW
    EXECUTE FUNCTION books.update_reviews_updated_at();

-- =============================================
-- FUNCIONES HELPER
-- =============================================

-- Función para obtener estadísticas de rating de un libro
CREATE OR REPLACE FUNCTION books.get_book_rating_stats(p_book_id UUID)
RETURNS TABLE (
    total_ratings INTEGER,
    average_rating DECIMAL,
    rating_1_count INTEGER,
    rating_2_count INTEGER,
    rating_3_count INTEGER,
    rating_4_count INTEGER,
    rating_5_count INTEGER,
    total_reviews INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        brs.total_ratings,
        brs.average_rating,
        brs.rating_1_count,
        brs.rating_2_count,
        brs.rating_3_count,
        brs.rating_4_count,
        brs.rating_5_count,
        brs.total_reviews
    FROM books.book_rating_stats brs
    WHERE brs.book_id = p_book_id;

    -- Si no existe, devolver ceros
    IF NOT FOUND THEN
        RETURN QUERY SELECT 0, 0::DECIMAL, 0, 0, 0, 0, 0, 0;
    END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- Función para obtener reviews de un libro con información de usuario
CREATE OR REPLACE FUNCTION books.get_book_reviews(
    p_book_id UUID,
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0,
    p_only_approved BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    review_id UUID,
    user_id UUID,
    user_name VARCHAR,
    user_avatar TEXT,
    rating SMALLINT,
    title VARCHAR,
    content TEXT,
    helpful_count INTEGER,
    is_featured BOOLEAN,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        br.id AS review_id,
        br.user_id,
        COALESCE(up.display_name, up.first_name || ' ' || up.last_name)::VARCHAR AS user_name,
        up.avatar_url AS user_avatar,
        brat.rating,
        br.title,
        br.content,
        br.helpful_count,
        br.is_featured,
        br.created_at
    FROM books.book_reviews br
    LEFT JOIN app.user_profiles up ON up.user_id = br.user_id
    LEFT JOIN books.book_ratings brat ON brat.book_id = br.book_id AND brat.user_id = br.user_id
    WHERE br.book_id = p_book_id
    AND br.deleted_at IS NULL
    AND br.is_hidden = FALSE
    AND (NOT p_only_approved OR br.is_approved = TRUE)
    ORDER BY br.is_featured DESC, br.helpful_count DESC, br.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Comentarios
COMMENT ON TABLE books.book_ratings IS 'Valoraciones con estrellas (1-5) de libros por usuarios';
COMMENT ON TABLE books.book_reviews IS 'Reseñas escritas de libros por usuarios';
COMMENT ON TABLE books.book_review_votes IS 'Votos de utilidad de reviews';
COMMENT ON TABLE books.book_rating_stats IS 'Estadísticas materializadas de ratings por libro para mejor rendimiento';
