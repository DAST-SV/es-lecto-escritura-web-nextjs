-- supabase/schemas/books/tables/book_genres.sql
-- ============================================================================
-- TABLA: book_genres
-- DESCRIPCIÓN: Relación muchos-a-muchos entre libros y géneros
-- ============================================================================

SET search_path TO books, app, public;

CREATE TABLE IF NOT EXISTS books.book_genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books.books(id) ON DELETE CASCADE,
  genre_id UUID NOT NULL REFERENCES books.genres(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(book_id, genre_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_book_genres_book ON books.book_genres(book_id);
CREATE INDEX IF NOT EXISTS idx_book_genres_genre ON books.book_genres(genre_id);
CREATE INDEX IF NOT EXISTS idx_book_genres_primary ON books.book_genres(is_primary) WHERE is_primary = true;

COMMENT ON TABLE books.book_genres IS 'Relación libros-géneros';
COMMENT ON COLUMN books.book_genres.is_primary IS 'Indica si es el género principal del libro';

SELECT 'BOOKS: Tabla book_genres creada' AS status;
