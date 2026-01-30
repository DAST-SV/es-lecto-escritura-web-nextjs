-- supabase/schemas/books/functions/get_book_pages.sql
-- ============================================================================
-- FUNCIÓN: get_book_pages
-- DESCRIPCIÓN: Obtiene las páginas de un libro en el idioma especificado
-- ============================================================================

SET search_path TO books, app, public;

CREATE OR REPLACE FUNCTION books.get_book_pages(
  p_book_id UUID,
  p_language_code TEXT DEFAULT 'es'
)
RETURNS TABLE (
  id UUID,
  page_number INTEGER,
  content TEXT,
  image_url TEXT,
  audio_url TEXT,
  has_interaction BOOLEAN,
  interaction_type VARCHAR,
  interaction_data JSONB
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
    p.id,
    p.page_number,
    COALESCE(pt.content, pt_fallback.content, '') AS content,
    p.image_url,
    COALESCE(pt.audio_url, p.audio_url) AS audio_url,
    p.has_interaction,
    p.interaction_type,
    p.interaction_data
  FROM books.pages p
  -- Traducción en idioma solicitado
  LEFT JOIN books.page_translations pt
    ON pt.page_id = p.id
    AND pt.language_code = v_lang
    AND pt.is_active = true
  -- Fallback a español
  LEFT JOIN books.page_translations pt_fallback
    ON pt_fallback.page_id = p.id
    AND pt_fallback.language_code = 'es'::app.language_code
    AND pt_fallback.is_active = true
  WHERE p.book_id = p_book_id
  ORDER BY p.page_number;
END;
$$;

COMMENT ON FUNCTION books.get_book_pages IS 'Obtiene las páginas de un libro con contenido en el idioma especificado';

-- Grants
GRANT EXECUTE ON FUNCTION books.get_book_pages(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION books.get_book_pages(UUID, TEXT) TO anon;

SELECT 'BOOKS: Función get_book_pages creada' AS status;
