-- supabase/schemas/books/views/v_books_with_translations.sql
-- ============================================================================
-- VIEW: v_books_with_translations
-- DESCRIPCIÓN: Vista de libros con todas sus traducciones
-- ============================================================================

SET search_path TO books, app, public;

CREATE OR REPLACE VIEW books.v_books_with_translations AS
SELECT
  b.id,
  b.slug,
  b.cover_url,
  b.difficulty,
  b.status,
  b.estimated_read_time,
  b.page_count,
  b.view_count,
  b.is_featured,
  b.is_premium,
  b.published_at,
  b.created_at,
  b.created_by,
  c.id AS category_id,
  c.slug AS category_slug,
  c.icon AS category_icon,
  c.color AS category_color,
  -- Traducciones del libro en JSON (incluye portada y PDF por idioma)
  (
    SELECT jsonb_object_agg(
      bt.language_code,
      jsonb_build_object(
        'title', bt.title,
        'subtitle', bt.subtitle,
        'description', bt.description,
        'summary', bt.summary,
        'cover_url', bt.cover_url,
        'pdf_url', bt.pdf_url,
        'is_primary', bt.is_primary
      )
    )
    FROM books.book_translations bt
    WHERE bt.book_id = b.id AND bt.is_active = true
  ) AS translations,
  -- Traducciones de categoría en JSON
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
  ) AS category_translations,
  -- Autores
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', a.id,
        'slug', a.slug,
        'avatar_url', a.avatar_url,
        'role', ba.role,
        'translations', (
          SELECT jsonb_object_agg(
            at.language_code,
            jsonb_build_object('name', at.name, 'bio', at.bio)
          )
          FROM books.author_translations at
          WHERE at.author_id = a.id AND at.is_active = true
        )
      )
      ORDER BY ba.order_index
    )
    FROM books.book_authors ba
    JOIN books.authors a ON a.id = ba.author_id
    WHERE ba.book_id = b.id AND a.is_active = true
  ) AS authors
FROM books.books b
LEFT JOIN books.categories c ON c.id = b.category_id
WHERE b.deleted_at IS NULL;

COMMENT ON VIEW books.v_books_with_translations IS 'Vista completa de libros con todas sus traducciones y autores';

-- Grant
GRANT SELECT ON books.v_books_with_translations TO authenticated;
GRANT SELECT ON books.v_books_with_translations TO anon;

SELECT 'BOOKS: Vista v_books_with_translations creada' AS status;
