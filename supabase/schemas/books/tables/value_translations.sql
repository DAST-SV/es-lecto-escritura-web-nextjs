-- supabase/schemas/books/tables/value_translations.sql
-- ============================================================================
-- TABLA: value_translations
-- DESCRIPCIÓN: Traducciones de valores educativos
-- ============================================================================

SET search_path TO books, app, public;

CREATE TABLE IF NOT EXISTS books.value_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value_id UUID NOT NULL REFERENCES books.values(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(value_id, language_code)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_value_trans_value ON books.value_translations(value_id);
CREATE INDEX IF NOT EXISTS idx_value_trans_lang ON books.value_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_value_trans_active ON books.value_translations(is_active);

COMMENT ON TABLE books.value_translations IS 'Traducciones de valores educativos por idioma';

SELECT 'BOOKS: Tabla value_translations creada' AS status;
