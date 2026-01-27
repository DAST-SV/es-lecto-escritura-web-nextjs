-- ======================================================
-- Vista: books_full_info
-- Archivo: views/books_full_info.sql
-- Descripción: Información completa de libros con todas las relaciones
-- ======================================================

SET search_path TO books, public;

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
