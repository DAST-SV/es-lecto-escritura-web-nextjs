-- ============================================
-- SCRIPT PARA SUPABASE: SETUP ACCESO ADMIN COMPLETO
-- ⚠️ IMPORTANTE: Reemplaza 'tu_email@example.com' con tu email real
-- ============================================

-- ⚠️ PASO 1: CAMBIAR ESTE EMAIL
-- Buscar y reemplazar: tu_email@example.com → tu email real

-- ============================================
-- VERIFICAR USUARIO
-- ============================================
SELECT
  '✅ Usuario encontrado:' as status,
  id,
  email
FROM auth.users
WHERE email = 'tu_email@example.com'; -- ⚠️ CAMBIAR

-- ============================================
-- ASIGNAR ROL SUPER_ADMIN
-- ============================================
INSERT INTO app.user_roles (user_id, role_id, is_active, notes)
SELECT
  au.id,
  r.id,
  true,
  'Rol super_admin asignado - Setup inicial'
FROM auth.users au
CROSS JOIN app.roles r
WHERE au.email = 'tu_email@example.com'  -- ⚠️ CAMBIAR
  AND r.name = 'super_admin'
ON CONFLICT (user_id, role_id)
DO UPDATE SET
  is_active = true,
  revoked_at = NULL,
  updated_at = NOW(),
  notes = 'Rol super_admin reasignado';

-- ============================================
-- REGISTRAR RUTAS DE ADMIN
-- ============================================
INSERT INTO app.routes (pathname, display_name, description, show_in_menu, menu_order, is_public) VALUES
  -- Dashboard
  ('/admin', 'Admin Dashboard', 'Panel de administración principal', true, 100, false),

  -- Organizaciones
  ('/admin/organizations', 'Organizaciones', 'Gestión de organizaciones', true, 101, false),
  ('/admin/organization-members', 'Miembros de Organización', 'Gestión de miembros', true, 102, false),

  -- Idiomas
  ('/admin/languages', 'Idiomas', 'Gestión de idiomas del sistema', true, 103, false),

  -- Roles y Permisos
  ('/admin/roles', 'Roles', 'Gestión de roles', true, 110, false),
  ('/admin/role-permissions', 'Permisos de Rol', 'Permisos por rol', true, 111, false),
  ('/admin/user-roles', 'Roles de Usuario', 'Asignación de roles', true, 112, false),
  ('/admin/user-permissions', 'Permisos de Usuario', 'Permisos específicos', true, 113, false),
  ('/admin/role-language-access', 'Acceso por Rol e Idioma', 'Control por idioma', true, 114, false),

  -- Rutas
  ('/admin/route-permissions', 'Permisos de Rutas', 'Permisos de rutas', true, 121, false),
  ('/admin/user-route-permissions', 'Permisos de Usuario por Ruta', 'Permisos específicos', true, 122, false),
  ('/admin/route-scanner', 'Escáner de Rutas', 'Escanear rutas', true, 123, false),
  ('/admin/route-translations', 'Traducciones de Rutas', 'Traducciones', true, 124, false),

  -- Sistema de Traducciones
  ('/admin/translation-namespaces', 'Namespaces', 'Espacios de nombres', true, 130, false),
  ('/admin/translation-categories', 'Categorías', 'Categorías de traducción', true, 131, false),
  ('/admin/translation-keys', 'Claves de Traducción', 'Gestión de claves', true, 132, false),
  ('/admin/translations', 'Traducciones', 'Gestión de traducciones', true, 133, false),

  -- Usuarios
  ('/admin/users', 'Usuarios', 'Gestión de usuarios', true, 140, false),
  ('/admin/user-profiles', 'Perfiles de Usuario', 'Perfiles extendidos', true, 141, false),
  ('/admin/user-relationships', 'Relaciones de Usuario', 'Relaciones entre usuarios', true, 142, false),

  -- Auditoría
  ('/admin/audit', 'Auditoría', 'Logs del sistema', true, 150, false)
ON CONFLICT (pathname)
DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  show_in_menu = EXCLUDED.show_in_menu,
  menu_order = EXCLUDED.menu_order,
  updated_at = NOW();

-- ============================================
-- DAR PERMISOS A SUPER_ADMIN
-- ============================================
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
-- VERIFICAR INSTALACIÓN
-- ============================================

-- Ver rol asignado
SELECT
  '✅ ROL ASIGNADO' as status,
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
  AND ur.revoked_at IS NULL;

-- Contar rutas con acceso
SELECT
  '✅ RUTAS CON ACCESO' as status,
  COUNT(*) as total_rutas_admin
FROM app.route_permissions rp
JOIN app.routes r ON r.id = rp.route_id
WHERE rp.role_name = 'super_admin'
  AND r.pathname LIKE '/admin%'
  AND r.deleted_at IS NULL
  AND rp.is_active = true;

-- Probar acceso a rutas clave
SELECT
  '✅ PRUEBA DE ACCESO' as status,
  r.pathname,
  can_access_route(
    (SELECT id FROM auth.users WHERE email = 'tu_email@example.com'), -- ⚠️ CAMBIAR
    r.pathname,
    'es'
  ) as tiene_acceso
FROM app.routes r
WHERE r.pathname IN (
  '/admin',
  '/admin/organizations',
  '/admin/languages',
  '/admin/roles'
)
ORDER BY r.pathname;

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- Deberías ver:
-- 1. ✅ ROL ASIGNADO: super_admin con hierarchy_level 100
-- 2. ✅ RUTAS CON ACCESO: 20+ rutas
-- 3. ✅ PRUEBA DE ACCESO: tiene_acceso = true para todas
-- ============================================
