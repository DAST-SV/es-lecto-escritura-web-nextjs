-- supabase/schemas/books/tables/book_reviews.sql
-- ============================================================================
-- TABLA: book_reviews
-- DESCRIPCIÓN: Reseñas de libros por usuarios
-- ============================================================================

SET search_path TO books, app, public;

CREATE TABLE IF NOT EXISTS books.book_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books.books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200),
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(book_id, user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_book_reviews_book ON books.book_reviews(book_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_book_reviews_user ON books.book_reviews(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_book_reviews_approved ON books.book_reviews(is_approved) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_book_reviews_featured ON books.book_reviews(is_featured) WHERE deleted_at IS NULL AND is_approved = true;

COMMENT ON TABLE books.book_reviews IS 'Reseñas de libros';
COMMENT ON COLUMN books.book_reviews.is_approved IS 'Indica si la reseña fue aprobada por moderadores';
COMMENT ON COLUMN books.book_reviews.helpful_count IS 'Cantidad de votos "útil"';

SELECT 'BOOKS: Tabla book_reviews creada' AS status;
