-- ======================================================
-- TRIGGERS
-- Archivo: triggers/all_triggers.sql
-- ======================================================

SET search_path TO books, public;

-- ==============================================
-- Trigger: updated_at para books
-- ==============================================
CREATE TRIGGER trigger_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- Trigger: auditoría para books
-- ==============================================
CREATE TRIGGER trigger_audit_books
    AFTER INSERT OR UPDATE OR DELETE ON books
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- ==============================================
-- Trigger: validación de publicación
-- ==============================================
CREATE TRIGGER trigger_validate_book_publishing
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION validate_book_for_publishing();
