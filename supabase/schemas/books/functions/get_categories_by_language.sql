-- supabase/schemas/books/functions/get_categories_by_language.sql
-- ============================================================================
-- FUNCIÓN: get_categories_by_language
-- DESCRIPCIÓN: Obtiene todas las categorías en el idioma especificado
-- ============================================================================

SET search_path TO books, app, public;

CREATE OR REPLACE FUNCTION books.get_categories_by_language(
  p_language_code TEXT DEFAULT 'es'
)
RETURNS TABLE (
  id UUID,
  slug VARCHAR,
  name VARCHAR,
  description TEXT,
  icon VARCHAR,
  color VARCHAR,
  order_index INTEGER,
  book_count BIGINT
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
    c.id,
    c.slug,
    COALESCE(ct.name, ct_fallback.name, c.slug)::VARCHAR AS name,
    COALESCE(ct.description, ct_fallback.description) AS description,
    c.icon,
    c.color,
    c.order_index,
    COUNT(b.id) FILTER (WHERE b.status = 'published' AND b.deleted_at IS NULL) AS book_count
  FROM books.categories c
  -- Traducción en idioma solicitado
  LEFT JOIN books.category_translations ct
    ON ct.category_id = c.id
    AND ct.language_code = v_lang
    AND ct.is_active = true
  -- Fallback a español
  LEFT JOIN books.category_translations ct_fallback
    ON ct_fallback.category_id = c.id
    AND ct_fallback.language_code = 'es'::app.language_code
    AND ct_fallback.is_active = true
  -- Contar libros
  LEFT JOIN books.books b ON b.category_id = c.id
  WHERE c.deleted_at IS NULL
    AND c.is_active = true
  GROUP BY c.id, c.slug, c.icon, c.color, c.order_index, ct.name, ct.description, ct_fallback.name, ct_fallback.description
  ORDER BY c.order_index, c.slug;
END;
$$;

COMMENT ON FUNCTION books.get_categories_by_language IS 'Obtiene categorías con traducciones y conteo de libros';

-- Grants
GRANT EXECUTE ON FUNCTION books.get_categories_by_language(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION books.get_categories_by_language(TEXT) TO anon;

SELECT 'BOOKS: Función get_categories_by_language creada' AS status;
