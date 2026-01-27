-- ======================================================
-- Vista: book_statistics
-- Archivo: views/book_statistics.sql
-- Descripción: Estadísticas agregadas por libro
-- ======================================================

SET search_path TO books, public;

CREATE OR REPLACE VIEW v_book_statistics AS
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

COMMENT ON VIEW v_book_statistics IS 'Estadísticas agregadas por libro';
