-- supabase/schemas/books/tables/book_characters.sql
-- ============================================================================
-- TABLA: book_characters
-- DESCRIPCIÓN: Personajes de un libro (ingresados por el usuario)
-- ============================================================================

SET search_path TO books, app, public;

CREATE TABLE IF NOT EXISTS books.book_characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books.books(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  role VARCHAR(50) DEFAULT 'main', -- main, secondary, supporting
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_book_characters_book ON books.book_characters(book_id);
CREATE INDEX IF NOT EXISTS idx_book_characters_order ON books.book_characters(book_id, order_index);

COMMENT ON TABLE books.book_characters IS 'Personajes del libro';
COMMENT ON COLUMN books.book_characters.name IS 'Nombre del personaje';
COMMENT ON COLUMN books.book_characters.description IS 'Descripción breve del personaje';
COMMENT ON COLUMN books.book_characters.role IS 'Rol del personaje: main (principal), secondary (secundario), supporting (de apoyo)';

SELECT 'BOOKS: Tabla book_characters creada' AS status;
