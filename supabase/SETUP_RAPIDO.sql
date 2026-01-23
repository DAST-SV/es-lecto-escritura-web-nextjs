-- ============================================================================
-- SETUP RÁPIDO - ES LECTO ESCRITURA
-- ============================================================================
-- Este script configura rápidamente toda la base de datos
-- Ejecutar en Supabase SQL Editor
-- ============================================================================

-- 1. EJECUTAR SETUP COMPLETO DE APLICACIÓN (incluye auth, roles, organizaciones)
\i supabase/schemas/app/01_app.sql

-- Si estás usando el SQL Editor de Supabase, copia y pega directamente
-- el contenido de: supabase/schemas/app/01_app.sql

-- 2. (Opcional) EJECUTAR SISTEMA DE TRADUCCIONES
\i supabase/schemas/app/14_SISTEMA_TRADUCCIONES_COMPLETO.sql

-- 3. (Opcional) INSERTAR TRADUCCIONES INICIALES
\i supabase/schemas/auth/01_INSERTS_TRADUCCIONES_COMPLETAS.sql

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

-- ============================================================================
-- SIGUIENTE PASO: CONFIGURAR OAuth PROVIDERS
-- ============================================================================
-- Ver documentación en: supabase/OAUTH_SETUP.md
