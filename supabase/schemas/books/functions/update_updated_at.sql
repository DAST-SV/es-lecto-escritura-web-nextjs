-- ======================================================
-- Función: update_updated_at_column
-- Archivo: functions/update_updated_at.sql
-- Descripción: Actualiza automáticamente el campo updated_at
-- ======================================================

SET search_path TO books, public;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Actualiza automáticamente el campo updated_at al modificar un registro';
