-- supabase/schemas/books/functions/get_book_by_language.sql
-- ============================================================================
-- FUNCIÓN: get_book_by_language
-- DESCRIPCIÓN: Obtiene un libro con sus traducciones en el idioma especificado
-- ============================================================================

SET search_path TO books, app, public;

CREATE OR REPLACE FUNCTION books.get_book_by_language(
  p_book_id UUID,
  p_language_code TEXT DEFAULT 'es'
)
RETURNS TABLE (
  id UUID,
  slug VARCHAR,
  title VARCHAR,
  subtitle VARCHAR,
  description TEXT,
  summary TEXT,
  cover_url TEXT,
  difficulty books.difficulty_level,
  status books.book_status,
  estimated_read_time INTEGER,
  page_count INTEGER,
  is_featured BOOLEAN,
  is_premium BOOLEAN,
  category_id UUID,
  category_name VARCHAR,
  published_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_lang app.language_code;
BEGIN
  -- Convertir y validar language_code
  BEGIN
    v_lang := p_language_code::app.language_code;
  EXCEPTION WHEN OTHERS THEN
    v_lang := 'es'::app.language_code;
  END;

  RETURN QUERY
  SELECT
    b.id,
    b.slug,
    COALESCE(bt.title, bt_fallback.title, 'Sin título')::VARCHAR AS title,
    COALESCE(bt.subtitle, bt_fallback.subtitle)::VARCHAR AS subtitle,
    COALESCE(bt.description, bt_fallback.description) AS description,
    COALESCE(bt.summary, bt_fallback.summary) AS summary,
    COALESCE(bt.cover_url, bt_fallback.cover_url, b.cover_url) AS cover_url,
    b.difficulty,
    b.status,
    b.estimated_read_time,
    b.page_count,
    b.is_featured,
    b.is_premium,
    b.category_id,
    COALESCE(ct.name, ct_fallback.name, 'Sin categoría')::VARCHAR AS category_name,
    b.published_at
  FROM books.books b
  -- Traducción del libro en el idioma solicitado
  LEFT JOIN books.book_translations bt
    ON bt.book_id = b.id
    AND bt.language_code = v_lang
    AND bt.is_active = true
  -- Fallback a traducción primaria
  LEFT JOIN books.book_translations bt_fallback
    ON bt_fallback.book_id = b.id
    AND bt_fallback.is_primary = true
    AND bt_fallback.is_active = true
  -- Categoría
  LEFT JOIN books.categories c ON c.id = b.category_id
  -- Traducción de categoría en idioma solicitado
  LEFT JOIN books.category_translations ct
    ON ct.category_id = c.id
    AND ct.language_code = v_lang
    AND ct.is_active = true
  -- Fallback de categoría
  LEFT JOIN books.category_translations ct_fallback
    ON ct_fallback.category_id = c.id
    AND ct_fallback.language_code = 'es'::app.language_code
    AND ct_fallback.is_active = true
  WHERE b.id = p_book_id
    AND b.deleted_at IS NULL;
END;
$$;

COMMENT ON FUNCTION books.get_book_by_language IS 'Obtiene un libro con traducciones en el idioma especificado, con fallback al idioma primario';

-- Grants
GRANT EXECUTE ON FUNCTION books.get_book_by_language(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION books.get_book_by_language(UUID, TEXT) TO anon;

SELECT 'BOOKS: Función get_book_by_language creada' AS status;
