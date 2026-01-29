-- =============================================
-- SISTEMA DE ACCESO A LIBROS
-- =============================================
-- Control granular de acceso a libros y páginas
-- Tipos: public, freemium, premium, community
-- =============================================

-- Tipo ENUM para niveles de acceso
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

-- Agregar columna free_pages_count a books para freemium (cuántas páginas son gratis)
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

-- Índice para filtrar por tipo de acceso
CREATE INDEX IF NOT EXISTS idx_books_access_type ON books.books(access_type);
CREATE INDEX IF NOT EXISTS idx_book_pages_access_level ON books.book_pages(access_level);

-- Comentarios
COMMENT ON COLUMN books.books.access_type IS 'Tipo de acceso: public (gratis), freemium (parcialmente gratis), premium (suscripción plataforma), community (suscripción comunidad del autor)';
COMMENT ON COLUMN books.books.free_pages_count IS 'Número de páginas gratuitas en modo freemium (por defecto 5)';
COMMENT ON COLUMN books.book_pages.access_level IS 'Nivel de acceso específico de la página (puede sobrescribir el del libro)';
