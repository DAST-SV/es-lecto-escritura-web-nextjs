-- supabase/schemas/app/admin/setup/complete_admin_access.sql
-- ============================================
-- SCRIPT: Setup completo de acceso admin
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
  INSERT INTO app.user_roles (user_id, role_id, is_active)
  VALUES (v_user_id, v_super_admin_role_id, true)
  ON CONFLICT (user_id, role_id, organization_id)
  DO UPDATE SET is_active = true, revoked_at = NULL, updated_at = NOW();

  RAISE NOTICE '✅ Rol super_admin asignado';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'SETUP COMPLETADO EXITOSAMENTE';
  RAISE NOTICE '================================================';
END $$;

-- Registrar rutas de admin (todas las 34 rutas del dashboard)
INSERT INTO app.routes (pathname, display_name, description, show_in_menu, menu_order, is_public) VALUES
  -- Dashboard principal
  ('/admin',                       'Admin Dashboard',          'Panel de administración',           true, 100, false),
  -- Acceso y permisos
  ('/admin/routes',                'Rutas',                    'Gestión de rutas',                  true, 120, false),
  ('/admin/route-scanner',         'Escáner de Rutas',         'Escanear rutas del proyecto',       true, 121, false),
  ('/admin/route-translations',    'Rutas Traducidas',         'Traducciones de URLs',              true, 122, false),
  ('/admin/route-permissions',     'Permisos de Rutas',        'Permisos por ruta',                 true, 123, false),
  ('/admin/roles',                 'Roles',                    'Gestión de roles',                  true, 110, false),
  ('/admin/role-permissions',      'Permisos de Rol',          'Permisos por rol',                  true, 111, false),
  ('/admin/user-roles',            'Roles de Usuario',         'Asignación de roles a usuarios',    true, 112, false),
  ('/admin/user-permissions',      'Permisos de Usuario',      'Permisos individuales',             true, 113, false),
  -- Usuarios
  ('/admin/users',                 'Usuarios',                 'Gestión de usuarios',               true, 140, false),
  ('/admin/user-profiles',         'Perfiles de Usuario',      'Gestión de perfiles',               true, 141, false),
  ('/admin/user-relationships',    'Relaciones',               'Relaciones entre usuarios',         true, 142, false),
  ('/admin/role-language-access',  'Acceso por Idioma',        'Control por rol e idioma',          true, 114, false),
  -- Organizaciones
  ('/admin/organizations',         'Organizaciones',           'Gestión de organizaciones',         true, 101, false),
  ('/admin/organization-members',  'Miembros Org.',            'Miembros de organización',          true, 115, false),
  -- Libros y contenido
  ('/admin/books-management',      'Libros',                   'Administración de libros',          true, 200, false),
  ('/admin/book-categories',       'Categorías de Libros',     'Categorías de libros',              true, 201, false),
  ('/admin/book-levels',           'Niveles de Lectura',       'Niveles de dificultad',             true, 202, false),
  ('/admin/book-genres',           'Géneros Literarios',       'Géneros de libros',                 true, 203, false),
  ('/admin/book-tags',             'Etiquetas',                'Etiquetas de libros',               true, 204, false),
  ('/admin/book-authors',          'Autores',                  'Gestión de autores',                true, 205, false),
  ('/admin/book-pages',            'Páginas de Libros',        'Gestión de páginas',                true, 206, false),
  -- Interacción
  ('/admin/book-reviews',          'Reseñas',                  'Reseñas de libros',                 true, 210, false),
  ('/admin/book-ratings',          'Calificaciones',           'Calificaciones de libros',          true, 211, false),
  ('/admin/reading-progress',      'Progreso de Lectura',      'Progreso de lectura',               true, 212, false),
  ('/admin/reading-sessions',      'Sesiones de Lectura',      'Sesiones de lectura',               true, 213, false),
  ('/admin/favorites',             'Favoritos',                'Gestión de favoritos',              true, 214, false),
  ('/admin/reading-lists',         'Listas de Lectura',        'Listas de lectura',                 true, 215, false),
  -- Traducciones
  ('/admin/translation-namespaces','Namespaces',               'Namespaces de traducción',          true, 130, false),
  ('/admin/translation-categories','Categorías Traducción',    'Categorías de traducción',          true, 131, false),
  ('/admin/translation-keys',      'Claves de Traducción',     'Claves de traducción',              true, 132, false),
  ('/admin/translations',          'Traducciones',             'Gestión de traducciones UI',        true, 133, false),
  -- Sistema
  ('/admin/languages',             'Idiomas',                  'Gestión de idiomas',                true, 103, false),
  ('/admin/audit',                 'Auditoría',                'Registro de auditoría del sistema', true, 150, false)
ON CONFLICT (pathname)
DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description  = EXCLUDED.description,
  updated_at   = NOW();

-- Dar permisos a super_admin
INSERT INTO app.route_permissions (role_name, route_id, language_code, is_active)
SELECT 'super_admin', r.id, NULL, true
FROM app.routes r
WHERE r.pathname LIKE '/admin%' AND r.deleted_at IS NULL
ON CONFLICT (role_name, route_id, language_code)
DO UPDATE SET is_active = true, updated_at = NOW();
