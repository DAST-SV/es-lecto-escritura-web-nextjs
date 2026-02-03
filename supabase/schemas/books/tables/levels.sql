-- supabase/schemas/books/tables/levels.sql
-- ============================================================================
-- TABLA: levels
-- DESCRIPCIÓN: Niveles de lectura (tabla base sin traducciones)
-- ============================================================================

SET search_path TO books, app, public;

CREATE TABLE IF NOT EXISTS books.levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) NOT NULL UNIQUE,
  min_age INTEGER NOT NULL,
  max_age INTEGER NOT NULL,
  grade_min INTEGER,
  grade_max INTEGER,
  color VARCHAR(20),
  icon VARCHAR(50),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT levels_age_range CHECK (min_age <= max_age),
  CONSTRAINT levels_grade_range CHECK (grade_min IS NULL OR grade_max IS NULL OR grade_min <= grade_max)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_levels_slug ON books.levels(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_levels_active ON books.levels(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_levels_order ON books.levels(order_index) WHERE deleted_at IS NULL AND is_active = true;
CREATE INDEX IF NOT EXISTS idx_levels_age ON books.levels(min_age, max_age) WHERE deleted_at IS NULL;

COMMENT ON TABLE books.levels IS 'Niveles de lectura por edad/grado';
COMMENT ON COLUMN books.levels.min_age IS 'Edad mínima recomendada';
COMMENT ON COLUMN books.levels.max_age IS 'Edad máxima recomendada';
COMMENT ON COLUMN books.levels.grade_min IS 'Grado escolar mínimo (opcional)';
COMMENT ON COLUMN books.levels.grade_max IS 'Grado escolar máximo (opcional)';

SELECT 'BOOKS: Tabla levels creada' AS status;
