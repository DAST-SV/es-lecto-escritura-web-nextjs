-- supabase/schemas/books/tables/book_ratings.sql
-- ============================================================================
-- TABLA: book_ratings
-- DESCRIPCIÓN: Calificaciones de libros por usuarios
-- ============================================================================

SET search_path TO books, app, public;

CREATE TABLE IF NOT EXISTS books.book_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books.books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(book_id, user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_book_ratings_book ON books.book_ratings(book_id);
CREATE INDEX IF NOT EXISTS idx_book_ratings_user ON books.book_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_book_ratings_rating ON books.book_ratings(rating);

COMMENT ON TABLE books.book_ratings IS 'Calificaciones de libros (1-5 estrellas)';
COMMENT ON COLUMN books.book_ratings.rating IS 'Calificación del 1 al 5';

SELECT 'BOOKS: Tabla book_ratings creada' AS status;
