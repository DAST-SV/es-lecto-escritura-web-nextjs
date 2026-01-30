-- supabase/schemas/books/tables/category_translations.sql
-- ============================================================================
-- TABLA: category_translations
-- DESCRIPCIÓN: Traducciones de categorías por idioma
-- ============================================================================

SET search_path TO books, app, public;

CREATE TABLE IF NOT EXISTS books.category_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES books.categories(id) ON DELETE CASCADE,
  language_code app.language_code NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, language_code)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_cat_trans_category ON books.category_translations(category_id);
CREATE INDEX IF NOT EXISTS idx_cat_trans_lang ON books.category_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_cat_trans_composite ON books.category_translations(category_id, language_code) WHERE is_active = true;

COMMENT ON TABLE books.category_translations IS 'Traducciones de nombres y descripciones de categorías';
COMMENT ON COLUMN books.category_translations.language_code IS 'Código de idioma (es, en, fr)';
COMMENT ON COLUMN books.category_translations.name IS 'Nombre traducido de la categoría';

SELECT 'BOOKS: Tabla category_translations creada' AS status;
