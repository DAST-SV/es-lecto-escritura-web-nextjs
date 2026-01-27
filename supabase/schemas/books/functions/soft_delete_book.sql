-- ======================================================
-- Función: soft_delete_book
-- Archivo: functions/soft_delete_book.sql
-- Descripción: Elimina lógicamente un libro
-- ======================================================

SET search_path TO books, public;

CREATE OR REPLACE FUNCTION soft_delete_book(book_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE books
    SET deleted_at = NOW(),
        deleted_by = auth.uid()
    WHERE id = book_uuid
    AND user_id = auth.uid()
    AND deleted_at IS NULL;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION soft_delete_book IS 'Elimina lógicamente un libro sin borrarlo de la BD';
