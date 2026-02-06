-- supabase/schemas/books/tables/book_characters.sql
-- ============================================================================
-- TABLA: book_characters
-- DESCRIPCION: Personajes de un libro por idioma (ingresados por el usuario)
-- ============================================================================

SET search_path TO books, app, public;

CREATE TABLE IF NOT EXISTS books.book_characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books.books(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL DEFAULT 'es' REFERENCES app.languages(code),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  role VARCHAR(50) DEFAULT 'main', -- main, secondary, supporting
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_book_characters_book_lang ON books.book_characters(book_id, language_code);
CREATE INDEX IF NOT EXISTS idx_book_characters_order ON books.book_characters(book_id, language_code, order_index);

-- Indice unico para evitar duplicados por idioma
CREATE UNIQUE INDEX IF NOT EXISTS idx_book_characters_unique
ON books.book_characters(book_id, language_code, name);

COMMENT ON TABLE books.book_characters IS 'Personajes del libro por idioma';
COMMENT ON COLUMN books.book_characters.language_code IS 'Codigo de idioma para traducciones de personajes';
COMMENT ON COLUMN books.book_characters.name IS 'Nombre del personaje';
COMMENT ON COLUMN books.book_characters.description IS 'Descripcion breve del personaje';
COMMENT ON COLUMN books.book_characters.role IS 'Rol del personaje: main (principal), secondary (secundario), supporting (de apoyo)';

SELECT 'BOOKS: Tabla book_characters creada' AS status;
