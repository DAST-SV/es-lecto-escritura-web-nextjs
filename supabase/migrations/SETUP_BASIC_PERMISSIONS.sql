-- ============================================
-- CONFIGURACIÓN: Permisos Básicos para Rutas
-- FECHA: 2026-01-18
-- DESCRIPCIÓN: Configura permisos básicos para cada rol
--              Ejecutar DESPUÉS de INSERT_ROUTE_KEYS_SYSTEM.sql
-- ============================================

-- ========================================
-- LIMPIAR PERMISOS EXISTENTES (OPCIONAL)
-- ========================================
-- Descomenta si quieres empezar de cero
-- DELETE FROM app.route_permissions;
-- DELETE FROM app.user_route_permissions;

-- ========================================
-- 1. SUPER_ADMIN - Acceso Total
-- ========================================

INSERT INTO app.route_permissions (role_name, route_id, language_code, is_active)
SELECT
  'super_admin',
  r.id,
  NULL, -- NULL = todos los idiomas
  TRUE
FROM app.routes r
WHERE r.is_active = TRUE
ON CONFLICT (role_name, route_id, COALESCE(language_code, ''))
DO UPDATE SET is_active = TRUE;

RAISE NOTICE '✅ Super Admin: Acceso a todas las rutas';

-- ========================================
-- 2. ADMIN - Acceso Amplio (excepto críticas)
-- ========================================

INSERT INTO app.route_permissions (role_name, route_id, language_code, is_active)
SELECT
  'admin',
  r.id,
  NULL,
  TRUE
FROM app.routes r
WHERE r.is_active = TRUE
  AND r.pathname NOT IN (
    '/admin/route-scanner',      -- Solo super_admin puede escanear rutas
    '/admin/user-roles'           -- Solo super_admin puede asignar roles
  )
ON CONFLICT (role_name, route_id, COALESCE(language_code, ''))
DO UPDATE SET is_active = TRUE;

RAISE NOTICE '✅ Admin: Acceso a casi todas las rutas';

-- ========================================
-- 3. TEACHER - Acceso a Libros y Gestión
-- ========================================

INSERT INTO app.route_permissions (role_name, route_id, language_code, is_active)
SELECT
  'teacher',
  r.id,
  NULL,
  TRUE
FROM app.routes r
WHERE r.is_active = TRUE
  AND (
    -- Rutas de libros
    r.pathname LIKE '/books%'
    OR
    -- Navegación principal
    r.pathname IN (
      '/library',
      '/my-world',
      '/my-progress'
    )
    OR
    -- Organizaciones
    r.pathname LIKE '/organizations%'
  )
ON CONFLICT (role_name, route_id, COALESCE(language_code, ''))
DO UPDATE SET is_active = TRUE;

RAISE NOTICE '✅ Teacher: Acceso a libros, navegación y organizaciones';

-- ========================================
-- 4. STUDENT - Acceso Limitado (Solo Lectura)
-- ========================================

INSERT INTO app.route_permissions (role_name, route_id, language_code, is_active)
SELECT
  'student',
  r.id,
  NULL,
  TRUE
FROM app.routes r
WHERE r.is_active = TRUE
  AND r.pathname IN (
    -- Solo lectura
    '/library',
    '/my-world',
    '/my-progress',
    '/books',
    '/books/[id]/read',
    '/books/[id]/statistics'
  )
ON CONFLICT (role_name, route_id, COALESCE(language_code, ''))
DO UPDATE SET is_active = TRUE;

RAISE NOTICE '✅ Student: Acceso solo a lectura';

-- ========================================
-- 5. GUEST - Acceso Mínimo
-- ========================================

INSERT INTO app.route_permissions (role_name, route_id, language_code, is_active)
SELECT
  'guest',
  r.id,
  NULL,
  TRUE
FROM app.routes r
WHERE r.is_active = TRUE
  AND r.pathname IN (
    '/library',
    '/books',
    '/books/[id]/read'
  )
ON CONFLICT (role_name, route_id, COALESCE(language_code, ''))
DO UPDATE SET is_active = TRUE;

RAISE NOTICE '✅ Guest: Acceso mínimo';

-- ========================================
-- 6. CONFIGURAR ACCESO A IDIOMAS POR ROL
-- ========================================

-- Super Admin: Todos los idiomas
INSERT INTO app.role_language_access (role_name, language_code, is_active)
SELECT 'super_admin', lang, TRUE
FROM (VALUES ('es'), ('en'), ('fr'), ('it')) AS langs(lang)
ON CONFLICT (role_name, language_code)
DO UPDATE SET is_active = TRUE;

-- Admin: Todos los idiomas
INSERT INTO app.role_language_access (role_name, language_code, is_active)
SELECT 'admin', lang, TRUE
FROM (VALUES ('es'), ('en'), ('fr'), ('it')) AS langs(lang)
ON CONFLICT (role_name, language_code)
DO UPDATE SET is_active = TRUE;

-- Teacher: Español e Inglés
INSERT INTO app.role_language_access (role_name, language_code, is_active)
SELECT 'teacher', lang, TRUE
FROM (VALUES ('es'), ('en')) AS langs(lang)
ON CONFLICT (role_name, language_code)
DO UPDATE SET is_active = TRUE;

-- Student: Solo Español
INSERT INTO app.role_language_access (role_name, language_code, is_active)
VALUES ('student', 'es', TRUE)
ON CONFLICT (role_name, language_code)
DO UPDATE SET is_active = TRUE;

-- Guest: Solo Español
INSERT INTO app.role_language_access (role_name, language_code, is_active)
VALUES ('guest', 'es', TRUE)
ON CONFLICT (role_name, language_code)
DO UPDATE SET is_active = TRUE;

RAISE NOTICE '✅ Acceso a idiomas configurado';

-- ========================================
-- 7. RESUMEN DE PERMISOS
-- ========================================

DO $$
DECLARE
  v_super_admin_count INTEGER;
  v_admin_count INTEGER;
  v_teacher_count INTEGER;
  v_student_count INTEGER;
  v_guest_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_super_admin_count
  FROM app.route_permissions
  WHERE role_name = 'super_admin' AND is_active = TRUE;

  SELECT COUNT(*) INTO v_admin_count
  FROM app.route_permissions
  WHERE role_name = 'admin' AND is_active = TRUE;

  SELECT COUNT(*) INTO v_teacher_count
  FROM app.route_permissions
  WHERE role_name = 'teacher' AND is_active = TRUE;

  SELECT COUNT(*) INTO v_student_count
  FROM app.route_permissions
  WHERE role_name = 'student' AND is_active = TRUE;

  SELECT COUNT(*) INTO v_guest_count
  FROM app.route_permissions
  WHERE role_name = 'guest' AND is_active = TRUE;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RESUMEN DE PERMISOS POR ROL';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Super Admin: % rutas', v_super_admin_count;
  RAISE NOTICE 'Admin: % rutas', v_admin_count;
  RAISE NOTICE 'Teacher: % rutas', v_teacher_count;
  RAISE NOTICE 'Student: % rutas', v_student_count;
  RAISE NOTICE 'Guest: % rutas', v_guest_count;
  RAISE NOTICE '========================================';
END $$;

-- ========================================
-- 8. VERIFICACIÓN DETALLADA
-- ========================================

SELECT
  '📊 PERMISOS POR ROL' as tipo,
  role_name as "Rol",
  COUNT(*) as "Rutas con Acceso"
FROM app.route_permissions
WHERE is_active = TRUE
GROUP BY role_name
ORDER BY COUNT(*) DESC;

-- ========================================
-- 9. MOSTRAR RUTAS POR ROL
-- ========================================

SELECT
  rp.role_name as "Rol",
  r.pathname as "Ruta",
  r.display_name as "Nombre",
  CASE WHEN rp.language_code IS NULL THEN 'Todos' ELSE rp.language_code END as "Idioma"
FROM app.route_permissions rp
JOIN app.routes r ON r.id = rp.route_id
WHERE rp.is_active = TRUE
ORDER BY rp.role_name, r.pathname;
