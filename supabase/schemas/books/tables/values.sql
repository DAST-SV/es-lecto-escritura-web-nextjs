-- supabase/schemas/books/tables/values.sql
-- ============================================================================
-- TABLA: values
-- DESCRIPCIÓN: Valores educativos/morales de los libros (tabla base sin traducciones)
-- ============================================================================

SET search_path TO books, app, public;

CREATE TABLE IF NOT EXISTS books.values (
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
CREATE INDEX IF NOT EXISTS idx_values_slug ON books.values(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_values_active ON books.values(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_values_order ON books.values(order_index) WHERE deleted_at IS NULL AND is_active = true;

COMMENT ON TABLE books.values IS 'Valores educativos/morales - datos base';
COMMENT ON COLUMN books.values.slug IS 'Identificador único para URLs';
COMMENT ON COLUMN books.values.icon IS 'Nombre del ícono (ej: Heart, Star)';
COMMENT ON COLUMN books.values.color IS 'Color asociado (ej: #FF5733)';

SELECT 'BOOKS: Tabla values creada' AS status;
