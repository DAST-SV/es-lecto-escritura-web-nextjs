-- supabase/schemas/books/functions/search_books.sql
-- ============================================================================
-- FUNCIÓN: search_books
-- DESCRIPCIÓN: Busca libros por título/descripción en el idioma especificado
-- ============================================================================

SET search_path TO books, app, public;

CREATE OR REPLACE FUNCTION books.search_books(
  p_query TEXT,
  p_language_code TEXT DEFAULT 'es',
  p_category_slug VARCHAR DEFAULT NULL,
  p_difficulty books.difficulty_level DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  slug VARCHAR,
  title VARCHAR,
  summary TEXT,
  cover_url TEXT,
  difficulty books.difficulty_level,
  category_slug VARCHAR,
  category_name VARCHAR,
  relevance REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_lang app.language_code;
  v_search_query TEXT;
BEGIN
  -- Convertir y validar language_code
  BEGIN
    v_lang := p_language_code::app.language_code;
  EXCEPTION WHEN OTHERS THEN
    v_lang := 'es'::app.language_code;
  END;

  -- Preparar query de búsqueda
  v_search_query := '%' || LOWER(TRIM(p_query)) || '%';

  RETURN QUERY
  SELECT
    b.id,
    b.slug,
    COALESCE(bt.title, bt_fallback.title, 'Sin título')::VARCHAR AS title,
    COALESCE(bt.summary, bt_fallback.summary) AS summary,
    COALESCE(bt.cover_url, bt_fallback.cover_url, b.cover_url) AS cover_url,
    b.difficulty,
    c.slug::VARCHAR AS category_slug,
    COALESCE(ct.name, ct_fallback.name, c.slug)::VARCHAR AS category_name,
    -- Calcular relevancia simple
    CASE
      WHEN LOWER(bt.title) LIKE v_search_query THEN 1.0
      WHEN LOWER(bt.title) LIKE '%' || LOWER(TRIM(p_query)) || '%' THEN 0.8
      WHEN LOWER(bt.description) LIKE v_search_query THEN 0.5
      ELSE 0.3
    END::REAL AS relevance
  FROM books.books b
  -- Traducción en idioma solicitado
  LEFT JOIN books.book_translations bt
    ON bt.book_id = b.id
    AND bt.language_code = v_lang
    AND bt.is_active = true
  -- Fallback
  LEFT JOIN books.book_translations bt_fallback
    ON bt_fallback.book_id = b.id
    AND bt_fallback.is_primary = true
    AND bt_fallback.is_active = true
  -- Categoría
  LEFT JOIN books.categories c ON c.id = b.category_id
  LEFT JOIN books.category_translations ct
    ON ct.category_id = c.id
    AND ct.language_code = v_lang
    AND ct.is_active = true
  LEFT JOIN books.category_translations ct_fallback
    ON ct_fallback.category_id = c.id
    AND ct_fallback.language_code = 'es'::app.language_code
    AND ct_fallback.is_active = true
  WHERE b.deleted_at IS NULL
    AND b.status = 'published'
    AND (
      LOWER(COALESCE(bt.title, bt_fallback.title, '')) LIKE v_search_query
      OR LOWER(COALESCE(bt.description, bt_fallback.description, '')) LIKE v_search_query
      OR LOWER(COALESCE(bt.summary, bt_fallback.summary, '')) LIKE v_search_query
    )
    AND (p_category_slug IS NULL OR c.slug = p_category_slug)
    AND (p_difficulty IS NULL OR b.difficulty = p_difficulty)
  ORDER BY relevance DESC, b.is_featured DESC, b.published_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

COMMENT ON FUNCTION books.search_books IS 'Busca libros por texto en el idioma especificado';

-- Grants
GRANT EXECUTE ON FUNCTION books.search_books(TEXT, TEXT, VARCHAR, books.difficulty_level, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION books.search_books(TEXT, TEXT, VARCHAR, books.difficulty_level, INTEGER, INTEGER) TO anon;

SELECT 'BOOKS: Función search_books creada' AS status;
