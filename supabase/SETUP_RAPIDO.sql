-- ============================================================================
-- SETUP RÁPIDO - ES LECTO ESCRITURA
-- ============================================================================
-- Este script configura toda la base de datos de forma modular
-- Ejecutar en Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- MÓDULOS CORE (REQUERIDOS)
-- ============================================================================

-- 1. AUTENTICACIÓN (roles, usuarios, perfiles, OAuth)
\i supabase/schemas/app/auth/01_auth_core.sql

-- 2. ORGANIZACIONES (escuelas, familias, grupos, miembros, relaciones)
\i supabase/schemas/app/organizations/01_organizations.sql

-- 3. LEGACY (compatibilidad con código antiguo)
\i supabase/schemas/app/legacy/user_types.sql

-- ============================================================================
-- MÓDULOS OPCIONALES
-- ============================================================================

-- 4. SISTEMA DE TRADUCCIONES (opcional pero recomendado)
\i supabase/schemas/app/translations/01_translations_schema.sql

-- 5. INSERTS DE TRADUCCIONES (auth, navigation, common, errors)
\i supabase/schemas/app/translations/02_translations_inserts.sql

-- ============================================================================
-- PARA SUPABASE SQL EDITOR
-- ============================================================================
-- Si estás usando el SQL Editor de Supabase (no tienes acceso a \i):
-- Copia y pega el contenido de cada archivo en este orden:
--
-- 1. supabase/schemas/app/auth/01_auth_core.sql
-- 2. supabase/schemas/app/organizations/01_organizations.sql
-- 3. supabase/schemas/app/legacy/user_types.sql
-- 4. supabase/schemas/app/translations/01_translations_schema.sql (opcional)
-- 5. supabase/schemas/app/translations/02_translations_inserts.sql (opcional)

-- ============================================================================
-- VERIFICACIÓN
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
