-- ============================================================================
-- SETUP RÁPIDO - ES LECTO ESCRITURA
-- ============================================================================
-- Este script configura toda la base de datos de forma modular y granular
-- Ejecutar en Supabase SQL Editor o mediante psql
-- ============================================================================

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
-- MÓDULO 3: TRANSLATIONS - SISTEMA DE TRADUCCIONES (OPCIONAL)
-- ============================================================================

-- 3.1 Schema
\i supabase/schemas/app/translations/schema/00_tables.sql
\i supabase/schemas/app/translations/schema/01_triggers.sql
\i supabase/schemas/app/translations/schema/02_rls.sql
\i supabase/schemas/app/translations/schema/03_initial_data.sql

-- 3.2 Data - Helper function
\i supabase/schemas/app/translations/data/00_helper_function.sql

-- 3.3 Data - Auth translations
\i supabase/schemas/app/translations/data/auth/01_forms.sql
\i supabase/schemas/app/translations/data/auth/02_login.sql
\i supabase/schemas/app/translations/data/auth/03_register.sql
\i supabase/schemas/app/translations/data/auth/04_roles.sql
\i supabase/schemas/app/translations/data/auth/05_providers.sql
\i supabase/schemas/app/translations/data/auth/06_errors.sql
\i supabase/schemas/app/translations/data/auth/07_messages.sql

-- 3.4 Data - Other namespaces
\i supabase/schemas/app/translations/data/navigation.sql
\i supabase/schemas/app/translations/data/common.sql
\i supabase/schemas/app/translations/data/errors.sql

-- 3.5 Cleanup y verificación
\i supabase/schemas/app/translations/data/99_cleanup.sql

-- ============================================================================
-- MÓDULO 4: LEGACY - COMPATIBILIDAD (REQUERIDO)
-- ============================================================================

\i supabase/schemas/app/legacy/user_types.sql

-- ============================================================================
-- PARA SUPABASE SQL EDITOR
-- ============================================================================
-- Si estás usando el SQL Editor de Supabase (no tienes acceso a \i):
-- Copia y pega el contenido de cada archivo en este mismo orden
--
-- ORDEN DE INSTALACIÓN:
-- 1. AUTH (00_init → enums → tables → functions → triggers → rls)
-- 2. ORGANIZATIONS (enums → tables → functions → views → rls)
-- 3. TRANSLATIONS (schema → data/helper → data/auth → data/otros → cleanup)
-- 4. LEGACY (user_types)
--
-- ============================================================================

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

-- Ver roles creados
SELECT
  name as role_name,
  display_name,
  hierarchy_level,
  is_active
FROM app.roles
ORDER BY hierarchy_level DESC;

-- Ver funciones creadas
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'app'
ORDER BY routine_name;

-- Ver tablas creadas
SELECT
  table_name,
  (
    SELECT COUNT(*)
    FROM information_schema.columns c
    WHERE c.table_schema = t.table_schema
      AND c.table_name = t.table_name
  ) as column_count
FROM information_schema.tables t
WHERE table_schema = 'app'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Ver triggers creados
SELECT
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'app'
ORDER BY event_object_table, trigger_name;

-- Ver enums creados
SELECT
  t.typname as enum_name,
  string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE n.nspname = 'app'
GROUP BY t.typname
ORDER BY t.typname;

-- ============================================================================
-- RESUMEN DE MÓDULOS
-- ============================================================================

SELECT
  'auth' as modulo,
  (SELECT COUNT(*) FROM app.roles) as elementos,
  'Roles del sistema' as descripcion
UNION ALL
SELECT
  'organizations',
  (SELECT COUNT(*) FROM app.organizations),
  'Organizaciones creadas'
UNION ALL
SELECT
  'translations',
  (SELECT COUNT(*) FROM app.translation_keys WHERE 1=1),
  'Claves de traducción'
UNION ALL
SELECT
  'legacy',
  (SELECT COUNT(*) FROM app.user_types),
  'Tipos de usuario legacy';

-- ============================================================================
-- SIGUIENTE PASO: CONFIGURAR OAuth PROVIDERS
-- ============================================================================
-- Ver documentación en: supabase/OAUTH_SETUP.md
--
-- Providers soportados:
-- - Google
-- - Facebook
-- - GitHub
-- - Apple
-- - Microsoft (Azure)
