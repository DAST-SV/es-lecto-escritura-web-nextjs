-- supabase/schemas/books/tables/book_tags.sql
-- ============================================================================
-- TABLA: book_tags
-- DESCRIPCIÓN: Relación muchos-a-muchos entre libros y etiquetas
-- ============================================================================

SET search_path TO books, app, public;

CREATE TABLE IF NOT EXISTS books.book_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books.books(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES books.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(book_id, tag_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_book_tags_book ON books.book_tags(book_id);
CREATE INDEX IF NOT EXISTS idx_book_tags_tag ON books.book_tags(tag_id);

COMMENT ON TABLE books.book_tags IS 'Relación libros-etiquetas';

SELECT 'BOOKS: Tabla book_tags creada' AS status;
