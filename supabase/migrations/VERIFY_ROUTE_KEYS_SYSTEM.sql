-- ============================================
-- SCRIPT DE VERIFICACIÓN: Sistema de Rutas Traducidas
-- FECHA: 2026-01-18
-- DESCRIPCIÓN: Verifica que todas las rutas estén correctamente insertadas
--              con sus traducciones
-- ============================================

-- ========================================
-- 1. VERIFICAR RUTAS ACTIVAS
-- ========================================

SELECT
  '🔍 RUTAS ACTIVAS' as tipo,
  COUNT(*) as total
FROM app.routes
WHERE is_active = TRUE;

-- ========================================
-- 2. VERIFICAR TRADUCCIONES POR IDIOMA
-- ========================================

SELECT
  '🌐 TRADUCCIONES POR IDIOMA' as tipo,
  language_code as idioma,
  COUNT(*) as total_traducciones
FROM app.route_translations
GROUP BY language_code
ORDER BY language_code;

-- ========================================
-- 3. VERIFICAR RUTAS SIN TRADUCCIONES
-- ========================================

SELECT
  '⚠️ RUTAS SIN TRADUCCIONES' as tipo,
  r.pathname,
  r.display_name,
  (SELECT COUNT(*) FROM app.route_translations rt WHERE rt.route_id = r.id) as traducciones_count
FROM app.routes r
WHERE is_active = TRUE
  AND (SELECT COUNT(*) FROM app.route_translations rt WHERE rt.route_id = r.id) < 4
ORDER BY traducciones_count, r.pathname;

-- ========================================
-- 4. LISTADO COMPLETO DE RUTAS CON TRADUCCIONES
-- ========================================

SELECT
  r.pathname as "Ruta Física",
  r.display_name as "Nombre",
  r.is_public as "Pública",
  r.show_in_menu as "En Menú",
  (SELECT rt.translated_path FROM app.route_translations rt WHERE rt.route_id = r.id AND rt.language_code = 'es') as "ES",
  (SELECT rt.translated_path FROM app.route_translations rt WHERE rt.route_id = r.id AND rt.language_code = 'en') as "EN",
  (SELECT rt.translated_path FROM app.route_translations rt WHERE rt.route_id = r.id AND rt.language_code = 'fr') as "FR",
  (SELECT rt.translated_path FROM app.route_translations rt WHERE rt.route_id = r.id AND rt.language_code = 'it') as "IT"
FROM app.routes r
WHERE r.is_active = TRUE
ORDER BY r.pathname;

-- ========================================
-- 5. VERIFICAR RUTAS DE ROUTE_KEYS.TS
-- ========================================

WITH expected_routes AS (
  SELECT pathname, nombre FROM (VALUES
    ('/', 'Inicio'),
    ('/auth/login', 'Login'),
    ('/auth/signup', 'Signup'),
    ('/auth/callback', 'Callback'),
    ('/auth/reset-password', 'Reset Password'),
    ('/books', 'Books'),
    ('/books/create', 'Create Book'),
    ('/books/[id]/edit', 'Edit Book'),
    ('/books/[id]/read', 'Read Book'),
    ('/books/[id]/statistics', 'Book Statistics'),
    ('/books/trash', 'Trash'),
    ('/library', 'Library'),
    ('/my-world', 'My World'),
    ('/my-progress', 'My Progress'),
    ('/organizations', 'Organizations'),
    ('/organizations/create', 'Create Organization'),
    ('/organizations/[id]/edit', 'Edit Organization'),
    ('/user-types', 'User Types'),
    ('/user-types/create', 'Create User Type'),
    ('/user-types/[id]/edit', 'Edit User Type'),
    ('/admin', 'Admin'),
    ('/admin/users', 'Admin Users'),
    ('/admin/roles', 'Admin Roles'),
    ('/admin/translations', 'Admin Translations'),
    ('/admin/audit', 'Admin Audit'),
    ('/admin/routes', 'Admin Routes'),
    ('/admin/route-scanner', 'Route Scanner'),
    ('/admin/route-translations', 'Route Translations'),
    ('/admin/role-permissions', 'Role Permissions'),
    ('/admin/user-permissions', 'User Permissions'),
    ('/admin/user-roles', 'User Roles'),
    ('/error', 'Error'),
    ('/forbidden', 'Forbidden')
  ) AS t(pathname, nombre)
)
SELECT
  '✅ RUTAS ESPERADAS vs EXISTENTES' as tipo,
  er.pathname as "Ruta Esperada",
  er.nombre as "Nombre",
  CASE
    WHEN r.id IS NOT NULL THEN '✅ Existe'
    ELSE '❌ Falta'
  END as "Estado",
  CASE
    WHEN r.id IS NOT NULL THEN (SELECT COUNT(*) FROM app.route_translations rt WHERE rt.route_id = r.id)
    ELSE 0
  END as "Traducciones"
FROM expected_routes er
LEFT JOIN app.routes r ON r.pathname = er.pathname AND r.is_active = TRUE
ORDER BY
  CASE WHEN r.id IS NOT NULL THEN 0 ELSE 1 END,
  er.pathname;

-- ========================================
-- 6. VERIFICAR PERMISOS ASIGNADOS
-- ========================================

SELECT
  '🔐 PERMISOS POR ROL' as tipo,
  rp.role_name as "Rol",
  r.pathname as "Ruta",
  rp.language_code as "Idioma",
  rp.is_active as "Activo"
FROM app.route_permissions rp
JOIN app.routes r ON r.id = rp.route_id
WHERE r.is_active = TRUE
ORDER BY rp.role_name, r.pathname;

-- ========================================
-- 7. RESUMEN FINAL
-- ========================================

SELECT
  '📊 RESUMEN GENERAL' as tipo,
  (SELECT COUNT(*) FROM app.routes WHERE is_active = TRUE) as "Total Rutas Activas",
  (SELECT COUNT(*) FROM app.route_translations) as "Total Traducciones",
  (SELECT COUNT(DISTINCT route_id) FROM app.route_translations) as "Rutas con Traducciones",
  (SELECT COUNT(*) FROM app.route_permissions WHERE is_active = TRUE) as "Permisos Activos",
  (SELECT COUNT(DISTINCT role_name) FROM app.route_permissions) as "Roles con Permisos";

-- ========================================
-- 8. VERIFICAR INTEGRIDAD
-- ========================================

DO $$
DECLARE
  v_routes_without_translations INTEGER;
  v_expected_routes INTEGER := 33; -- Total de rutas en ROUTE_KEYS
  v_actual_routes INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_actual_routes FROM app.routes WHERE is_active = TRUE;

  SELECT COUNT(*) INTO v_routes_without_translations
  FROM app.routes r
  WHERE r.is_active = TRUE
    AND (SELECT COUNT(*) FROM app.route_translations rt WHERE rt.route_id = r.id) < 4;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICACIÓN DE INTEGRIDAD';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Rutas esperadas: %', v_expected_routes;
  RAISE NOTICE 'Rutas encontradas: %', v_actual_routes;
  RAISE NOTICE 'Rutas sin 4 traducciones: %', v_routes_without_translations;

  IF v_actual_routes >= v_expected_routes THEN
    RAISE NOTICE '✅ Todas las rutas están insertadas';
  ELSE
    RAISE WARNING '⚠️ Faltan % rutas por insertar', v_expected_routes - v_actual_routes;
  END IF;

  IF v_routes_without_translations = 0 THEN
    RAISE NOTICE '✅ Todas las rutas tienen traducciones completas';
  ELSE
    RAISE WARNING '⚠️ Hay % rutas sin traducciones completas', v_routes_without_translations;
  END IF;

  RAISE NOTICE '========================================';
END $$;
