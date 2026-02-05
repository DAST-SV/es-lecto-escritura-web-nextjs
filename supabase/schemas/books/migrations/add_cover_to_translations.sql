-- supabase/schemas/books/migrations/add_cover_to_translations.sql
-- ============================================================================
-- MIGRACIÓN: Agregar portada por idioma a book_translations
-- DESCRIPCIÓN: Las portadas ahora son traducibles (pueden tener texto)
-- ============================================================================

SET search_path TO books, app, public;

-- Agregar columna cover_url a book_translations si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'books'
    AND table_name = 'book_translations'
    AND column_name = 'cover_url'
  ) THEN
    ALTER TABLE books.book_translations
    ADD COLUMN cover_url TEXT;

    COMMENT ON COLUMN books.book_translations.cover_url IS 'URL de la portada del libro en este idioma (puede tener texto traducido)';
  END IF;
END $$;

SELECT 'BOOKS: Migración de book_translations con cover_url completada' AS status;
