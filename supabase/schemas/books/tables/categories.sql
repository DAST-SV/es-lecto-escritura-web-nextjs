-- supabase/schemas/books/tables/categories.sql
-- ============================================================================
-- TABLA: categories
-- DESCRIPCIÓN: Categorías de libros (tabla base sin traducciones)
-- ============================================================================

SET search_path TO books, app, public;

CREATE TABLE IF NOT EXISTS books.categories (
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
CREATE INDEX IF NOT EXISTS idx_categories_slug ON books.categories(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_categories_active ON books.categories(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_categories_order ON books.categories(order_index) WHERE deleted_at IS NULL AND is_active = true;

COMMENT ON TABLE books.categories IS 'Categorías de libros - datos base';
COMMENT ON COLUMN books.categories.slug IS 'Identificador único para URLs y referencias';
COMMENT ON COLUMN books.categories.icon IS 'Nombre del ícono (ej: BookOpen, Sparkles)';
COMMENT ON COLUMN books.categories.color IS 'Color asociado (ej: #FF5733)';

SELECT 'BOOKS: Tabla categories creada' AS status;
