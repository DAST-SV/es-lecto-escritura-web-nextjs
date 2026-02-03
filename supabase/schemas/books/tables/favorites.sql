-- supabase/schemas/books/tables/favorites.sql
-- ============================================================================
-- TABLA: favorites
-- DESCRIPCIÓN: Libros favoritos de usuarios
-- ============================================================================

SET search_path TO books, app, public;

CREATE TABLE IF NOT EXISTS books.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books.books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(book_id, user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_favorites_book ON books.favorites(book_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON books.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created ON books.favorites(created_at DESC);

COMMENT ON TABLE books.favorites IS 'Libros marcados como favoritos';

SELECT 'BOOKS: Tabla favorites creada' AS status;
