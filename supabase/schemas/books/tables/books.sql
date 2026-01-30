-- supabase/schemas/books/tables/books.sql
-- ============================================================================
-- TABLA: books
-- DESCRIPCIÓN: Libros - tabla principal (datos base sin traducciones)
-- ============================================================================

SET search_path TO books, app, public;

CREATE TABLE IF NOT EXISTS books.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(300) NOT NULL UNIQUE,
  category_id UUID NOT NULL REFERENCES books.categories(id) ON DELETE RESTRICT,
  cover_url TEXT,
  difficulty books.difficulty_level DEFAULT 'beginner',
  status books.book_status DEFAULT 'draft',
  estimated_read_time INTEGER DEFAULT 5,
  page_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_books_slug ON books.books(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_books_category ON books.books(category_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_books_status ON books.books(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_books_difficulty ON books.books(difficulty) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_books_featured ON books.books(is_featured) WHERE deleted_at IS NULL AND status = 'published';
CREATE INDEX IF NOT EXISTS idx_books_published ON books.books(published_at DESC) WHERE deleted_at IS NULL AND status = 'published';
CREATE INDEX IF NOT EXISTS idx_books_created_by ON books.books(created_by) WHERE deleted_at IS NULL;

COMMENT ON TABLE books.books IS 'Libros - datos base sin traducciones';
COMMENT ON COLUMN books.books.slug IS 'Identificador único para URLs (generado del título en idioma base)';
COMMENT ON COLUMN books.books.estimated_read_time IS 'Tiempo estimado de lectura en minutos';
COMMENT ON COLUMN books.books.page_count IS 'Número total de páginas';

SELECT 'BOOKS: Tabla books creada' AS status;
