-- supabase/schemas/books/enums/book_status.sql
-- ============================================================================
-- ENUM: book_status
-- DESCRIPCIÓN: Estados posibles de un libro
-- ============================================================================

SET search_path TO books, app, public;

DO $$ BEGIN
  CREATE TYPE books.book_status AS ENUM (
    'draft',      -- Borrador, no visible
    'pending',    -- Pendiente de revisión
    'published',  -- Publicado y visible
    'archived'    -- Archivado, no visible
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE books.book_status IS 'Estados posibles de un libro en el sistema';

SELECT 'BOOKS: Enum book_status creado' AS status;
