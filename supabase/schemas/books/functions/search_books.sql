-- ======================================================
-- Función: search_books
-- Archivo: functions/search_books.sql
-- Descripción: Búsqueda full-text avanzada con filtros
-- ======================================================

SET search_path TO books, public;

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
