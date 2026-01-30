-- supabase/schemas/books/tables/book_authors.sql
-- ============================================================================
-- TABLA: book_authors
-- DESCRIPCIÓN: Relación muchos a muchos entre libros y autores
-- ============================================================================

SET search_path TO books, app, public;

CREATE TABLE IF NOT EXISTS books.book_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books.books(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES books.authors(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'author',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(book_id, author_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_book_authors_book ON books.book_authors(book_id);
CREATE INDEX IF NOT EXISTS idx_book_authors_author ON books.book_authors(author_id);
CREATE INDEX IF NOT EXISTS idx_book_authors_order ON books.book_authors(book_id, order_index);

COMMENT ON TABLE books.book_authors IS 'Relación entre libros y sus autores';
COMMENT ON COLUMN books.book_authors.role IS 'Rol del autor (author, illustrator, translator, editor)';
COMMENT ON COLUMN books.book_authors.order_index IS 'Orden de aparición del autor';

SELECT 'BOOKS: Tabla book_authors creada' AS status;
