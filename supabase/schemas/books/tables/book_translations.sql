-- supabase/schemas/books/tables/book_translations.sql
-- ============================================================================
-- TABLA: book_translations
-- DESCRIPCIÓN: Traducciones de libros por idioma (título, descripción, etc.)
-- ============================================================================

SET search_path TO books, app, public;

CREATE TABLE IF NOT EXISTS books.book_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books.books(id) ON DELETE CASCADE,
  language_code app.language_code NOT NULL,
  title VARCHAR(500) NOT NULL,
  subtitle VARCHAR(500),
  description TEXT,
  summary TEXT,
  keywords TEXT[],
  pdf_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(book_id, language_code)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_book_trans_book ON books.book_translations(book_id);
CREATE INDEX IF NOT EXISTS idx_book_trans_lang ON books.book_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_book_trans_composite ON books.book_translations(book_id, language_code) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_book_trans_primary ON books.book_translations(book_id) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_book_trans_title ON books.book_translations USING gin(to_tsvector('spanish', title));

COMMENT ON TABLE books.book_translations IS 'Traducciones de títulos y descripciones de libros';
COMMENT ON COLUMN books.book_translations.title IS 'Título del libro en el idioma especificado';
COMMENT ON COLUMN books.book_translations.subtitle IS 'Subtítulo opcional';
COMMENT ON COLUMN books.book_translations.description IS 'Descripción completa del libro';
COMMENT ON COLUMN books.book_translations.summary IS 'Resumen corto para previews';
COMMENT ON COLUMN books.book_translations.keywords IS 'Palabras clave para búsqueda';
COMMENT ON COLUMN books.book_translations.pdf_url IS 'URL del PDF del libro en este idioma (almacenado en bucket book-pdfs)';
COMMENT ON COLUMN books.book_translations.is_primary IS 'Indica si es el idioma original del libro';

SELECT 'BOOKS: Tabla book_translations creada' AS status;
