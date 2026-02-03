-- supabase/schemas/books/tables/level_translations.sql
-- ============================================================================
-- TABLA: level_translations
-- DESCRIPCIÓN: Traducciones de niveles de lectura
-- ============================================================================

SET search_path TO books, app, public;

CREATE TABLE IF NOT EXISTS books.level_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id UUID NOT NULL REFERENCES books.levels(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  age_label VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(level_id, language_code)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_level_trans_level ON books.level_translations(level_id);
CREATE INDEX IF NOT EXISTS idx_level_trans_lang ON books.level_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_level_trans_active ON books.level_translations(is_active);

COMMENT ON TABLE books.level_translations IS 'Traducciones de niveles por idioma';
COMMENT ON COLUMN books.level_translations.age_label IS 'Etiqueta de edad localizada (ej: "3-5 años")';

SELECT 'BOOKS: Tabla level_translations creada' AS status;
