-- ======================================================
-- FIX: Agregar columnas faltantes a tablas existentes
-- Ejecutar ANTES de SETUP_BOOKS_COMPLETO.sql si hay errores
-- ======================================================

-- Crear el ENUM si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'access_type' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'books')) THEN
        CREATE TYPE books.access_type AS ENUM ('public', 'freemium', 'premium', 'community');
    END IF;
END $$;

-- Agregar columna access_type a books si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'books'
        AND table_name = 'books'
        AND column_name = 'access_type'
    ) THEN
        ALTER TABLE books.books ADD COLUMN access_type books.access_type NOT NULL DEFAULT 'public';
    END IF;
END $$;

-- Agregar columna free_pages_count a books si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'books'
        AND table_name = 'books'
        AND column_name = 'free_pages_count'
    ) THEN
        ALTER TABLE books.books ADD COLUMN free_pages_count SMALLINT DEFAULT 5;
    END IF;
END $$;

-- Agregar columna access_level a book_pages si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'books'
        AND table_name = 'book_pages'
        AND column_name = 'access_level'
    ) THEN
        ALTER TABLE books.book_pages ADD COLUMN access_level books.access_type DEFAULT 'public';
    END IF;
END $$;

SELECT 'FIX aplicado correctamente' AS resultado;
