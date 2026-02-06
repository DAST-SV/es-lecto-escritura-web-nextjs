-- supabase/schemas/books/functions/get_books_by_category.sql
-- ============================================================================
-- FUNCIÓN: get_books_by_category
-- DESCRIPCIÓN: Obtiene libros de una categoría en el idioma especificado
-- ============================================================================

SET search_path TO books, app, public;

CREATE OR REPLACE FUNCTION books.get_books_by_category(
  p_category_slug VARCHAR,
  p_language_code TEXT DEFAULT 'es',
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_status books.book_status DEFAULT 'published'
)
RETURNS TABLE (
  id UUID,
  slug VARCHAR,
  title VARCHAR,
  subtitle VARCHAR,
  summary TEXT,
  cover_url TEXT,
  difficulty books.difficulty_level,
  estimated_read_time INTEGER,
  page_count INTEGER,
  is_featured BOOLEAN,
  is_premium BOOLEAN,
  published_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_lang app.language_code;
  v_category_id UUID;
BEGIN
  -- Convertir y validar language_code
  BEGIN
    v_lang := p_language_code::app.language_code;
  EXCEPTION WHEN OTHERS THEN
    v_lang := 'es'::app.language_code;
  END;

  -- Obtener category_id
  SELECT c.id INTO v_category_id
  FROM books.categories c
  WHERE c.slug = p_category_slug
    AND c.deleted_at IS NULL
    AND c.is_active = true;

  IF v_category_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    b.id,
    b.slug,
    COALESCE(bt.title, bt_fallback.title, 'Sin título')::VARCHAR AS title,
    COALESCE(bt.subtitle, bt_fallback.subtitle)::VARCHAR AS subtitle,
    COALESCE(bt.summary, bt_fallback.summary) AS summary,
    COALESCE(bt.cover_url, bt_fallback.cover_url, b.cover_url) AS cover_url,
    b.difficulty,
    b.estimated_read_time,
    b.page_count,
    b.is_featured,
    b.is_premium,
    b.published_at
  FROM books.books b
  -- Traducción en idioma solicitado
  LEFT JOIN books.book_translations bt
    ON bt.book_id = b.id
    AND bt.language_code = v_lang
    AND bt.is_active = true
  -- Fallback a traducción primaria
  LEFT JOIN books.book_translations bt_fallback
    ON bt_fallback.book_id = b.id
    AND bt_fallback.is_primary = true
    AND bt_fallback.is_active = true
  WHERE b.category_id = v_category_id
    AND b.deleted_at IS NULL
    AND b.status = p_status
  ORDER BY b.is_featured DESC, b.published_at DESC NULLS LAST
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

COMMENT ON FUNCTION books.get_books_by_category IS 'Obtiene libros de una categoría con traducciones en el idioma especificado';

-- Grants
GRANT EXECUTE ON FUNCTION books.get_books_by_category(VARCHAR, TEXT, INTEGER, INTEGER, books.book_status) TO authenticated;
GRANT EXECUTE ON FUNCTION books.get_books_by_category(VARCHAR, TEXT, INTEGER, INTEGER, books.book_status) TO anon;

SELECT 'BOOKS: Función get_books_by_category creada' AS status;
