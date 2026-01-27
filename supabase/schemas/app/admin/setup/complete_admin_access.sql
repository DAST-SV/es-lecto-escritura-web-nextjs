-- ============================================
-- SCRIPT: Setup completo de acceso admin
-- Archivo: admin/setup/complete_admin_access.sql
-- ⚠️ CAMBIAR EL EMAIL ANTES DE EJECUTAR
-- ============================================

DO $$
DECLARE
  v_email TEXT := 'tu_email@example.com'; -- ⚠️ CAMBIAR AQUÍ
  v_user_id UUID;
  v_super_admin_role_id UUID;
BEGIN
  RAISE NOTICE '================================================';
  RAISE NOTICE 'INICIANDO SETUP DE ACCESO ADMIN';
  RAISE NOTICE '================================================';

  -- Verificar usuario
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario con email % no encontrado.', v_email;
  END IF;

  RAISE NOTICE '✅ Usuario encontrado: %', v_email;

  -- Obtener rol super_admin
  SELECT id INTO v_super_admin_role_id FROM app.roles WHERE name = 'super_admin';

  IF v_super_admin_role_id IS NULL THEN
    RAISE EXCEPTION 'Rol super_admin no encontrado.';
  END IF;

  -- Asignar rol
  INSERT INTO app.user_roles (user_id, role_id, is_active, notes)
  VALUES (v_user_id, v_super_admin_role_id, true, 'Setup completo admin')
  ON CONFLICT (user_id, role_id)
  DO UPDATE SET is_active = true, revoked_at = NULL, updated_at = NOW();

  RAISE NOTICE '✅ Rol super_admin asignado';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'SETUP COMPLETADO EXITOSAMENTE';
  RAISE NOTICE '================================================';
END $$;

-- Registrar rutas de admin
INSERT INTO app.routes (pathname, display_name, description, show_in_menu, menu_order, is_public) VALUES
  ('/admin', 'Admin Dashboard', 'Panel de administración', true, 100, false),
  ('/admin/organizations', 'Organizaciones', 'Gestión de organizaciones', true, 101, false),
  ('/admin/languages', 'Idiomas', 'Gestión de idiomas', true, 103, false),
  ('/admin/roles', 'Roles', 'Gestión de roles', true, 110, false),
  ('/admin/role-permissions', 'Permisos de Rol', 'Permisos por rol', true, 111, false),
  ('/admin/user-roles', 'Roles de Usuario', 'Asignación de roles', true, 112, false),
  ('/admin/user-permissions', 'Permisos de Usuario', 'Permisos específicos', true, 113, false),
  ('/admin/role-language-access', 'Acceso por Idioma', 'Control por rol e idioma', true, 114, false),
  ('/admin/routes', 'Rutas', 'Gestión de rutas', true, 120, false),
  ('/admin/route-scanner', 'Escáner de Rutas', 'Escanear rutas', true, 123, false),
  ('/admin/route-translations', 'Traducciones de Rutas', 'Traducciones', true, 124, false),
  ('/admin/translations', 'Traducciones', 'Gestión de traducciones', true, 133, false),
  ('/admin/users', 'Usuarios', 'Gestión de usuarios', true, 140, false)
ON CONFLICT (pathname)
DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Dar permisos a super_admin
INSERT INTO app.route_permissions (role_name, route_id, language_code, is_active)
SELECT 'super_admin', r.id, NULL, true
FROM app.routes r
WHERE r.pathname LIKE '/admin%' AND r.deleted_at IS NULL
ON CONFLICT (role_name, route_id, language_code)
DO UPDATE SET is_active = true, updated_at = NOW();
