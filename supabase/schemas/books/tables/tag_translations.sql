-- supabase/schemas/books/tables/tag_translations.sql
-- ============================================================================
-- TABLA: tag_translations
-- DESCRIPCIÓN: Traducciones de etiquetas
-- ============================================================================

SET search_path TO books, app, public;

CREATE TABLE IF NOT EXISTS books.tag_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id UUID NOT NULL REFERENCES books.tags(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tag_id, language_code)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_tag_trans_tag ON books.tag_translations(tag_id);
CREATE INDEX IF NOT EXISTS idx_tag_trans_lang ON books.tag_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_tag_trans_active ON books.tag_translations(is_active);

COMMENT ON TABLE books.tag_translations IS 'Traducciones de etiquetas por idioma';

SELECT 'BOOKS: Tabla tag_translations creada' AS status;
