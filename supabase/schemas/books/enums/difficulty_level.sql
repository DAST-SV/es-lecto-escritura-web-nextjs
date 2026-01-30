-- supabase/schemas/books/enums/difficulty_level.sql
-- ============================================================================
-- ENUM: difficulty_level
-- DESCRIPCIÓN: Niveles de dificultad de lectura
-- ============================================================================

SET search_path TO books, app, public;

DO $$ BEGIN
  CREATE TYPE books.difficulty_level AS ENUM (
    'beginner',      -- Principiante (3-5 años)
    'elementary',    -- Elemental (6-8 años)
    'intermediate',  -- Intermedio (9-11 años)
    'advanced'       -- Avanzado (12+ años)
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE books.difficulty_level IS 'Niveles de dificultad de lectura para libros';

SELECT 'BOOKS: Enum difficulty_level creado' AS status;
