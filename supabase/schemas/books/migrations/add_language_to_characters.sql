-- supabase/schemas/books/migrations/add_language_to_characters.sql
-- ============================================================================
-- MIGRACIÓN: Agregar soporte multi-idioma a book_characters
-- DESCRIPCIÓN: Los personajes ahora son traducibles por idioma
-- ============================================================================

SET search_path TO books, app, public;

-- Agregar columna language_code si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'books'
    AND table_name = 'book_characters'
    AND column_name = 'language_code'
  ) THEN
    ALTER TABLE books.book_characters
    ADD COLUMN language_code VARCHAR(10) NOT NULL DEFAULT 'es' REFERENCES app.languages(code);

    COMMENT ON COLUMN books.book_characters.language_code IS 'Código de idioma para traducciones de personajes';
  END IF;
END $$;

-- Actualizar índice para incluir idioma
DROP INDEX IF EXISTS books.idx_book_characters_book;
CREATE INDEX IF NOT EXISTS idx_book_characters_book_lang ON books.book_characters(book_id, language_code);

-- Crear índice único para evitar duplicados
DROP INDEX IF EXISTS books.idx_book_characters_unique;
CREATE UNIQUE INDEX IF NOT EXISTS idx_book_characters_unique
ON books.book_characters(book_id, language_code, name);

SELECT 'BOOKS: Migración de book_characters con soporte multi-idioma completada' AS status;
