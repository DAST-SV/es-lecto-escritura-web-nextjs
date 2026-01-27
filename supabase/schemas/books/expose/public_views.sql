-- ======================================================
-- EXPONER SCHEMA BOOKS AL API REST
-- Archivo: expose/public_views.sql
-- Descripción: Crea vistas en public que exponen las tablas de books
-- ======================================================

-- ======================================================
-- VISTAS PARA EXPONER TABLAS DE CATÁLOGO
-- ======================================================

CREATE OR REPLACE VIEW public.book_types AS SELECT * FROM books.book_types;
CREATE OR REPLACE VIEW public.book_levels AS SELECT * FROM books.book_levels;
CREATE OR REPLACE VIEW public.book_categories AS SELECT * FROM books.book_categories;
CREATE OR REPLACE VIEW public.book_values AS SELECT * FROM books.book_values;
CREATE OR REPLACE VIEW public.book_genres AS SELECT * FROM books.book_genres;
CREATE OR REPLACE VIEW public.book_languages AS SELECT * FROM books.book_languages;
CREATE OR REPLACE VIEW public.book_tags AS SELECT * FROM books.book_tags;

-- ======================================================
-- VISTAS PARA EXPONER TABLAS PRINCIPALES
-- ======================================================

CREATE OR REPLACE VIEW public.book_authors AS SELECT * FROM books.book_authors;
CREATE OR REPLACE VIEW public.book_characters AS SELECT * FROM books.book_characters;
CREATE OR REPLACE VIEW public.books AS SELECT * FROM books.books;
CREATE OR REPLACE VIEW public.book_pages AS SELECT * FROM books.book_pages;

-- ======================================================
-- VISTAS PARA EXPONER TABLAS DE RELACIÓN
-- ======================================================

CREATE OR REPLACE VIEW public.books_authors AS SELECT * FROM books.books_authors;
CREATE OR REPLACE VIEW public.books_characters AS SELECT * FROM books.books_characters;
CREATE OR REPLACE VIEW public.books_categories AS SELECT * FROM books.books_categories;
CREATE OR REPLACE VIEW public.books_values AS SELECT * FROM books.books_values;
CREATE OR REPLACE VIEW public.books_genres AS SELECT * FROM books.books_genres;
CREATE OR REPLACE VIEW public.books_languages AS SELECT * FROM books.books_languages;
CREATE OR REPLACE VIEW public.books_tags AS SELECT * FROM books.books_tags;

-- ======================================================
-- VISTAS PARA AUDITORÍA/ANALYTICS
-- ======================================================

CREATE OR REPLACE VIEW public.book_audit_logs AS SELECT * FROM books.book_audit_logs;
CREATE OR REPLACE VIEW public.book_views AS SELECT * FROM books.book_views;

-- ======================================================
-- PERMISOS PARA LAS VISTAS
-- ======================================================

-- Permisos de lectura para todos (catálogos)
GRANT SELECT ON public.book_types TO anon, authenticated;
GRANT SELECT ON public.book_levels TO anon, authenticated;
GRANT SELECT ON public.book_categories TO anon, authenticated;
GRANT SELECT ON public.book_values TO anon, authenticated;
GRANT SELECT ON public.book_genres TO anon, authenticated;
GRANT SELECT ON public.book_languages TO anon, authenticated;
GRANT SELECT ON public.book_tags TO anon, authenticated;
GRANT SELECT ON public.book_authors TO anon, authenticated;
GRANT SELECT ON public.book_characters TO anon, authenticated;

-- Permisos de lectura/escritura para authenticated en tablas principales
GRANT SELECT, INSERT, UPDATE, DELETE ON public.books TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.book_pages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.books_authors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.books_characters TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.books_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.books_values TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.books_genres TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.books_languages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.books_tags TO authenticated;

-- Permisos especiales
GRANT SELECT, INSERT ON public.book_views TO anon, authenticated;
GRANT INSERT ON public.book_authors TO authenticated;
GRANT INSERT ON public.book_characters TO authenticated;

-- ======================================================
-- VERIFICACIÓN FINAL
-- ======================================================
DO $$
DECLARE
    tables_count INTEGER;
    views_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO tables_count
    FROM information_schema.tables
    WHERE table_schema = 'books'
    AND table_type = 'BASE TABLE';

    SELECT COUNT(*) INTO views_count
    FROM information_schema.views
    WHERE table_schema = 'public'
    AND table_name LIKE 'book%';

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ CONFIGURACIÓN COMPLETADA';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tablas en schema books: %', tables_count;
    RAISE NOTICE 'Vistas expuestas en public: %', views_count;
    RAISE NOTICE '========================================';
END $$;
