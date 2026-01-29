-- ============================================================================
-- SETUP RÁPIDO - ES LECTO ESCRITURA
-- ============================================================================
-- Este script configura toda la base de datos de forma modular y granular
-- Ejecutar en Supabase SQL Editor o mediante psql
-- ============================================================================

-- ============================================================================
-- PASO 0: CREAR SCHEMAS Y EXTENSIONES
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS app;
CREATE SCHEMA IF NOT EXISTS books;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- MÓDULO 1: AUTH - AUTENTICACIÓN
-- ============================================================================

-- 1.1 Inicialización (schema, extensiones, grants)
\i supabase/schemas/app/auth/00_init.sql

-- 1.2 Enums
\i supabase/schemas/app/auth/enums/user_role.sql
\i supabase/schemas/app/auth/enums/oauth_provider.sql

-- 1.3 Tablas
\i supabase/schemas/app/auth/tables/roles.sql
\i supabase/schemas/app/auth/tables/user_profiles.sql
\i supabase/schemas/app/auth/tables/user_roles.sql

-- 1.4 Funciones
\i supabase/schemas/app/auth/functions/set_updated_at.sql
\i supabase/schemas/app/auth/functions/get_user_primary_role.sql
\i supabase/schemas/app/auth/functions/has_role.sql

-- 1.5 Triggers
\i supabase/schemas/app/auth/triggers/set_updated_at.sql
\i supabase/schemas/app/auth/triggers/handle_new_user.sql

-- 1.6 Row Level Security
\i supabase/schemas/app/auth/rls/roles_policies.sql
\i supabase/schemas/app/auth/rls/user_profiles_policies.sql
\i supabase/schemas/app/auth/rls/user_roles_policies.sql

-- ============================================================================
-- MÓDULO 2: ORGANIZATIONS - ORGANIZACIONES Y RELACIONES
-- ============================================================================

-- 2.1 Enums
\i supabase/schemas/app/organizations/enums/organization_type.sql
\i supabase/schemas/app/organizations/enums/membership_status.sql

-- 2.2 Tablas
\i supabase/schemas/app/organizations/tables/organizations.sql
\i supabase/schemas/app/organizations/tables/organization_members.sql
\i supabase/schemas/app/organizations/tables/user_relationships.sql

-- 2.3 Funciones
\i supabase/schemas/app/organizations/functions/is_org_admin.sql
\i supabase/schemas/app/organizations/functions/get_user_organizations.sql

-- 2.4 Vistas
\i supabase/schemas/app/organizations/views/v_organization_active_members.sql
\i supabase/schemas/app/organizations/views/v_organization_stats.sql

-- 2.5 Row Level Security
\i supabase/schemas/app/organizations/rls/organizations_policies.sql
\i supabase/schemas/app/organizations/rls/organization_members_policies.sql
\i supabase/schemas/app/organizations/rls/user_relationships_policies.sql

-- ============================================================================
-- MÓDULO 3: PERMISSIONS - PERMISOS Y RUTAS
-- ============================================================================

\i supabase/schemas/app/permissions/tables/route_permissions.sql
\i supabase/schemas/app/permissions/tables/user_route_permissions.sql
\i supabase/schemas/app/permissions/functions/can_access_route.sql
\i supabase/schemas/app/permissions/functions/search_users.sql
\i supabase/schemas/app/permissions/data.sql
\i supabase/schemas/app/permissions/rbac_data.sql

-- ============================================================================
-- MÓDULO 4: TRANSLATIONS - SISTEMA DE TRADUCCIONES
-- ============================================================================

-- 4.1 Schema
\i supabase/schemas/app/translations/schema/00_tables.sql
\i supabase/schemas/app/translations/schema/01_triggers.sql
\i supabase/schemas/app/translations/schema/02_rls.sql
\i supabase/schemas/app/translations/schema/03_initial_data.sql

-- 4.2 Data - Helper function
\i supabase/schemas/app/translations/data/00_helper_function.sql

-- 4.3 Data - Auth translations
\i supabase/schemas/app/translations/data/auth/01_forms.sql
\i supabase/schemas/app/translations/data/auth/02_login.sql
\i supabase/schemas/app/translations/data/auth/03_register.sql
\i supabase/schemas/app/translations/data/auth/04_roles.sql
\i supabase/schemas/app/translations/data/auth/05_providers.sql
\i supabase/schemas/app/translations/data/auth/06_errors.sql
\i supabase/schemas/app/translations/data/auth/07_messages.sql

-- 4.4 Data - Other namespaces
\i supabase/schemas/app/translations/data/navigation.sql
\i supabase/schemas/app/translations/data/common.sql
\i supabase/schemas/app/translations/data/errors.sql
\i supabase/schemas/app/translations/data/home_page.sql

-- 4.5 Cleanup y verificación
\i supabase/schemas/app/translations/data/99_cleanup.sql

-- ============================================================================
-- MÓDULO 5: ROLE LANGUAGE ACCESS - ACCESO A IDIOMAS POR ROL
-- ============================================================================

\i supabase/schemas/app/role_language_access/tables/role_language_access.sql
\i supabase/schemas/app/role_language_access/data.sql

-- ============================================================================
-- MÓDULO 6: ROUTES - RUTAS Y NAVEGACIÓN
-- ============================================================================

\i supabase/schemas/app/routes/tables/routes.sql
\i supabase/schemas/app/routes/tables/route_translations.sql
\i supabase/schemas/app/routes/data.sql

-- ============================================================================
-- MÓDULO 7: AUTHORS - PERFILES DE AUTOR
-- ============================================================================

\i supabase/schemas/app/authors/tables.sql

-- ============================================================================
-- MÓDULO 8: COMMUNITIES - COMUNIDADES
-- ============================================================================

\i supabase/schemas/app/communities/tables.sql

-- ============================================================================
-- MÓDULO 9: LEGACY - COMPATIBILIDAD
-- ============================================================================

\i supabase/schemas/app/legacy/user_types.sql

-- ============================================================================
-- MÓDULO 10: BOOKS - SISTEMA DE LIBROS BASE
-- ============================================================================

-- 10.1 Inicialización
\i supabase/schemas/books/00_init.sql

-- 10.2 Catálogos
\i supabase/schemas/books/catalogs/tables.sql
\i supabase/schemas/books/catalogs/translations.sql

-- 10.3 Tablas principales
\i supabase/schemas/books/tables/books.sql
\i supabase/schemas/books/tables/book_pages.sql
\i supabase/schemas/books/tables/book_authors.sql
\i supabase/schemas/books/tables/book_characters.sql
\i supabase/schemas/books/tables/book_views.sql
\i supabase/schemas/books/tables/book_audit_logs.sql

-- 10.4 Relaciones
\i supabase/schemas/books/relations/all_relations.sql

-- 10.5 Traducciones de libros
\i supabase/schemas/books/translations/tables.sql

-- 10.6 Colaboradores
\i supabase/schemas/books/collaborators/tables.sql

-- 10.7 Sistema de acceso
\i supabase/schemas/books/access/tables.sql

-- 10.8 Reviews y ratings
\i supabase/schemas/books/reviews/tables.sql

-- 10.9 Analytics
\i supabase/schemas/books/analytics/tables.sql
\i supabase/schemas/books/analytics/functions.sql
\i supabase/schemas/books/analytics/rls.sql

-- 10.10 Funciones
\i supabase/schemas/books/functions/update_updated_at.sql
\i supabase/schemas/books/functions/audit_trigger.sql
\i supabase/schemas/books/functions/increment_views.sql
\i supabase/schemas/books/functions/search_books.sql
\i supabase/schemas/books/functions/soft_delete_book.sql
\i supabase/schemas/books/functions/duplicate_book.sql
\i supabase/schemas/books/functions/validate_publishing.sql
\i supabase/schemas/books/functions/cleanup_audit_logs.sql

-- 10.11 Triggers
\i supabase/schemas/books/triggers/all_triggers.sql

-- 10.12 Políticas RLS
\i supabase/schemas/books/rls/all_policies.sql

-- 10.13 Vistas
\i supabase/schemas/books/views/books_full_info.sql
\i supabase/schemas/books/views/book_statistics.sql
\i supabase/schemas/books/expose/public_views.sql

-- 10.14 Datos iniciales
\i supabase/schemas/books/data.sql

-- ============================================================================
-- MÓDULO 11: STORAGE - BUCKETS
-- ============================================================================

\i supabase/schemas/app/storage/00_init.sql
\i supabase/schemas/app/storage/buckets/public_images.sql
\i supabase/schemas/books/storage/buckets.sql

-- ============================================================================
-- MÓDULO 12: ADMIN - CONFIGURACIÓN DE ADMINISTRADOR
-- ============================================================================

\i supabase/schemas/app/admin/rls/admin_policies.sql
\i supabase/schemas/app/admin/setup/assign_super_admin.sql
\i supabase/schemas/app/admin/setup/complete_admin_access.sql

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

-- Ver schemas creados
SELECT schema_name FROM information_schema.schemata
WHERE schema_name IN ('app', 'books');

-- Ver tablas en schema app
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'app' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Ver tablas en schema books
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'books' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Ver roles creados
SELECT name as role_name, display_name, hierarchy_level
FROM app.roles ORDER BY hierarchy_level DESC;

-- Ver catálogos de libros
SELECT 'book_types' as catalog, count(*) FROM books.book_types
UNION ALL SELECT 'book_levels', count(*) FROM books.book_levels
UNION ALL SELECT 'book_categories', count(*) FROM books.book_categories
UNION ALL SELECT 'book_genres', count(*) FROM books.book_genres
UNION ALL SELECT 'book_values', count(*) FROM books.book_values
UNION ALL SELECT 'book_tags', count(*) FROM books.book_tags
UNION ALL SELECT 'book_languages', count(*) FROM books.book_languages;

-- ============================================================================
-- PARA SUPABASE SQL EDITOR
-- ============================================================================
-- Si estás usando el SQL Editor de Supabase (no tienes acceso a \i):
--
-- 1. Abre cada archivo en el orden indicado en SETUP_DB_NUEVA.md
-- 2. Copia y pega el contenido en el SQL Editor
-- 3. Ejecuta cada script individualmente
--
-- ============================================================================
