-- ======================================================
-- ARCHIVO: 05_expose_books_schema.sql
-- DESCRIPCIÓN: Expone las tablas del schema 'books' al API REST de Supabase
-- 
-- IMPORTANTE: Ejecutar esto DESPUÉS de crear todas las tablas
-- ======================================================

-- ======================================================
-- OPCIÓN 1: Añadir 'books' al search_path de la API
-- (Esta es la forma más limpia)
-- ======================================================

-- Esto debe configurarse en el Dashboard de Supabase:
-- Project Settings > Database > Database Settings
-- En "Schema" añadir: public, books

-- O ejecutar esto (puede requerir permisos de superusuario):
-- ALTER DATABASE postgres SET search_path TO public, books;

-- ======================================================
-- OPCIÓN 2: Crear vistas en schema public que exponen las tablas
-- (Funciona siempre, incluso sin cambiar configuración)
-- ======================================================

-- Exponer tablas de catálogo
CREATE OR REPLACE VIEW public.book_types AS SELECT * FROM books.book_types;
CREATE OR REPLACE VIEW public.book_levels AS SELECT * FROM books.book_levels;
CREATE OR REPLACE VIEW public.book_categories AS SELECT * FROM books.book_categories;
CREATE OR REPLACE VIEW public.book_values AS SELECT * FROM books.book_values;
CREATE OR REPLACE VIEW public.book_genres AS SELECT * FROM books.book_genres;
CREATE OR REPLACE VIEW public.book_languages AS SELECT * FROM books.book_languages;
CREATE OR REPLACE VIEW public.book_tags AS SELECT * FROM books.book_tags;

-- Exponer tablas principales
CREATE OR REPLACE VIEW public.book_authors AS SELECT * FROM books.book_authors;
CREATE OR REPLACE VIEW public.book_characters AS SELECT * FROM books.book_characters;
CREATE OR REPLACE VIEW public.books AS SELECT * FROM books.books;
CREATE OR REPLACE VIEW public.book_pages AS SELECT * FROM books.book_pages;

-- Exponer tablas de relación
CREATE OR REPLACE VIEW public.books_authors AS SELECT * FROM books.books_authors;
CREATE OR REPLACE VIEW public.books_characters AS SELECT * FROM books.books_characters;
CREATE OR REPLACE VIEW public.books_categories AS SELECT * FROM books.books_categories;
CREATE OR REPLACE VIEW public.books_values AS SELECT * FROM books.books_values;
CREATE OR REPLACE VIEW public.books_genres AS SELECT * FROM books.books_genres;
CREATE OR REPLACE VIEW public.books_languages AS SELECT * FROM books.books_languages;
CREATE OR REPLACE VIEW public.books_tags AS SELECT * FROM books.books_tags;

-- Exponer tablas de auditoría/analytics
CREATE OR REPLACE VIEW public.book_audit_logs AS SELECT * FROM books.book_audit_logs;
CREATE OR REPLACE VIEW public.book_views AS SELECT * FROM books.book_views;

-- ======================================================
-- PERMISOS PARA LAS VISTAS
-- ======================================================

-- Permisos de lectura para todos
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
-- NOTA SOBRE EL BUCKET DE STORAGE
-- ======================================================
-- El bucket 'book-images' debe crearse MANUALMENTE en el Dashboard:
-- 
-- 1. Ve a Storage en el Dashboard de Supabase
-- 2. Click en "New Bucket"
-- 3. Nombre: book-images
-- 4. Marca "Public bucket"
-- 5. En Policies, añade:
--
--    Para SELECT (lectura pública):
--    - Allow read access to everyone
--    - Policy: true
--
--    Para INSERT/UPDATE/DELETE (usuarios autenticados):
--    - Allow insert for authenticated users to their own folder
--    - Policy: (storage.foldername(name))[1] = auth.uid()::text
--
-- O puedes ejecutar estos comandos SQL si tienes acceso:

-- Crear bucket (requiere service_role o acceso directo)
DO $$
BEGIN
    -- Intentar crear el bucket si no existe
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'book-images',
        'book-images',
        true,
        5242880, -- 5MB
        ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE '✅ Bucket book-images verificado/creado';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ No se pudo crear bucket automáticamente. Créalo manualmente en el Dashboard.';
END $$;

-- ======================================================
-- VERIFICACIÓN FINAL
-- ======================================================
DO $$
DECLARE
    tables_count INTEGER;
    views_count INTEGER;
BEGIN
    -- Contar tablas en schema books
    SELECT COUNT(*) INTO tables_count
    FROM information_schema.tables
    WHERE table_schema = 'books'
    AND table_type = 'BASE TABLE';
    
    -- Contar vistas en public que empiezan con book
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
    RAISE NOTICE '';
    RAISE NOTICE '📋 PRÓXIMOS PASOS:';
    RAISE NOTICE '1. Verificar que el bucket book-images existe en Storage';
    RAISE NOTICE '2. Configurar las políticas de Storage si es necesario';
    RAISE NOTICE '3. Probar la creación de un libro desde la aplicación';
    RAISE NOTICE '========================================';
END $$;