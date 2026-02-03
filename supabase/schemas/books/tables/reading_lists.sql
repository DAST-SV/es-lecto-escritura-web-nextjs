-- supabase/schemas/books/tables/reading_lists.sql
-- ============================================================================
-- TABLA: reading_lists
-- DESCRIPCIÓN: Listas de lectura creadas por usuarios
-- ============================================================================

SET search_path TO books, app, public;

CREATE TABLE IF NOT EXISTS books.reading_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_reading_lists_user ON books.reading_lists(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reading_lists_public ON books.reading_lists(is_public) WHERE deleted_at IS NULL;

COMMENT ON TABLE books.reading_lists IS 'Listas de lectura personalizadas';
COMMENT ON COLUMN books.reading_lists.is_default IS 'Lista por defecto del usuario';

-- ============================================================================
-- TABLA: reading_list_books
-- DESCRIPCIÓN: Libros en listas de lectura
-- ============================================================================

CREATE TABLE IF NOT EXISTS books.reading_list_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reading_list_id UUID NOT NULL REFERENCES books.reading_lists(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books.books(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reading_list_id, book_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_reading_list_books_list ON books.reading_list_books(reading_list_id);
CREATE INDEX IF NOT EXISTS idx_reading_list_books_book ON books.reading_list_books(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_list_books_order ON books.reading_list_books(reading_list_id, order_index);

COMMENT ON TABLE books.reading_list_books IS 'Relación libros en listas de lectura';

SELECT 'BOOKS: Tablas reading_lists y reading_list_books creadas' AS status;
