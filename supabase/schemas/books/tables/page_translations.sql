-- supabase/schemas/books/tables/page_translations.sql
-- ============================================================================
-- TABLA: page_translations
-- DESCRIPCIÓN: Contenido traducido de las páginas por idioma
-- ============================================================================

SET search_path TO books, app, public;

CREATE TABLE IF NOT EXISTS books.page_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES books.pages(id) ON DELETE CASCADE,
  language_code app.language_code NOT NULL,
  content TEXT NOT NULL,
  audio_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_id, language_code)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_page_trans_page ON books.page_translations(page_id);
CREATE INDEX IF NOT EXISTS idx_page_trans_lang ON books.page_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_page_trans_composite ON books.page_translations(page_id, language_code) WHERE is_active = true;

COMMENT ON TABLE books.page_translations IS 'Contenido de texto traducido de cada página';
COMMENT ON COLUMN books.page_translations.content IS 'Texto de la página en el idioma especificado';
COMMENT ON COLUMN books.page_translations.audio_url IS 'URL del audio de narración específico para este idioma';

SELECT 'BOOKS: Tabla page_translations creada' AS status;
