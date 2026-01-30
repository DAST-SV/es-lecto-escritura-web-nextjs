-- supabase/schemas/books/tables/authors.sql
-- ============================================================================
-- TABLA: authors
-- DESCRIPCIÓN: Autores de libros
-- ============================================================================

SET search_path TO books, app, public;

CREATE TABLE IF NOT EXISTS books.authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(200) NOT NULL UNIQUE,
  avatar_url TEXT,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_authors_slug ON books.authors(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_authors_active ON books.authors(is_active) WHERE deleted_at IS NULL;

COMMENT ON TABLE books.authors IS 'Autores de libros - datos base';
COMMENT ON COLUMN books.authors.slug IS 'Identificador único para URLs';
COMMENT ON COLUMN books.authors.avatar_url IS 'URL de la imagen del autor';

SELECT 'BOOKS: Tabla authors creada' AS status;
