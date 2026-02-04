-- supabase/schemas/books/tables/book_values.sql
-- ============================================================================
-- TABLA: book_values
-- DESCRIPCIÓN: Relación muchos-a-muchos entre libros y valores educativos
-- ============================================================================

SET search_path TO books, app, public;

CREATE TABLE IF NOT EXISTS books.book_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books.books(id) ON DELETE CASCADE,
  value_id UUID NOT NULL REFERENCES books.values(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(book_id, value_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_book_values_book ON books.book_values(book_id);
CREATE INDEX IF NOT EXISTS idx_book_values_value ON books.book_values(value_id);

COMMENT ON TABLE books.book_values IS 'Relación libros-valores educativos';

SELECT 'BOOKS: Tabla book_values creada' AS status;
