-- ============================================
-- ARCHIVO: supabase/schemas/app/13_PERMISOS_ADMIN_SOLO_ES.sql
-- ACCIÓN: EJECUTAR EN SUPABASE SQL EDITOR
-- PROPÓSITO: Dar acceso completo a rutas admin SOLO EN ESPAÑOL
-- ============================================

-- ⚠️ PASO 1: Verificar tu usuario actual
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- ⚠️ PASO 2: CAMBIAR ESTE EMAIL POR EL TUYO
-- Copiar el email de arriba y pegarlo aquí 👇
DO $$
DECLARE
  v_user_id uuid;
  v_super_admin_role_id uuid;
  v_route_id uuid;
  v_route_count integer := 0;
BEGIN
  -- 1. Obtener tu user_id
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'tomac22753@ncien.com';  -- ⚠️ CAMBIAR AQUÍ
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION '❌ Usuario no encontrado. Verifica el email.';
  END IF;

  RAISE NOTICE '✅ Usuario encontrado: %', v_user_id;

  -- 2. Obtener rol super_admin
  SELECT id INTO v_super_admin_role_id
  FROM app.roles
  WHERE name = 'super_admin';

  -- 3. Asignar rol super_admin si no lo tiene
  INSERT INTO app.user_roles (user_id, role_id, is_active, notes)
  VALUES (v_user_id, v_super_admin_role_id, true, 'Acceso completo admin - Script 13')
  ON CONFLICT (user_id, role_id) 
  DO UPDATE SET 
    is_active = true,
    revoked_at = NULL,
    notes = 'Acceso completo admin - Actualizado';

  RAISE NOTICE '✅ Rol super_admin asignado';

  -- 4. LIMPIAR traducciones existentes EN e FR de rutas admin
  DELETE FROM app.route_translations
  WHERE route_id IN (
    SELECT id FROM app.routes WHERE pathname LIKE '/admin%'
  )
  AND language_code IN ('en', 'fr', 'it');

  RAISE NOTICE '✅ Traducciones EN/FR/IT eliminadas';

  -- 5. Verificar/crear rutas de admin (solo pathname físico)
  INSERT INTO app.routes (pathname, display_name, description, show_in_menu, menu_order, is_public)
  VALUES 
    ('/admin', 'Admin Panel', 'Panel de administración', true, 100, false),
    ('/admin/route-scanner', 'Route Scanner', 'Escanear rutas del sistema', false, 101, false),
    ('/admin/route-translations', 'Route Translations', 'Gestión de traducciones de rutas', false, 102, false),
    ('/admin/roles', 'Roles Management', 'Gestión de roles del sistema', false, 103, false),
    ('/admin/role-permissions', 'Role Permissions', 'Permisos por rol', false, 104, false),
    ('/admin/user-roles', 'User Roles', 'Asignar roles a usuarios', false, 105, false),
    ('/admin/user-permissions', 'User Permissions', 'Permisos individuales de usuarios', false, 106, false)
  ON CONFLICT (pathname) DO NOTHING;

  RAISE NOTICE '✅ Rutas de admin verificadas/creadas';

  -- 6. Dar permisos al rol super_admin para TODAS las rutas de admin
  FOR v_route_id IN 
    SELECT id FROM app.routes 
    WHERE pathname LIKE '/admin%' 
      AND deleted_at IS NULL
  LOOP
    INSERT INTO app.route_permissions (role_name, route_id, is_active)
    VALUES ('super_admin', v_route_id, true)
    ON CONFLICT (role_name, route_id) 
    DO UPDATE SET is_active = true;
    
    v_route_count := v_route_count + 1;
  END LOOP;

  RAISE NOTICE '✅ % rutas de admin asignadas a super_admin', v_route_count;

  -- 7. Agregar traducciones SOLO en ESPAÑOL
  INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
  SELECT r.id, 'es'::app.language_code, '/admin', 'Panel de Administración'
  FROM app.routes r WHERE r.pathname = '/admin'
  ON CONFLICT (route_id, language_code) 
  DO UPDATE SET translated_path = '/admin', translated_name = 'Panel de Administración';

  INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
  SELECT r.id, 'es'::app.language_code, '/admin/escanear-rutas', 'Escanear Rutas'
  FROM app.routes r WHERE r.pathname = '/admin/route-scanner'
  ON CONFLICT (route_id, language_code) 
  DO UPDATE SET translated_path = '/admin/escanear-rutas', translated_name = 'Escanear Rutas';

  INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
  SELECT r.id, 'es'::app.language_code, '/admin/traducciones-rutas', 'Traducciones de Rutas'
  FROM app.routes r WHERE r.pathname = '/admin/route-translations'
  ON CONFLICT (route_id, language_code) 
  DO UPDATE SET translated_path = '/admin/traducciones-rutas', translated_name = 'Traducciones de Rutas';

  INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
  SELECT r.id, 'es'::app.language_code, '/admin/roles', 'Gestión de Roles'
  FROM app.routes r WHERE r.pathname = '/admin/roles'
  ON CONFLICT (route_id, language_code) 
  DO UPDATE SET translated_path = '/admin/roles', translated_name = 'Gestión de Roles';

  INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
  SELECT r.id, 'es'::app.language_code, '/admin/permisos-rol', 'Permisos por Rol'
  FROM app.routes r WHERE r.pathname = '/admin/role-permissions'
  ON CONFLICT (route_id, language_code) 
  DO UPDATE SET translated_path = '/admin/permisos-rol', translated_name = 'Permisos por Rol';

  INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
  SELECT r.id, 'es'::app.language_code, '/admin/roles-usuario', 'Roles de Usuario'
  FROM app.routes r WHERE r.pathname = '/admin/user-roles'
  ON CONFLICT (route_id, language_code) 
  DO UPDATE SET translated_path = '/admin/roles-usuario', translated_name = 'Roles de Usuario';

  INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
  SELECT r.id, 'es'::app.language_code, '/admin/permisos-usuario', 'Permisos de Usuario'
  FROM app.routes r WHERE r.pathname = '/admin/user-permissions'
  ON CONFLICT (route_id, language_code) 
  DO UPDATE SET translated_path = '/admin/permisos-usuario', translated_name = 'Permisos de Usuario';

  RAISE NOTICE '✅ Traducciones en español agregadas';

  RAISE NOTICE '🎉 ¡PROCESO COMPLETADO!';
END $$;

-- ============================================
-- VERIFICACIONES FINALES
-- ============================================

-- 1. Verificar tu rol
SELECT 
  au.email,
  r.name as role_name,
  r.display_name,
  ur.is_active,
  ur.created_at
FROM app.user_roles ur
JOIN auth.users au ON au.id = ur.user_id
JOIN app.roles r ON r.id = ur.role_id
WHERE au.email = 'tomac22753@ncien.com'  -- ⚠️ CAMBIAR AQUÍ
  AND ur.revoked_at IS NULL;
-- Debe mostrar: super_admin

-- 2. Verificar rutas de admin
SELECT 
  r.pathname,
  r.display_name,
  r.is_active,
  COUNT(rt.id) as traducciones_es
FROM app.routes r
LEFT JOIN app.route_translations rt ON rt.route_id = r.id AND rt.language_code = 'es'
WHERE r.pathname LIKE '/admin%'
  AND r.deleted_at IS NULL
GROUP BY r.id, r.pathname, r.display_name, r.is_active
ORDER BY r.pathname;
-- Debe mostrar 7 rutas con 1 traducción cada una

-- 3. Verificar que NO hay traducciones EN/FR/IT
SELECT 
  r.pathname,
  rt.language_code,
  rt.translated_path
FROM app.route_translations rt
JOIN app.routes r ON r.id = rt.route_id
WHERE r.pathname LIKE '/admin%'
  AND rt.language_code IN ('en', 'fr', 'it');
-- Debe retornar 0 filas

-- 4. Verificar traducciones SOLO en español
SELECT 
  r.pathname,
  rt.language_code,
  rt.translated_path,
  rt.translated_name
FROM app.route_translations rt
JOIN app.routes r ON r.id = rt.route_id
WHERE r.pathname LIKE '/admin%'
  AND r.deleted_at IS NULL
ORDER BY r.pathname;
-- Debe mostrar 7 filas (solo ES)

-- 5. Verificar permisos del rol super_admin
SELECT 
  r.pathname,
  r.display_name,
  rp.is_active
FROM app.route_permissions rp
JOIN app.routes r ON r.id = rp.route_id
WHERE rp.role_name = 'super_admin'
  AND r.pathname LIKE '/admin%'
  AND r.deleted_at IS NULL
ORDER BY r.pathname;
-- Debe mostrar 7 rutas

-- 6. Probar acceso (SOLO EN ESPAÑOL)
SELECT 
  rt.translated_path as ruta_es,
  can_access_route(
    (SELECT id FROM auth.users WHERE email = 'tomac22753@ncien.com'),  -- ⚠️ CAMBIAR
    rt.translated_path,
    'es'
  ) as puede_acceder
FROM app.route_translations rt
JOIN app.routes r ON r.id = rt.route_id
WHERE r.pathname LIKE '/admin%'
  AND rt.language_code = 'es'
ORDER BY r.pathname;
-- TODOS deben retornar: true

-- 7. Resumen final
SELECT 
  '✅ Total de rutas admin' as descripcion,
  COUNT(*) as cantidad
FROM app.routes
WHERE pathname LIKE '/admin%' AND deleted_at IS NULL

UNION ALL

SELECT 
  '✅ Traducciones en español' as descripcion,
  COUNT(*) as cantidad
FROM app.route_translations rt
JOIN app.routes r ON r.id = rt.route_id
WHERE r.pathname LIKE '/admin%' AND rt.language_code = 'es'

UNION ALL

SELECT 
  '✅ Permisos super_admin' as descripcion,
  COUNT(*) as cantidad
FROM app.route_permissions rp
JOIN app.routes r ON r.id = rp.route_id
WHERE r.pathname LIKE '/admin%' AND rp.role_name = 'super_admin';
-- Debe mostrar: 7, 7, 7

