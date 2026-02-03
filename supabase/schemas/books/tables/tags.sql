-- supabase/schemas/books/tables/tags.sql
-- ============================================================================
-- TABLA: tags
-- DESCRIPCIÓN: Etiquetas/tags para libros (tabla base sin traducciones)
-- ============================================================================

SET search_path TO books, app, public;

CREATE TABLE IF NOT EXISTS books.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_tags_slug ON books.tags(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tags_active ON books.tags(is_active) WHERE deleted_at IS NULL;

COMMENT ON TABLE books.tags IS 'Etiquetas para clasificar libros';
COMMENT ON COLUMN books.tags.slug IS 'Identificador único para URLs';

SELECT 'BOOKS: Tabla tags creada' AS status;
