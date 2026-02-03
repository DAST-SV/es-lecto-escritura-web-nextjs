-- supabase/schemas/books/tables/genres.sql
-- ============================================================================
-- TABLA: genres
-- DESCRIPCIÓN: Géneros literarios (tabla base sin traducciones)
-- ============================================================================

SET search_path TO books, app, public;

CREATE TABLE IF NOT EXISTS books.genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50),
  color VARCHAR(20),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_genres_slug ON books.genres(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_genres_active ON books.genres(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_genres_order ON books.genres(order_index) WHERE deleted_at IS NULL AND is_active = true;

COMMENT ON TABLE books.genres IS 'Géneros literarios - datos base';
COMMENT ON COLUMN books.genres.slug IS 'Identificador único para URLs';
COMMENT ON COLUMN books.genres.icon IS 'Nombre del ícono';
COMMENT ON COLUMN books.genres.color IS 'Color asociado';

SELECT 'BOOKS: Tabla genres creada' AS status;
