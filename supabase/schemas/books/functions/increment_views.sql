-- ======================================================
-- Función: increment_book_views
-- Archivo: functions/increment_views.sql
-- Descripción: Incrementa el contador de vistas
-- ======================================================

SET search_path TO books, public;

CREATE OR REPLACE FUNCTION increment_book_views(book_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE books
    SET view_count = view_count + 1
    WHERE id = book_uuid
    AND is_published = TRUE
    AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_book_views IS 'Incrementa el contador de vistas de un libro';
