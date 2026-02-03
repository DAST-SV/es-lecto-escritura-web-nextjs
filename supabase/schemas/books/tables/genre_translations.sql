-- supabase/schemas/books/tables/genre_translations.sql
-- ============================================================================
-- TABLA: genre_translations
-- DESCRIPCIÓN: Traducciones de géneros literarios
-- ============================================================================

SET search_path TO books, app, public;

CREATE TABLE IF NOT EXISTS books.genre_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  genre_id UUID NOT NULL REFERENCES books.genres(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(genre_id, language_code)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_genre_trans_genre ON books.genre_translations(genre_id);
CREATE INDEX IF NOT EXISTS idx_genre_trans_lang ON books.genre_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_genre_trans_active ON books.genre_translations(is_active);

COMMENT ON TABLE books.genre_translations IS 'Traducciones de géneros por idioma';

SELECT 'BOOKS: Tabla genre_translations creada' AS status;
