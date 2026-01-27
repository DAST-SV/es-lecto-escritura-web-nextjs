-- ======================================================
-- Función: validate_book_for_publishing
-- Archivo: functions/validate_publishing.sql
-- Descripción: Valida requisitos antes de publicar un libro
-- ======================================================

SET search_path TO books, public;

CREATE OR REPLACE FUNCTION validate_book_for_publishing()
RETURNS TRIGGER AS $$
DECLARE
    page_count INTEGER;
    has_cover BOOLEAN;
BEGIN
    -- Solo validar si se está intentando publicar
    IF NEW.is_published = TRUE AND (OLD.is_published = FALSE OR OLD.is_published IS NULL) THEN

        -- Verificar que tenga al menos una página
        SELECT COUNT(*) INTO page_count FROM book_pages WHERE book_id = NEW.id;

        IF page_count = 0 THEN
            RAISE EXCEPTION 'No se puede publicar un libro sin páginas';
        END IF;

        -- Verificar que tenga portada
        has_cover := NEW.cover_url IS NOT NULL AND LENGTH(NEW.cover_url) > 0;

        IF NOT has_cover THEN
            RAISE EXCEPTION 'No se puede publicar un libro sin portada';
        END IF;

        -- Verificar que tenga título
        IF NEW.title IS NULL OR LENGTH(TRIM(NEW.title)) = 0 THEN
            RAISE EXCEPTION 'No se puede publicar un libro sin título';
        END IF;

        -- Establecer fecha de publicación
        NEW.published_at := NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_book_for_publishing IS 'Valida que un libro cumpla requisitos mínimos antes de publicarse';
