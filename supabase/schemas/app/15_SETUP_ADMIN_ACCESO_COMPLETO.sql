-- ============================================
-- SCRIPT 15: SETUP COMPLETO DE ACCESO ADMIN
-- ✅ Script unificado para dar acceso completo a módulos de admin
-- ============================================

-- ⚠️ PASO 1: CAMBIA ESTE EMAIL POR EL TUYO
-- ============================================
DO $$
DECLARE
  v_email TEXT := 'tu_email@example.com'; -- ⚠️ CAMBIAR AQUÍ
  v_user_id UUID;
  v_super_admin_role_id UUID;
BEGIN

  -- ============================================
  -- PASO 1: VERIFICAR QUE EL USUARIO EXISTE
  -- ============================================
  RAISE NOTICE '================================================';
  RAISE NOTICE 'INICIANDO SETUP DE ACCESO ADMIN';
  RAISE NOTICE '================================================';
  RAISE NOTICE '';

  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario con email % no encontrado. Por favor verifica el email.', v_email;
  END IF;

  RAISE NOTICE '✅ Usuario encontrado: %', v_email;
  RAISE NOTICE '   User ID: %', v_user_id;
  RAISE NOTICE '';

  -- ============================================
  -- PASO 2: OBTENER ROL SUPER_ADMIN
  -- ============================================
  SELECT id INTO v_super_admin_role_id
  FROM app.roles
  WHERE name = 'super_admin';

  IF v_super_admin_role_id IS NULL THEN
    RAISE EXCEPTION 'Rol super_admin no encontrado. Ejecuta primero el script 02_TABLA_ROLES.sql';
  END IF;

  RAISE NOTICE '✅ Rol super_admin encontrado';
  RAISE NOTICE '   Role ID: %', v_super_admin_role_id;
  RAISE NOTICE '';

  -- ============================================
  -- PASO 3: ASIGNAR ROL SUPER_ADMIN AL USUARIO
  -- ============================================
  INSERT INTO app.user_roles (user_id, role_id, is_active, notes)
  VALUES (
    v_user_id,
    v_super_admin_role_id,
    true,
    'Rol super_admin asignado mediante script 15_SETUP_ADMIN_ACCESO_COMPLETO.sql'
  )
  ON CONFLICT (user_id, role_id)
  DO UPDATE SET
    is_active = true,
    revoked_at = NULL,
    updated_at = NOW(),
    notes = 'Rol super_admin reasignado mediante script 15_SETUP_ADMIN_ACCESO_COMPLETO.sql';

  RAISE NOTICE '✅ Rol super_admin asignado correctamente';
  RAISE NOTICE '';

END $$;

-- ============================================
-- PASO 4: REGISTRAR TODAS LAS RUTAS DE ADMIN
-- ============================================

-- Rutas principales de admin
INSERT INTO app.routes (pathname, display_name, description, show_in_menu, menu_order, is_public) VALUES
  -- Dashboard
  ('/admin', 'Admin Dashboard', 'Panel de administración principal', true, 100, false),

  -- Organizaciones
  ('/admin/organizations', 'Organizaciones', 'Gestión de organizaciones', true, 101, false),
  ('/admin/organization-members', 'Miembros de Organización', 'Gestión de miembros de organizaciones', true, 102, false),

  -- Idiomas
  ('/admin/languages', 'Idiomas', 'Gestión de idiomas del sistema', true, 103, false),

  -- Roles y Permisos
  ('/admin/roles', 'Roles', 'Gestión de roles', true, 110, false),
  ('/admin/role-permissions', 'Permisos de Rol', 'Permisos por rol', true, 111, false),
  ('/admin/user-roles', 'Roles de Usuario', 'Asignación de roles a usuarios', true, 112, false),
  ('/admin/user-permissions', 'Permisos de Usuario', 'Permisos específicos de usuarios', true, 113, false),
  ('/admin/role-language-access', 'Acceso por Rol e Idioma', 'Control de acceso por rol e idioma', true, 114, false),

  -- Rutas
  ('/admin/routes', 'Rutas', 'Gestión de rutas del sistema', true, 120, false),
  ('/admin/route-permissions', 'Permisos de Rutas', 'Permisos de acceso a rutas', true, 121, false),
  ('/admin/user-route-permissions', 'Permisos de Usuario por Ruta', 'Permisos específicos de usuario por ruta', true, 122, false),
  ('/admin/route-scanner', 'Escáner de Rutas', 'Escanear y registrar rutas del sistema', true, 123, false),
  ('/admin/route-translations', 'Traducciones de Rutas', 'Traducciones de nombres de rutas', true, 124, false),

  -- Sistema de Traducciones
  ('/admin/translation-namespaces', 'Namespaces de Traducción', 'Espacios de nombres de traducción', true, 130, false),
  ('/admin/translation-categories', 'Categorías de Traducción', 'Categorías de traducción', true, 131, false),
  ('/admin/translation-keys', 'Claves de Traducción', 'Gestión de claves de traducción', true, 132, false),
  ('/admin/translations', 'Traducciones', 'Gestión de traducciones', true, 133, false),

  -- Usuarios
  ('/admin/users', 'Usuarios', 'Gestión de usuarios', true, 140, false),
  ('/admin/user-profiles', 'Perfiles de Usuario', 'Información extendida de perfiles', true, 141, false),
  ('/admin/user-relationships', 'Relaciones de Usuario', 'Relaciones entre usuarios', true, 142, false),

  -- Auditoría
  ('/admin/audit', 'Auditoría', 'Logs y auditoría del sistema', true, 150, false)
ON CONFLICT (pathname)
DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  show_in_menu = EXCLUDED.show_in_menu,
  menu_order = EXCLUDED.menu_order,
  updated_at = NOW();

-- ============================================
-- PASO 5: DAR PERMISOS A SUPER_ADMIN SOBRE TODAS LAS RUTAS DE ADMIN
-- ============================================

-- Dar acceso de lectura (grant) a todas las rutas de admin para el rol super_admin
INSERT INTO app.route_permissions (role_name, route_id, language_code, is_active)
SELECT
  'super_admin',
  r.id,
  NULL,
  true
FROM app.routes r
WHERE r.pathname LIKE '/admin%'
  AND r.deleted_at IS NULL
ON CONFLICT (role_name, route_id, language_code)
DO UPDATE SET
  is_active = true,
  updated_at = NOW();

-- ============================================
-- PASO 6: VERIFICACIÓN FINAL
-- ============================================

-- Verificar roles del usuario
DO $$
DECLARE
  v_email TEXT := 'tu_email@example.com'; -- ⚠️ CAMBIAR (mismo email que arriba)
  v_user_id UUID;
  v_role_count INTEGER;
  v_route_count INTEGER;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  -- Contar roles asignados
  SELECT COUNT(*) INTO v_role_count
  FROM app.user_roles
  WHERE user_id = v_user_id
    AND is_active = true
    AND revoked_at IS NULL;

  RAISE NOTICE '✅ Roles asignados al usuario: %', v_role_count;

  -- Contar rutas de admin con permiso
  SELECT COUNT(*) INTO v_route_count
  FROM app.routes r
  INNER JOIN app.route_permissions rp ON rp.route_id = r.id
  INNER JOIN app.user_roles ur ON ur.role_id = (SELECT id FROM app.roles WHERE name = rp.role_name)
  WHERE ur.user_id = v_user_id
    AND r.pathname LIKE '/admin%'
    AND r.deleted_at IS NULL
    AND rp.is_active = true
    AND ur.is_active = true
    AND ur.revoked_at IS NULL;

  RAISE NOTICE '✅ Rutas de admin con acceso: %', v_route_count;
  RAISE NOTICE '';

  -- Probar acceso a algunas rutas clave
  RAISE NOTICE 'Probando acceso a rutas clave:';

  IF can_access_route(v_user_id, '/admin', 'es') THEN
    RAISE NOTICE '   ✅ /admin - Acceso concedido';
  ELSE
    RAISE NOTICE '   ❌ /admin - Acceso denegado';
  END IF;

  IF can_access_route(v_user_id, '/admin/organizations', 'es') THEN
    RAISE NOTICE '   ✅ /admin/organizations - Acceso concedido';
  ELSE
    RAISE NOTICE '   ❌ /admin/organizations - Acceso denegado';
  END IF;

  IF can_access_route(v_user_id, '/admin/languages', 'es') THEN
    RAISE NOTICE '   ✅ /admin/languages - Acceso concedido';
  ELSE
    RAISE NOTICE '   ❌ /admin/languages - Acceso denegado';
  END IF;

  IF can_access_route(v_user_id, '/admin/roles', 'es') THEN
    RAISE NOTICE '   ✅ /admin/roles - Acceso concedido';
  ELSE
    RAISE NOTICE '   ❌ /admin/roles - Acceso denegado';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'SETUP COMPLETADO EXITOSAMENTE';
  RAISE NOTICE '================================================';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 El usuario % ahora tiene acceso completo a todos los módulos de admin', v_email;
  RAISE NOTICE '';

END $$;

-- ============================================
-- QUERIES DE VERIFICACIÓN MANUAL
-- ============================================

-- Ver roles del usuario
SELECT
  au.email,
  r.name as role_name,
  r.display_name,
  r.hierarchy_level,
  ur.is_active,
  ur.created_at
FROM app.user_roles ur
JOIN auth.users au ON au.id = ur.user_id
JOIN app.roles r ON r.id = ur.role_id
WHERE au.email = 'tu_email@example.com'  -- ⚠️ CAMBIAR
  AND ur.revoked_at IS NULL
ORDER BY r.hierarchy_level DESC;

-- Ver rutas de admin disponibles
SELECT
  pathname,
  display_name,
  description,
  show_in_menu,
  menu_order,
  is_public
FROM app.routes
WHERE pathname LIKE '/admin%'
  AND deleted_at IS NULL
ORDER BY menu_order;

-- Ver permisos de super_admin sobre rutas de admin
SELECT
  r.pathname,
  r.display_name,
  rp.is_active,
  rp.language_code,
  rp.created_at
FROM app.route_permissions rp
JOIN app.routes r ON r.id = rp.route_id
WHERE rp.role_name = 'super_admin'
  AND r.pathname LIKE '/admin%'
  AND r.deleted_at IS NULL
  AND rp.is_active = true
ORDER BY r.menu_order;

-- Probar acceso a todas las rutas de admin
SELECT
  r.pathname,
  can_access_route(
    (SELECT id FROM auth.users WHERE email = 'tu_email@example.com'), -- ⚠️ CAMBIAR
    r.pathname,
    'es'
  ) as tiene_acceso
FROM app.routes r
WHERE r.pathname LIKE '/admin%'
  AND r.deleted_at IS NULL
ORDER BY r.menu_order;
