-- ======================================================
-- Función: cleanup_old_audit_logs
-- Archivo: functions/cleanup_audit_logs.sql
-- Descripción: Limpia registros de auditoría antiguos
-- ======================================================

SET search_path TO books, public;

CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM book_audit_logs
    WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_audit_logs IS 'Elimina registros de auditoría más antiguos que X días';
