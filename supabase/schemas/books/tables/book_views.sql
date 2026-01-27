-- ======================================================
-- Tabla: book_views
-- Archivo: tables/book_views.sql
-- ======================================================

SET search_path TO books, public;

CREATE TABLE book_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL,
    user_id UUID NULL,
    session_id UUID NULL,
    page_number SMALLINT NULL,
    view_duration INTEGER NULL,
    device_type VARCHAR(50) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_book_views_book FOREIGN KEY (book_id)
        REFERENCES books(id) ON DELETE CASCADE
);

COMMENT ON TABLE book_views IS 'Registro de visualizaciones de libros para analytics';
COMMENT ON COLUMN book_views.view_duration IS 'Duración de la visualización en segundos';

CREATE INDEX idx_book_views_book ON book_views(book_id);
CREATE INDEX idx_book_views_user ON book_views(user_id);
CREATE INDEX idx_book_views_created_at ON book_views(created_at DESC);
