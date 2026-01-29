-- =============================================
-- PERFILES DE AUTOR Y SEGUIDORES
-- =============================================
-- Sistema de perfiles públicos para autores
-- Incluye: bio, banner, redes sociales, verificación
-- Sistema de seguidores (seguir gratis)
-- =============================================

-- Tabla de perfiles de autor
CREATE TABLE IF NOT EXISTS app.author_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    author_bio TEXT,
    short_bio VARCHAR(200), -- Bio corta para tarjetas
    banner_url TEXT,
    website_url TEXT,
    social_links JSONB DEFAULT '{}'::jsonb, -- {"twitter": "...", "instagram": "...", ...}
    -- Verificación
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES auth.users(id),
    -- Visibilidad
    is_public BOOLEAN DEFAULT TRUE,
    is_accepting_collaborations BOOLEAN DEFAULT TRUE,
    -- Estadísticas (actualizadas por triggers)
    total_followers INTEGER DEFAULT 0,
    total_books INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    -- Configuración
    notification_preferences JSONB DEFAULT '{"new_follower": true, "new_review": true, "collaboration_request": true}'::jsonb,
    -- Monetización futura (Stripe)
    stripe_account_id VARCHAR(255),
    stripe_onboarded BOOLEAN DEFAULT FALSE,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para author_profiles
CREATE INDEX IF NOT EXISTS idx_author_profiles_username ON app.author_profiles(username);
CREATE INDEX IF NOT EXISTS idx_author_profiles_verified ON app.author_profiles(is_verified) WHERE is_verified = TRUE;
CREATE INDEX IF NOT EXISTS idx_author_profiles_public ON app.author_profiles(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_author_profiles_followers ON app.author_profiles(total_followers DESC);

-- Full-text search en bio
CREATE INDEX IF NOT EXISTS idx_author_profiles_bio_search ON app.author_profiles
USING gin(to_tsvector('spanish', COALESCE(author_bio, '') || ' ' || COALESCE(short_bio, '')));

-- Tabla de seguidores
CREATE TABLE IF NOT EXISTS app.author_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- Notificaciones
    notify_new_book BOOLEAN DEFAULT TRUE,
    notify_community_post BOOLEAN DEFAULT TRUE,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_author_followers UNIQUE(author_id, follower_id),
    CONSTRAINT chk_no_self_follow CHECK(author_id != follower_id)
);

-- Índices para author_followers
CREATE INDEX IF NOT EXISTS idx_author_followers_author ON app.author_followers(author_id);
CREATE INDEX IF NOT EXISTS idx_author_followers_follower ON app.author_followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_author_followers_created ON app.author_followers(created_at DESC);

-- =============================================
-- TRIGGERS PARA ESTADÍSTICAS
-- =============================================

-- Trigger para actualizar contador de seguidores
CREATE OR REPLACE FUNCTION app.update_author_follower_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE app.author_profiles
        SET total_followers = total_followers + 1, updated_at = NOW()
        WHERE user_id = NEW.author_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE app.author_profiles
        SET total_followers = GREATEST(0, total_followers - 1), updated_at = NOW()
        WHERE user_id = OLD.author_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_author_follower_count ON app.author_followers;
CREATE TRIGGER trg_author_follower_count
    AFTER INSERT OR DELETE ON app.author_followers
    FOR EACH ROW
    EXECUTE FUNCTION app.update_author_follower_count();

-- Trigger para actualizar updated_at en author_profiles
CREATE OR REPLACE FUNCTION app.update_author_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_author_profiles_updated_at ON app.author_profiles;
CREATE TRIGGER trg_author_profiles_updated_at
    BEFORE UPDATE ON app.author_profiles
    FOR EACH ROW
    EXECUTE FUNCTION app.update_author_profiles_updated_at();

-- =============================================
-- FUNCIONES HELPER
-- =============================================

-- Función para verificar si un usuario sigue a un autor
CREATE OR REPLACE FUNCTION app.is_following_author(
    p_author_id UUID,
    p_follower_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM app.author_followers
        WHERE author_id = p_author_id AND follower_id = p_follower_id
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Función para obtener autores populares
CREATE OR REPLACE FUNCTION app.get_popular_authors(
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    user_id UUID,
    username VARCHAR,
    author_bio TEXT,
    short_bio VARCHAR,
    banner_url TEXT,
    avatar_url TEXT,
    is_verified BOOLEAN,
    total_followers INTEGER,
    total_books INTEGER,
    average_rating DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ap.user_id,
        ap.username,
        ap.author_bio,
        ap.short_bio,
        ap.banner_url,
        up.avatar_url,
        ap.is_verified,
        ap.total_followers,
        ap.total_books,
        ap.average_rating
    FROM app.author_profiles ap
    LEFT JOIN app.user_profiles up ON up.user_id = ap.user_id
    WHERE ap.is_public = TRUE
    ORDER BY ap.total_followers DESC, ap.total_books DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Función para buscar autores
CREATE OR REPLACE FUNCTION app.search_authors(
    p_search_term VARCHAR,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    user_id UUID,
    username VARCHAR,
    short_bio VARCHAR,
    avatar_url TEXT,
    is_verified BOOLEAN,
    total_followers INTEGER,
    total_books INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ap.user_id,
        ap.username,
        ap.short_bio,
        up.avatar_url,
        ap.is_verified,
        ap.total_followers,
        ap.total_books
    FROM app.author_profiles ap
    LEFT JOIN app.user_profiles up ON up.user_id = ap.user_id
    WHERE
        ap.is_public = TRUE
        AND (
            ap.username ILIKE '%' || p_search_term || '%'
            OR ap.author_bio ILIKE '%' || p_search_term || '%'
            OR ap.short_bio ILIKE '%' || p_search_term || '%'
        )
    ORDER BY
        ap.is_verified DESC,
        ap.total_followers DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Comentarios
COMMENT ON TABLE app.author_profiles IS 'Perfiles públicos de autores de la plataforma';
COMMENT ON COLUMN app.author_profiles.username IS 'Nombre de usuario único para URL del perfil (/author/username)';
COMMENT ON COLUMN app.author_profiles.social_links IS 'Links a redes sociales en formato JSON: {"twitter": "url", "instagram": "url", ...}';
COMMENT ON COLUMN app.author_profiles.stripe_account_id IS 'ID de cuenta Stripe Connect para monetización futura';

COMMENT ON TABLE app.author_followers IS 'Relación de seguidores de autores (seguir gratis)';
COMMENT ON COLUMN app.author_followers.notify_new_book IS 'Recibir notificación cuando el autor publique un nuevo libro';
