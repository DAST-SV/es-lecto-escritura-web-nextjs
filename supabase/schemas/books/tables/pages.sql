-- supabase/schemas/books/tables/pages.sql
-- ============================================================================
-- TABLA: pages
-- DESCRIPCIÓN: Páginas de libros (datos base sin contenido traducido)
-- ============================================================================

SET search_path TO books, app, public;

CREATE TABLE IF NOT EXISTS books.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books.books(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  image_url TEXT,
  audio_url TEXT,
  has_interaction BOOLEAN DEFAULT false,
  interaction_type VARCHAR(50),
  interaction_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(book_id, page_number)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_pages_book ON books.pages(book_id);
CREATE INDEX IF NOT EXISTS idx_pages_order ON books.pages(book_id, page_number);

COMMENT ON TABLE books.pages IS 'Páginas de libros - datos base';
COMMENT ON COLUMN books.pages.page_number IS 'Número de página (comenzando en 1)';
COMMENT ON COLUMN books.pages.image_url IS 'URL de la imagen de la página';
COMMENT ON COLUMN books.pages.audio_url IS 'URL del audio de narración (si existe)';
COMMENT ON COLUMN books.pages.interaction_type IS 'Tipo de interacción (quiz, drag_drop, etc.)';
COMMENT ON COLUMN books.pages.interaction_data IS 'Datos de configuración de la interacción';

SELECT 'BOOKS: Tabla pages creada' AS status;
