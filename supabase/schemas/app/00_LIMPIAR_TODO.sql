-- ============================================
-- SCRIPT 00: LIMPIAR TODO
-- ⚠️ Esto elimina TODAS las tablas y funciones
-- ============================================

-- Eliminar funciones
DROP FUNCTION IF EXISTS public.can_access_route(uuid, text, text) CASCADE;
DROP FUNCTION IF EXISTS app.can_access_route(uuid, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.search_users_by_email(text) CASCADE;
DROP FUNCTION IF EXISTS app.search_users_by_email(text) CASCADE;
DROP FUNCTION IF EXISTS app.is_super_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS app.set_user_route_permissions_granted_by() CASCADE;
DROP FUNCTION IF EXISTS app.set_user_roles_assigned_by() CASCADE;
DROP FUNCTION IF EXISTS app.set_updated_at() CASCADE;

-- Eliminar tablas (en orden inverso por dependencias)
DROP TABLE IF EXISTS app.role_language_access CASCADE;
DROP TABLE IF EXISTS app.user_route_permissions CASCADE;
DROP TABLE IF EXISTS app.route_permissions CASCADE;
DROP TABLE IF EXISTS app.user_roles CASCADE;
DROP TABLE IF EXISTS app.route_translations CASCADE;
DROP TABLE IF EXISTS app.routes CASCADE;
DROP TABLE IF EXISTS app.roles CASCADE;

-- Eliminar tipos
DROP TYPE IF EXISTS app.language_code CASCADE;
DROP TYPE IF EXISTS app.permission_type CASCADE;

-- Verificar limpieza
SELECT tablename FROM pg_tables WHERE schemaname = 'app';
-- Debe retornar 0 filas

SELECT 
  n.nspname as schema,
  p.proname as function_name
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname IN ('app', 'public')
  AND p.proname IN ('can_access_route', 'search_users_by_email', 'is_super_admin');
-- Debe retornar 0 filas