-- supabase/schemas/books/views/v_categories_with_translations.sql
-- ============================================================================
-- VIEW: v_categories_with_translations
-- DESCRIPCIÓN: Vista de categorías con todas sus traducciones
-- ============================================================================

SET search_path TO books, app, public;

CREATE OR REPLACE VIEW books.v_categories_with_translations AS
SELECT
  c.id,
  c.slug,
  c.icon,
  c.color,
  c.order_index,
  c.is_active,
  c.created_at,
  -- Traducciones en JSON
  (
    SELECT jsonb_object_agg(
      ct.language_code,
      jsonb_build_object(
        'name', ct.name,
        'description', ct.description
      )
    )
    FROM books.category_translations ct
    WHERE ct.category_id = c.id AND ct.is_active = true
  ) AS translations,
  -- Conteo de libros publicados
  (
    SELECT COUNT(*)
    FROM books.books b
    WHERE b.category_id = c.id
      AND b.status = 'published'
      AND b.deleted_at IS NULL
  ) AS published_book_count,
  -- Conteo total de libros
  (
    SELECT COUNT(*)
    FROM books.books b
    WHERE b.category_id = c.id
      AND b.deleted_at IS NULL
  ) AS total_book_count
FROM books.categories c
WHERE c.deleted_at IS NULL
ORDER BY c.order_index, c.slug;

COMMENT ON VIEW books.v_categories_with_translations IS 'Vista de categorías con traducciones y conteos';

-- Grant
GRANT SELECT ON books.v_categories_with_translations TO authenticated;
GRANT SELECT ON books.v_categories_with_translations TO anon;

SELECT 'BOOKS: Vista v_categories_with_translations creada' AS status;
