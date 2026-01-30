-- supabase/schemas/books/tables/author_translations.sql
-- ============================================================================
-- TABLA: author_translations
-- DESCRIPCIÓN: Traducciones de información de autores por idioma
-- ============================================================================

SET search_path TO books, app, public;

CREATE TABLE IF NOT EXISTS books.author_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES books.authors(id) ON DELETE CASCADE,
  language_code app.language_code NOT NULL,
  name VARCHAR(300) NOT NULL,
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(author_id, language_code)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_author_trans_author ON books.author_translations(author_id);
CREATE INDEX IF NOT EXISTS idx_author_trans_lang ON books.author_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_author_trans_composite ON books.author_translations(author_id, language_code) WHERE is_active = true;

COMMENT ON TABLE books.author_translations IS 'Traducciones de nombres y biografías de autores';
COMMENT ON COLUMN books.author_translations.name IS 'Nombre del autor (puede variar por idioma en algunos casos)';
COMMENT ON COLUMN books.author_translations.bio IS 'Biografía traducida del autor';

SELECT 'BOOKS: Tabla author_translations creada' AS status;
