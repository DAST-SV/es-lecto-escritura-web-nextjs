-- supabase/schemas/books/triggers/update_page_count.sql
-- ============================================================================
-- TRIGGER: update_page_count
-- DESCRIPCIÓN: Actualiza automáticamente el conteo de páginas en books
-- ============================================================================

SET search_path TO books, app, public;

CREATE OR REPLACE FUNCTION books.update_book_page_count()
RETURNS TRIGGER AS $$
DECLARE
  v_book_id UUID;
  v_count INTEGER;
BEGIN
  -- Determinar book_id según la operación
  IF TG_OP = 'DELETE' THEN
    v_book_id := OLD.book_id;
  ELSE
    v_book_id := NEW.book_id;
  END IF;

  -- Contar páginas
  SELECT COUNT(*) INTO v_count
  FROM books.pages
  WHERE book_id = v_book_id;

  -- Actualizar libro
  UPDATE books.books
  SET page_count = v_count
  WHERE id = v_book_id;

  -- Retornar según operación
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger para INSERT
DROP TRIGGER IF EXISTS update_page_count_insert ON books.pages;
CREATE TRIGGER update_page_count_insert
  AFTER INSERT ON books.pages
  FOR EACH ROW
  EXECUTE FUNCTION books.update_book_page_count();

-- Trigger para DELETE
DROP TRIGGER IF EXISTS update_page_count_delete ON books.pages;
CREATE TRIGGER update_page_count_delete
  AFTER DELETE ON books.pages
  FOR EACH ROW
  EXECUTE FUNCTION books.update_book_page_count();

COMMENT ON FUNCTION books.update_book_page_count IS 'Mantiene sincronizado el conteo de páginas en la tabla books';

SELECT 'BOOKS: Trigger update_page_count creado' AS status;
