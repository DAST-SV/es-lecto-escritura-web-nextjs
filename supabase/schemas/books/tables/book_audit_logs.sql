-- ======================================================
-- Tabla: book_audit_logs
-- Archivo: tables/book_audit_logs.sql
-- ======================================================

SET search_path TO books, public;

CREATE TABLE book_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL,
    old_data JSONB NULL,
    new_data JSONB NULL,
    user_id UUID NULL,
    ip_address INET NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_action CHECK (action IN ('INSERT', 'UPDATE', 'DELETE'))
);

COMMENT ON TABLE book_audit_logs IS 'Registro de auditoría para cambios importantes en el sistema';

CREATE INDEX idx_book_audit_logs_table_record ON book_audit_logs(table_name, record_id);
CREATE INDEX idx_book_audit_logs_user ON book_audit_logs(user_id);
CREATE INDEX idx_book_audit_logs_created_at ON book_audit_logs(created_at DESC);
