-- supabase/CLEANUP_COMPLETO.sql
-- ============================================================================
-- CLEANUP COMPLETO - ES LECTO ESCRITURA
-- ============================================================================
-- Este script ELIMINA COMPLETAMENTE todos los objetos de la base de datos
-- para permitir una instalación limpia con SETUP_RAPIDO.sql
--
-- ADVERTENCIA: Este script eliminará TODOS los datos existentes
-- Ejecutar ANTES de SETUP_RAPIDO.sql si hay tablas existentes
-- ============================================================================

-- ============================================================================
-- PASO 1: DESACTIVAR TRIGGERS DE AUTH.USERS (para evitar conflictos)
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ============================================================================
-- PASO 2: ELIMINAR TODOS LOS OBJETOS CON CASCADE
-- ============================================================================
-- Usamos CASCADE para eliminar automáticamente dependencias
-- El orden es: Vistas -> Funciones -> Tablas -> Tipos

-- ============================================================================
-- ELIMINAR VISTAS
-- ============================================================================

DROP VIEW IF EXISTS public.books_full_info CASCADE;
DROP VIEW IF EXISTS books.books_full_info CASCADE;
DROP VIEW IF EXISTS books.v_book_statistics CASCADE;
DROP VIEW IF EXISTS public.v_book_statistics CASCADE;
DROP VIEW IF EXISTS app.v_organization_active_members CASCADE;
DROP VIEW IF EXISTS app.v_organization_stats CASCADE;
DROP VIEW IF EXISTS public.v_organization_active_members CASCADE;
DROP VIEW IF EXISTS public.v_organization_stats CASCADE;

-- ============================================================================
-- ELIMINAR FUNCIONES - SCHEMA BOOKS
-- ============================================================================

DROP FUNCTION IF EXISTS books.search_books CASCADE;
DROP FUNCTION IF EXISTS books.increment_book_views CASCADE;
DROP FUNCTION IF EXISTS books.update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS books.audit_trigger_function CASCADE;
DROP FUNCTION IF EXISTS books.validate_book_for_publishing CASCADE;
DROP FUNCTION IF EXISTS books.duplicate_book CASCADE;
DROP FUNCTION IF EXISTS books.soft_delete_book CASCADE;
DROP FUNCTION IF EXISTS books.cleanup_audit_logs CASCADE;
DROP FUNCTION IF EXISTS books.update_book_rating CASCADE;
DROP FUNCTION IF EXISTS books.refresh_book_statistics CASCADE;
DROP FUNCTION IF EXISTS books.record_page_view CASCADE;
DROP FUNCTION IF EXISTS books.start_reading_session CASCADE;
DROP FUNCTION IF EXISTS books.end_reading_session CASCADE;
DROP FUNCTION IF EXISTS books.update_user_progress CASCADE;

-- ============================================================================
-- ELIMINAR FUNCIONES - SCHEMA APP
-- ============================================================================

DROP FUNCTION IF EXISTS app.set_updated_at CASCADE;
DROP FUNCTION IF EXISTS app.get_user_primary_role CASCADE;
DROP FUNCTION IF EXISTS app.has_role CASCADE;
DROP FUNCTION IF EXISTS app.get_user_organizations CASCADE;
DROP FUNCTION IF EXISTS app.is_org_admin CASCADE;
DROP FUNCTION IF EXISTS app.can_access_route CASCADE;
DROP FUNCTION IF EXISTS app.search_users CASCADE;
DROP FUNCTION IF EXISTS app.is_following_author CASCADE;
DROP FUNCTION IF EXISTS app.get_popular_authors CASCADE;
DROP FUNCTION IF EXISTS app.search_authors CASCADE;
DROP FUNCTION IF EXISTS app.update_author_follower_count CASCADE;
DROP FUNCTION IF EXISTS app.is_community_member CASCADE;
DROP FUNCTION IF EXISTS app.get_user_community_access CASCADE;
DROP FUNCTION IF EXISTS app.get_user_communities CASCADE;
DROP FUNCTION IF EXISTS app.update_community_member_count CASCADE;
DROP FUNCTION IF EXISTS app.get_user_subscription CASCADE;
DROP FUNCTION IF EXISTS app.can_access_premium_content CASCADE;
DROP FUNCTION IF EXISTS app.get_subscription_plans CASCADE;
DROP FUNCTION IF EXISTS app.update_subscriptions_updated_at CASCADE;
DROP FUNCTION IF EXISTS app.handle_new_user CASCADE;
DROP FUNCTION IF EXISTS app.upsert_translation CASCADE;

-- Funciones en public que pueden existir
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at CASCADE;

-- ============================================================================
-- ELIMINAR TABLAS - SCHEMA BOOKS (CASCADE elimina triggers, políticas, índices)
-- ============================================================================

-- Analytics y auditoría
DROP TABLE IF EXISTS books.book_audit_logs CASCADE;
DROP TABLE IF EXISTS books.book_statistics CASCADE;
DROP TABLE IF EXISTS books.book_page_views CASCADE;
DROP TABLE IF EXISTS books.book_reading_sessions CASCADE;
DROP TABLE IF EXISTS books.user_book_progress CASCADE;
DROP TABLE IF EXISTS books.book_views CASCADE;

-- Reviews y ratings
DROP TABLE IF EXISTS books.book_reviews CASCADE;
DROP TABLE IF EXISTS books.book_ratings CASCADE;

-- Acceso y colaboradores
DROP TABLE IF EXISTS books.book_user_access CASCADE;
DROP TABLE IF EXISTS books.book_access_rules CASCADE;
DROP TABLE IF EXISTS books.book_collaborators CASCADE;

-- Traducciones de libros
DROP TABLE IF EXISTS books.book_page_translations CASCADE;
DROP TABLE IF EXISTS books.book_translations CASCADE;

-- Tablas de relación M-to-M
DROP TABLE IF EXISTS books.books_tags CASCADE;
DROP TABLE IF EXISTS books.books_languages CASCADE;
DROP TABLE IF EXISTS books.books_genres CASCADE;
DROP TABLE IF EXISTS books.books_values CASCADE;
DROP TABLE IF EXISTS books.books_categories CASCADE;
DROP TABLE IF EXISTS books.books_characters CASCADE;
DROP TABLE IF EXISTS books.books_authors CASCADE;

-- Páginas de libros
DROP TABLE IF EXISTS books.book_pages CASCADE;

-- Tabla principal de libros
DROP TABLE IF EXISTS books.books CASCADE;

-- Traducciones de catálogos
DROP TABLE IF EXISTS books.book_tag_translations CASCADE;
DROP TABLE IF EXISTS books.book_genre_translations CASCADE;
DROP TABLE IF EXISTS books.book_value_translations CASCADE;
DROP TABLE IF EXISTS books.book_category_translations CASCADE;
DROP TABLE IF EXISTS books.book_level_translations CASCADE;
DROP TABLE IF EXISTS books.book_type_translations CASCADE;

-- Catálogos
DROP TABLE IF EXISTS books.book_tags CASCADE;
DROP TABLE IF EXISTS books.book_languages CASCADE;
DROP TABLE IF EXISTS books.book_genres CASCADE;
DROP TABLE IF EXISTS books.book_values CASCADE;
DROP TABLE IF EXISTS books.book_categories CASCADE;
DROP TABLE IF EXISTS books.book_levels CASCADE;
DROP TABLE IF EXISTS books.book_types CASCADE;
DROP TABLE IF EXISTS books.book_characters CASCADE;
DROP TABLE IF EXISTS books.book_authors CASCADE;

-- ============================================================================
-- ELIMINAR TABLAS - SCHEMA APP (CASCADE elimina triggers, políticas, índices)
-- ============================================================================

-- Pagos y suscripciones
DROP TABLE IF EXISTS app.subscription_payment_history CASCADE;
DROP TABLE IF EXISTS app.platform_subscriptions CASCADE;
DROP TABLE IF EXISTS app.subscription_plan_definitions CASCADE;

-- Comunidades
DROP TABLE IF EXISTS app.community_payment_history CASCADE;
DROP TABLE IF EXISTS app.community_memberships CASCADE;
DROP TABLE IF EXISTS app.community_plans CASCADE;
DROP TABLE IF EXISTS app.author_communities CASCADE;

-- Autores
DROP TABLE IF EXISTS app.author_followers CASCADE;
DROP TABLE IF EXISTS app.author_profiles CASCADE;

-- Routes y traducciones
DROP TABLE IF EXISTS app.route_translations CASCADE;
DROP TABLE IF EXISTS app.routes CASCADE;
DROP TABLE IF EXISTS app.role_language_access CASCADE;
DROP TABLE IF EXISTS app.translations CASCADE;

-- Permisos
DROP TABLE IF EXISTS app.user_route_permissions CASCADE;
DROP TABLE IF EXISTS app.route_permissions CASCADE;

-- Relaciones de usuarios
DROP TABLE IF EXISTS app.user_relationships CASCADE;

-- Organizaciones
DROP TABLE IF EXISTS app.organization_members CASCADE;
DROP TABLE IF EXISTS app.organizations CASCADE;

-- Roles de usuarios
DROP TABLE IF EXISTS app.user_roles CASCADE;

-- Perfiles de usuarios
DROP TABLE IF EXISTS app.user_profiles CASCADE;

-- Roles (catálogo)
DROP TABLE IF EXISTS app.roles CASCADE;

-- ============================================================================
-- ELIMINAR TIPOS/ENUMS - SCHEMA APP
-- ============================================================================

DROP TYPE IF EXISTS app.user_role CASCADE;
DROP TYPE IF EXISTS app.oauth_provider CASCADE;
DROP TYPE IF EXISTS app.organization_type CASCADE;
DROP TYPE IF EXISTS app.membership_status CASCADE;
DROP TYPE IF EXISTS app.billing_period CASCADE;
DROP TYPE IF EXISTS app.subscription_plan CASCADE;
DROP TYPE IF EXISTS app.subscription_status CASCADE;
DROP TYPE IF EXISTS app.language_code CASCADE;
DROP TYPE IF EXISTS app.permission_type CASCADE;
DROP TYPE IF EXISTS app.relationship_type CASCADE;

-- ============================================================================
-- ELIMINAR TIPOS/ENUMS - SCHEMA BOOKS
-- ============================================================================

DROP TYPE IF EXISTS books.access_type CASCADE;
DROP TYPE IF EXISTS books.book_status CASCADE;
DROP TYPE IF EXISTS books.collaborator_role CASCADE;

-- ============================================================================
-- ELIMINAR POLÍTICAS DE STORAGE (con manejo de errores)
-- ============================================================================

DO $$
BEGIN
    -- Políticas de public-images
    DROP POLICY IF EXISTS "Public read access for public-images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated upload for public-images" ON storage.objects;
    DROP POLICY IF EXISTS "Owner update for public-images" ON storage.objects;
    DROP POLICY IF EXISTS "Owner delete for public-images" ON storage.objects;

    -- Políticas de book-covers
    DROP POLICY IF EXISTS "Public read for book-covers" ON storage.objects;
    DROP POLICY IF EXISTS "Auth upload for book-covers" ON storage.objects;
    DROP POLICY IF EXISTS "Owner update for book-covers" ON storage.objects;
    DROP POLICY IF EXISTS "Owner delete for book-covers" ON storage.objects;

    -- Políticas de book-pages
    DROP POLICY IF EXISTS "Public read for book-pages" ON storage.objects;
    DROP POLICY IF EXISTS "Auth upload for book-pages" ON storage.objects;
    DROP POLICY IF EXISTS "Owner manage for book-pages" ON storage.objects;

    -- Políticas de book-audio
    DROP POLICY IF EXISTS "Public read for book-audio" ON storage.objects;
    DROP POLICY IF EXISTS "Auth upload for book-audio" ON storage.objects;
    DROP POLICY IF EXISTS "Owner manage for book-audio" ON storage.objects;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- ============================================================================
-- ELIMINAR SCHEMAS COMPLETAMENTE (NUCLEAR OPTION)
-- ============================================================================
-- Esto elimina TODO lo que quede en los schemas, incluyendo
-- cualquier objeto que no hayamos listado explícitamente

DROP SCHEMA IF EXISTS books CASCADE;
DROP SCHEMA IF EXISTS app CASCADE;

-- ============================================================================
-- RECREAR SCHEMAS VACÍOS
-- ============================================================================
-- Los recreamos para que SETUP_RAPIDO.sql pueda usarlos

CREATE SCHEMA IF NOT EXISTS app;
CREATE SCHEMA IF NOT EXISTS books;

-- Otorgar permisos necesarios
GRANT USAGE ON SCHEMA app TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA books TO anon, authenticated, service_role;

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

SELECT 'CLEANUP COMPLETADO' as status;

-- Verificar que los schemas están vacíos
SELECT 'Tablas en app:' as info, count(*) as cantidad
FROM information_schema.tables
WHERE table_schema = 'app' AND table_type = 'BASE TABLE';

SELECT 'Tablas en books:' as info, count(*) as cantidad
FROM information_schema.tables
WHERE table_schema = 'books' AND table_type = 'BASE TABLE';

SELECT 'Funciones en app:' as info, count(*) as cantidad
FROM information_schema.routines
WHERE routine_schema = 'app';

SELECT 'Funciones en books:' as info, count(*) as cantidad
FROM information_schema.routines
WHERE routine_schema = 'books';

-- ============================================================================
-- FIN DEL SCRIPT DE CLEANUP
-- ============================================================================
-- Después de ejecutar este script, puedes ejecutar SETUP_RAPIDO.sql
-- para recrear toda la estructura de la base de datos
-- ============================================================================
