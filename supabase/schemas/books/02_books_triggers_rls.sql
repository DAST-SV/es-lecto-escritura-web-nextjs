-- ======================================================
-- SISTEMA DE GESTIÓN DE LIBROS DIGITALES INTERACTIVOS
-- Archivo: 02_books_triggers_rls.sql
-- Descripción: Triggers, funciones y Row Level Security
-- ======================================================

-- ⭐ ESTABLECER SEARCH PATH
SET search_path TO books, public;

-- ======================================================
-- PASO 1: FUNCIONES Y TRIGGERS
-- ======================================================

-- ==============================================
-- Función: update_updated_at_column
-- Actualiza automáticamente el campo updated_at
-- ==============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Actualiza automáticamente el campo updated_at al modificar un registro';

-- Aplicar trigger a books
CREATE TRIGGER trigger_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- Función: audit_trigger_function
-- Registra todos los cambios en book_audit_logs
-- ==============================================
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO book_audit_logs (table_name, record_id, action, old_data, user_id)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD), auth.uid());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO book_audit_logs (table_name, record_id, action, old_data, new_data, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO book_audit_logs (table_name, record_id, action, new_data, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW), auth.uid());
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION audit_trigger_function() IS 'Registra automáticamente todos los cambios en book_audit_logs';

-- Aplicar auditoría a books
CREATE TRIGGER trigger_audit_books
    AFTER INSERT OR UPDATE OR DELETE ON books
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- ==============================================
-- Función: validate_book_for_publishing
-- Valida requisitos antes de publicar un libro
-- ==============================================
CREATE OR REPLACE FUNCTION validate_book_for_publishing()
RETURNS TRIGGER AS $$
DECLARE
    page_count INTEGER;
    has_cover BOOLEAN;
BEGIN
    -- Solo validar si se está intentando publicar
    IF NEW.is_published = TRUE AND (OLD.is_published = FALSE OR OLD.is_published IS NULL) THEN
        
        -- Verificar que tenga al menos una página
        SELECT COUNT(*) INTO page_count FROM book_pages WHERE book_id = NEW.id;
        
        IF page_count = 0 THEN
            RAISE EXCEPTION 'No se puede publicar un libro sin páginas';
        END IF;
        
        -- Verificar que tenga portada
        has_cover := NEW.cover_url IS NOT NULL AND LENGTH(NEW.cover_url) > 0;
        
        IF NOT has_cover THEN
            RAISE EXCEPTION 'No se puede publicar un libro sin portada';
        END IF;
        
        -- Verificar que tenga título
        IF NEW.title IS NULL OR LENGTH(TRIM(NEW.title)) = 0 THEN
            RAISE EXCEPTION 'No se puede publicar un libro sin título';
        END IF;
        
        -- Establecer fecha de publicación
        NEW.published_at := NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_book_publishing
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION validate_book_for_publishing();

COMMENT ON FUNCTION validate_book_for_publishing IS 'Valida que un libro cumpla requisitos mínimos antes de publicarse';

-- ==============================================
-- Función: soft_delete_book
-- Elimina lógicamente un libro
-- ==============================================
CREATE OR REPLACE FUNCTION soft_delete_book(book_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE books
    SET deleted_at = NOW(),
        deleted_by = auth.uid()
    WHERE id = book_uuid
    AND user_id = auth.uid()
    AND deleted_at IS NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION soft_delete_book IS 'Elimina lógicamente un libro sin borrarlo de la BD';

-- ==============================================
-- Función: increment_book_views
-- Incrementa el contador de vistas
-- ==============================================
CREATE OR REPLACE FUNCTION increment_book_views(book_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE books
    SET view_count = view_count + 1
    WHERE id = book_uuid
    AND is_published = TRUE
    AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_book_views IS 'Incrementa el contador de vistas de un libro';

-- ==============================================
-- Función: duplicate_book
-- Duplica un libro completo con todas sus páginas
-- ==============================================
CREATE OR REPLACE FUNCTION duplicate_book(
    source_book_id UUID,
    new_title VARCHAR(255) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_book_id UUID;
    source_book RECORD;
    page_record RECORD;
BEGIN
    -- Verificar permisos (solo puede duplicar sus propios libros)
    SELECT * INTO source_book
    FROM books
    WHERE id = source_book_id
    AND user_id = auth.uid()
    AND deleted_at IS NULL;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Libro no encontrado o sin permisos';
    END IF;
    
    -- Crear nuevo libro
    INSERT INTO books (
        user_id, type_id, level_id, title, description, 
        cover_url, is_published
    )
    VALUES (
        auth.uid(),
        source_book.type_id,
        source_book.level_id,
        COALESCE(new_title, source_book.title || ' (Copia)'),
        source_book.description,
        source_book.cover_url,
        FALSE -- Siempre empieza como no publicado
    )
    RETURNING id INTO new_book_id;
    
    -- Copiar páginas
    FOR page_record IN 
        SELECT * FROM book_pages WHERE book_id = source_book_id ORDER BY page_number
    LOOP
        INSERT INTO book_pages (
            book_id, page_number, layout, animation, title, content,
            image_url, audio_url, interactive_game, items,
            background_url, background_color, text_color, font, border_style
        )
        VALUES (
            new_book_id,
            page_record.page_number,
            page_record.layout,
            page_record.animation,
            page_record.title,
            page_record.content,
            page_record.image_url,
            page_record.audio_url,
            page_record.interactive_game,
            page_record.items,
            page_record.background_url,
            page_record.background_color,
            page_record.text_color,
            page_record.font,
            page_record.border_style
        );
    END LOOP;
    
    -- Copiar relaciones (categorías, valores, géneros, etc.)
    INSERT INTO books_categories (book_id, category_id, is_primary)
    SELECT new_book_id, category_id, is_primary
    FROM books_categories
    WHERE book_id = source_book_id;
    
    INSERT INTO books_values (book_id, value_id, is_primary)
    SELECT new_book_id, value_id, is_primary
    FROM books_values
    WHERE book_id = source_book_id;
    
    INSERT INTO books_genres (book_id, genre_id)
    SELECT new_book_id, genre_id
    FROM books_genres
    WHERE book_id = source_book_id;
    
    INSERT INTO books_tags (book_id, tag_id, is_primary)
    SELECT new_book_id, tag_id, is_primary
    FROM books_tags
    WHERE book_id = source_book_id;
    
    INSERT INTO books_authors (book_id, author_id, author_order)
    SELECT new_book_id, author_id, author_order
    FROM books_authors
    WHERE book_id = source_book_id;
    
    INSERT INTO books_characters (book_id, character_id, is_main)
    SELECT new_book_id, character_id, is_main
    FROM books_characters
    WHERE book_id = source_book_id;
    
    INSERT INTO books_languages (book_id, language_id, is_original)
    SELECT new_book_id, language_id, is_original
    FROM books_languages
    WHERE book_id = source_book_id;
    
    RETURN new_book_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION duplicate_book IS 'Duplica un libro completo con todas sus páginas y relaciones';

-- ==============================================
-- Función: search_books
-- Búsqueda full-text avanzada con filtros
-- ==============================================
CREATE OR REPLACE FUNCTION search_books(
    search_query TEXT,
    filter_level_id SMALLINT DEFAULT NULL,
    filter_category_id INTEGER DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    description TEXT,
    cover_url TEXT,
    level_name VARCHAR(100),
    authors TEXT[],
    categories TEXT[],
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.title,
        b.description,
        b.cover_url,
        l.name as level_name,
        COALESCE(
            array_agg(DISTINCT a.name) FILTER (WHERE a.id IS NOT NULL),
            ARRAY[]::VARCHAR[]
        ) as authors,
        COALESCE(
            array_agg(DISTINCT c.name) FILTER (WHERE c.id IS NOT NULL),
            ARRAY[]::VARCHAR[]
        ) as categories,
        ts_rank(
            to_tsvector('spanish', b.title || ' ' || COALESCE(b.description, '')),
            plainto_tsquery('spanish', search_query)
        ) as relevance
    FROM books b
    LEFT JOIN book_levels l ON b.level_id = l.id
    LEFT JOIN books_authors ba ON b.id = ba.book_id
    LEFT JOIN book_authors a ON ba.author_id = a.id
    LEFT JOIN books_categories bc ON b.id = bc.book_id
    LEFT JOIN book_categories c ON bc.category_id = c.id
    WHERE 
        b.is_published = TRUE
        AND b.deleted_at IS NULL
        AND to_tsvector('spanish', b.title || ' ' || COALESCE(b.description, '')) 
            @@ plainto_tsquery('spanish', search_query)
        AND (filter_level_id IS NULL OR b.level_id = filter_level_id)
        AND (filter_category_id IS NULL OR EXISTS (
            SELECT 1 FROM books_categories 
            WHERE book_id = b.id AND category_id = filter_category_id
        ))
    GROUP BY b.id, l.name
    ORDER BY relevance DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_books IS 'Búsqueda full-text con filtros y ranking de relevancia';

-- ==============================================
-- Función: cleanup_old_audit_logs
-- Limpia registros de auditoría antiguos
-- ==============================================
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM book_audit_logs
    WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_audit_logs IS 'Elimina registros de auditoría más antiguos que X días';

-- ======================================================
-- PASO 2: VISTAS ÚTILES
-- ======================================================

-- ==============================================
-- Vista: books_full_info
-- Información completa de libros con todas las relaciones
-- ==============================================
CREATE OR REPLACE VIEW books_full_info AS
SELECT 
    b.id,
    b.user_id,
    b.title,
    b.description,
    b.cover_url,
    b.is_published,
    b.is_featured,
    b.view_count,
    b.created_at,
    b.published_at,
    -- Tipo
    bt.name as type_name,
    -- Nivel
    l.name as level_name,
    l.min_age,
    l.max_age,
    -- Autores (array)
    COALESCE(
        array_agg(DISTINCT a.name ORDER BY a.name) FILTER (WHERE a.id IS NOT NULL),
        ARRAY[]::VARCHAR[]
    ) as authors,
    -- Categorías (array)
    COALESCE(
        array_agg(DISTINCT c.name ORDER BY c.name) FILTER (WHERE c.id IS NOT NULL),
        ARRAY[]::VARCHAR[]
    ) as categories,
    -- Valores (array)
    COALESCE(
        array_agg(DISTINCT v.name ORDER BY v.name) FILTER (WHERE v.id IS NOT NULL),
        ARRAY[]::VARCHAR[]
    ) as values,
    -- Géneros (array)
    COALESCE(
        array_agg(DISTINCT g.name ORDER BY g.name) FILTER (WHERE g.id IS NOT NULL),
        ARRAY[]::VARCHAR[]
    ) as genres,
    -- Tags (array)
    COALESCE(
        array_agg(DISTINCT t.name ORDER BY t.name) FILTER (WHERE t.id IS NOT NULL),
        ARRAY[]::VARCHAR[]
    ) as tags,
    -- Número de páginas
    (SELECT COUNT(*) FROM book_pages WHERE book_id = b.id) as page_count
FROM books b
LEFT JOIN book_types bt ON b.type_id = bt.id
LEFT JOIN book_levels l ON b.level_id = l.id
LEFT JOIN books_authors ba ON b.id = ba.book_id
LEFT JOIN book_authors a ON ba.author_id = a.id
LEFT JOIN books_categories bc ON b.id = bc.book_id
LEFT JOIN book_categories c ON bc.category_id = c.id
LEFT JOIN books_values bv ON b.id = bv.book_id
LEFT JOIN book_values v ON bv.value_id = v.id
LEFT JOIN books_genres bg ON b.id = bg.book_id
LEFT JOIN book_genres g ON bg.genre_id = g.id
LEFT JOIN books_tags btg ON b.id = btg.book_id
LEFT JOIN book_tags t ON btg.tag_id = t.id
WHERE b.deleted_at IS NULL
GROUP BY b.id, bt.name, l.name, l.min_age, l.max_age;

COMMENT ON VIEW books_full_info IS 'Vista con información completa de libros incluyendo todas las relaciones';

-- ==============================================
-- Vista: book_statistics
-- Estadísticas agregadas por libro
-- ==============================================
CREATE OR REPLACE VIEW book_statistics AS
SELECT 
    b.id as book_id,
    b.title,
    COUNT(DISTINCT bv.user_id) as unique_viewers,
    COUNT(bv.id) as total_views,
    AVG(bv.view_duration) as avg_view_duration,
    MAX(bv.created_at) as last_viewed_at
FROM books b
LEFT JOIN book_views bv ON b.id = bv.book_id
WHERE b.deleted_at IS NULL
GROUP BY b.id, b.title;

COMMENT ON VIEW book_statistics IS 'Estadísticas agregadas por libro';

-- ======================================================
-- PASO 3: ROW LEVEL SECURITY (RLS)
-- ======================================================

-- Habilitar RLS en todas las tablas principales
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE books_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE books_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE books_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE books_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE books_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE books_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE books_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_views ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en catálogos
ALTER TABLE book_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_characters ENABLE ROW LEVEL SECURITY;

-- ========================================
-- Políticas para service_role (acceso total)
-- ========================================
CREATE POLICY "Service role: acceso total a books"
    ON books FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_pages"
    ON book_pages FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a books_authors"
    ON books_authors FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a books_characters"
    ON books_characters FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a books_categories"
    ON books_categories FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a books_values"
    ON books_values FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a books_genres"
    ON books_genres FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a books_languages"
    ON books_languages FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a books_tags"
    ON books_tags FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_audit_logs"
    ON book_audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_views"
    ON book_views FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ========================================
-- Políticas de lectura pública (libros publicados)
-- ========================================
CREATE POLICY "Público: leer libros publicados"
    ON books FOR SELECT TO anon, authenticated
    USING (is_published = TRUE AND deleted_at IS NULL);

CREATE POLICY "Público: leer book_pages de libros publicados"
    ON book_pages FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = book_pages.book_id
            AND books.is_published = TRUE
            AND books.deleted_at IS NULL
        )
    );

CREATE POLICY "Público: leer books_authors de libros publicados"
    ON books_authors FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = books_authors.book_id
            AND books.is_published = TRUE
            AND books.deleted_at IS NULL
        )
    );

CREATE POLICY "Público: leer books_characters de libros publicados"
    ON books_characters FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = books_characters.book_id
            AND books.is_published = TRUE
            AND books.deleted_at IS NULL
        )
    );

CREATE POLICY "Público: leer books_categories de libros publicados"
    ON books_categories FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = books_categories.book_id
            AND books.is_published = TRUE
            AND books.deleted_at IS NULL
        )
    );

CREATE POLICY "Público: leer books_values de libros publicados"
    ON books_values FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = books_values.book_id
            AND books.is_published = TRUE
            AND books.deleted_at IS NULL
        )
    );

CREATE POLICY "Público: leer books_genres de libros publicados"
    ON books_genres FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = books_genres.book_id
            AND books.is_published = TRUE
            AND books.deleted_at IS NULL
        )
    );

CREATE POLICY "Público: leer books_languages de libros publicados"
    ON books_languages FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = books_languages.book_id
            AND books.is_published = TRUE
            AND books.deleted_at IS NULL
        )
    );

CREATE POLICY "Público: leer books_tags de libros publicados"
    ON books_tags FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = books_tags.book_id
            AND books.is_published = TRUE
            AND books.deleted_at IS NULL
        )
    );

-- ========================================
-- Políticas para usuarios autenticados (sus propios libros)
-- ========================================

-- Políticas de books
CREATE POLICY "Usuarios: leer libros propios"
    ON books FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Usuarios: crear libros propios"
    ON books FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuarios: actualizar libros propios"
    ON books FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuarios: eliminar libros propios"
    ON books FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- Políticas de book_pages (basadas en propiedad del libro)
CREATE POLICY "Usuarios: leer book_pages de libros propios"
    ON book_pages FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = book_pages.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios: crear book_pages en libros propios"
    ON book_pages FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = book_pages.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios: actualizar book_pages de libros propios"
    ON book_pages FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = book_pages.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios: eliminar book_pages de libros propios"
    ON book_pages FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = book_pages.book_id
            AND books.user_id = auth.uid()
        )
    );

-- Políticas de relaciones de libros (pueden gestionar relaciones de sus propios libros)
CREATE POLICY "Usuarios: gestionar books_authors de libros propios"
    ON books_authors FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = books_authors.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios: gestionar books_characters de libros propios"
    ON books_characters FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = books_characters.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios: gestionar books_categories de libros propios"
    ON books_categories FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = books_categories.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios: gestionar books_values de libros propios"
    ON books_values FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = books_values.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios: gestionar books_genres de libros propios"
    ON books_genres FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = books_genres.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios: gestionar books_languages de libros propios"
    ON books_languages FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = books_languages.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios: gestionar books_tags de libros propios"
    ON books_tags FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = books_tags.book_id
            AND books.user_id = auth.uid()
        )
    );

-- ========================================
-- Políticas de lectura pública para catálogos
-- ========================================
CREATE POLICY "Público: leer tipos de libros"
    ON book_types FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Público: leer niveles de lectura"
    ON book_levels FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Público: leer categorías"
    ON book_categories FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Público: leer valores"
    ON book_values FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Público: leer géneros"
    ON book_genres FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Público: leer idiomas activos"
    ON book_languages FOR SELECT TO anon, authenticated
    USING (is_active = TRUE);

CREATE POLICY "Público: leer etiquetas"
    ON book_tags FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Público: leer autores"
    ON book_authors FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Público: leer personajes"
    ON book_characters FOR SELECT TO anon, authenticated
    USING (true);

-- ========================================
-- Políticas para book_audit_logs y book_views
-- ========================================
CREATE POLICY "Usuarios: ver sus propios registros de auditoría"
    ON book_audit_logs FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Cualquiera: insertar vistas de libros"
    ON book_views FOR INSERT TO anon, authenticated
    WITH CHECK (true);