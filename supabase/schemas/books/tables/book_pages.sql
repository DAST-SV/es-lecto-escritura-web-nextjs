-- ======================================================
-- Tabla: book_pages
-- Archivo: tables/book_pages.sql
-- ======================================================

SET search_path TO books, public;

CREATE TABLE book_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL,
    page_number SMALLINT NOT NULL,
    layout VARCHAR(50) NOT NULL DEFAULT 'standard',
    animation VARCHAR(50) NULL,
    title TEXT NULL,
    content TEXT NULL,
    image_url TEXT NULL,
    audio_url TEXT NULL,
    interactive_game VARCHAR(100) NULL,
    items JSONB NULL,
    background_url TEXT NULL,
    background_color VARCHAR(50) NULL,
    text_color VARCHAR(50) NULL,
    font VARCHAR(50) NULL,
    border_style VARCHAR(50) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_book_pages_book FOREIGN KEY (book_id)
        REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT uq_book_pages_book_page_number UNIQUE (book_id, page_number),
    CONSTRAINT chk_book_pages_page_number_positive CHECK (page_number > 0)
);

COMMENT ON TABLE book_pages IS 'Páginas individuales de cada libro';
COMMENT ON COLUMN book_pages.id IS 'Identificador único de la página';
COMMENT ON COLUMN book_pages.book_id IS 'Libro al que pertenece la página';
COMMENT ON COLUMN book_pages.page_number IS 'Número de orden de la página';
COMMENT ON COLUMN book_pages.layout IS 'Tipo de layout (ej: standard, full-image, split)';
COMMENT ON COLUMN book_pages.animation IS 'Tipo de animación aplicada';
COMMENT ON COLUMN book_pages.title IS 'Título de la página (opcional)';
COMMENT ON COLUMN book_pages.content IS 'Texto/contenido principal de la página';
COMMENT ON COLUMN book_pages.image_url IS 'URL de la imagen principal';
COMMENT ON COLUMN book_pages.audio_url IS 'URL del audio narrado';
COMMENT ON COLUMN book_pages.interactive_game IS 'Identificador del juego interactivo';
COMMENT ON COLUMN book_pages.items IS 'Elementos adicionales en formato JSON (ej: stickers, objetos interactivos)';
COMMENT ON COLUMN book_pages.background_url IS 'URL de la imagen de fondo';
COMMENT ON COLUMN book_pages.background_color IS 'Color de fondo en formato CSS';
COMMENT ON COLUMN book_pages.text_color IS 'Color del texto en formato CSS';
COMMENT ON COLUMN book_pages.font IS 'Fuente tipográfica (ej: Arial, Comic Sans)';
COMMENT ON COLUMN book_pages.border_style IS 'Estilo del borde en formato CSS';

CREATE INDEX idx_book_pages_book ON book_pages(book_id);
CREATE INDEX idx_book_pages_book_page_number ON book_pages(book_id, page_number);
CREATE INDEX idx_book_pages_items_gin ON book_pages USING gin(items);
