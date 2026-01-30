-- supabase/schemas/app/permissions/rbac_data.sql
-- ============================================
-- PARTE 2: Datos Iniciales + Funciones Helper
-- ============================================

-- ============================================
-- 10. DATOS INICIALES: Roles del Sistema
-- ============================================

INSERT INTO app.roles (name, display_name, description, hierarchy_level, is_system_role) VALUES
  ('super_admin', 'Super Administrador', 'Acceso total al sistema', 100, true),
  ('org_admin', 'Administrador de Organización', 'Administra organizaciones', 90, true),
  ('coordinator', 'Coordinador', 'Coordina actividades', 70, true),
  ('teacher', 'Docente', 'Gestiona contenido educativo', 60, true),
  ('librarian', 'Bibliotecario', 'Gestiona biblioteca', 50, true),
  ('parent', 'Padre/Tutor', 'Supervisa estudiantes', 40, true),
  ('student', 'Estudiante', 'Acceso a contenido', 30, true),
  ('reader', 'Lector', 'Acceso básico de lectura', 20, true),
  ('guest', 'Invitado', 'Acceso limitado', 10, true);

-- ============================================
-- 11. DATOS INICIALES: Permisos
-- ============================================

-- Permisos de LIBROS
INSERT INTO app.permissions (name, resource, action, display_name, description, is_system_permission) VALUES
  ('books.create', 'books', 'create', 'Crear Libros', 'Puede crear nuevos libros', true),
  ('books.read', 'books', 'read', 'Ver Libros', 'Puede ver libros', true),
  ('books.update', 'books', 'update', 'Editar Libros', 'Puede editar libros', true),
  ('books.delete', 'books', 'delete', 'Eliminar Libros', 'Puede eliminar libros', true),
  ('books.publish', 'books', 'publish', 'Publicar Libros', 'Puede publicar libros', true),
  ('books.read_all', 'books', 'read_all', 'Ver Todos los Libros', 'Puede ver libros de todos los usuarios', true);

-- Permisos de USUARIOS
INSERT INTO app.permissions (name, resource, action, display_name, description, is_system_permission) VALUES
  ('users.create', 'users', 'create', 'Crear Usuarios', 'Puede crear nuevos usuarios', true),
  ('users.read', 'users', 'read', 'Ver Usuarios', 'Puede ver usuarios', true),
  ('users.update', 'users', 'update', 'Editar Usuarios', 'Puede editar usuarios', true),
  ('users.delete', 'users', 'delete', 'Eliminar Usuarios', 'Puede eliminar usuarios', true),
  ('users.assign_roles', 'users', 'assign_roles', 'Asignar Roles', 'Puede asignar roles a usuarios', true);

-- Permisos de ORGANIZACIONES
INSERT INTO app.permissions (name, resource, action, display_name, description, is_system_permission) VALUES
  ('organizations.create', 'organizations', 'create', 'Crear Organizaciones', 'Puede crear organizaciones', true),
  ('organizations.read', 'organizations', 'read', 'Ver Organizaciones', 'Puede ver organizaciones', true),
  ('organizations.update', 'organizations', 'update', 'Editar Organizaciones', 'Puede editar organizaciones', true),
  ('organizations.delete', 'organizations', 'delete', 'Eliminar Organizaciones', 'Puede eliminar organizaciones', true),
  ('organizations.manage_members', 'organizations', 'manage_members', 'Gestionar Miembros', 'Puede gestionar miembros de org', true);

-- Permisos de ROLES Y PERMISOS
INSERT INTO app.permissions (name, resource, action, display_name, description, is_system_permission) VALUES
  ('roles.create', 'roles', 'create', 'Crear Roles', 'Puede crear nuevos roles', true),
  ('roles.read', 'roles', 'read', 'Ver Roles', 'Puede ver roles', true),
  ('roles.update', 'roles', 'update', 'Editar Roles', 'Puede editar roles', true),
  ('roles.delete', 'roles', 'delete', 'Eliminar Roles', 'Puede eliminar roles', true),
  ('permissions.manage', 'permissions', 'manage', 'Gestionar Permisos', 'Puede gestionar permisos del sistema', true);

-- Permisos de RUTAS
INSERT INTO app.permissions (name, resource, action, display_name, description, is_system_permission) VALUES
  ('routes.create', 'routes', 'create', 'Crear Rutas', 'Puede crear nuevas rutas', true),
  ('routes.read', 'routes', 'read', 'Ver Rutas', 'Puede ver rutas', true),
  ('routes.update', 'routes', 'update', 'Editar Rutas', 'Puede editar rutas', true),
  ('routes.delete', 'routes', 'delete', 'Eliminar Rutas', 'Puede eliminar rutas', true);

-- ============================================
-- 12. ASIGNAR PERMISOS A ROLES
-- ============================================

-- SUPER_ADMIN: Todos los permisos
INSERT INTO app.role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM app.roles WHERE name = 'super_admin'),
  id
FROM app.permissions;

-- ORG_ADMIN: Permisos de organización + usuarios + libros
INSERT INTO app.role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM app.roles WHERE name = 'org_admin'),
  id
FROM app.permissions
WHERE resource IN ('organizations', 'users', 'books');

-- COORDINATOR: Gestión de miembros y libros
INSERT INTO app.role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM app.roles WHERE name = 'coordinator'),
  id
FROM app.permissions
WHERE name IN (
  'books.create', 'books.read', 'books.update', 'books.read_all',
  'users.read', 'organizations.read', 'organizations.manage_members'
);

-- TEACHER: Crear y gestionar libros
INSERT INTO app.role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM app.roles WHERE name = 'teacher'),
  id
FROM app.permissions
WHERE name IN (
  'books.create', 'books.read', 'books.update', 'books.publish'
);

-- LIBRARIAN: Gestión de catálogo
INSERT INTO app.role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM app.roles WHERE name = 'librarian'),
  id
FROM app.permissions
WHERE name IN (
  'books.create', 'books.read', 'books.update', 'books.read_all'
);

-- PARENT: Solo lectura de progreso
INSERT INTO app.role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM app.roles WHERE name = 'parent'),
  id
FROM app.permissions
WHERE name IN ('books.read');

-- STUDENT: Crear y leer sus propios libros
INSERT INTO app.role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM app.roles WHERE name = 'student'),
  id
FROM app.permissions
WHERE name IN ('books.create', 'books.read');

-- READER: Solo lectura
INSERT INTO app.role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM app.roles WHERE name = 'reader'),
  id
FROM app.permissions
WHERE name IN ('books.read');

-- ============================================
-- 13. DATOS INICIALES: Rutas
-- ============================================

-- Rutas públicas
INSERT INTO app.routes (pathname, display_name, description, is_public, show_in_menu, menu_order, icon) VALUES
  ('/', 'Inicio', 'Página principal', true, true, 1, 'Home'),
  ('/about', 'Acerca de', 'Información sobre el sistema', true, true, 2, 'Info'),
  ('/auth/login', 'Iniciar Sesión', 'Página de login', true, false, 0, 'LogIn'),
  ('/auth/register', 'Registrarse', 'Página de registro', true, false, 0, 'UserPlus');

-- Rutas protegidas - Biblioteca
INSERT INTO app.routes (pathname, display_name, description, is_public, requires_permissions, show_in_menu, menu_order, icon) VALUES
  ('/library', 'Biblioteca', 'Catálogo de libros', false, ARRAY['books.read'], true, 10, 'Library'),
  ('/pages-my-books', 'Mis Libros', 'Mis libros creados', false, ARRAY['books.read'], true, 11, 'BookOpen'),
  ('/books/create', 'Crear Libro', 'Crear nuevo libro', false, ARRAY['books.create'], true, 12, 'BookPlus');

-- Rutas protegidas - Progreso
INSERT INTO app.routes (pathname, display_name, description, is_public, requires_permissions, show_in_menu, menu_order, icon) VALUES
  ('/my-world', 'Mi Mundo', 'Mi espacio personal', false, ARRAY['books.read'], true, 20, 'Globe'),
  ('/my-progress', 'Mi Progreso', 'Mi progreso de lectura', false, ARRAY['books.read'], true, 21, 'TrendingUp');

-- Rutas protegidas - Admin
INSERT INTO app.routes (pathname, display_name, description, is_public, requires_permissions, requires_all_permissions, show_in_menu, menu_order, icon) VALUES
  ('/admin/organizations', 'Organizaciones', 'Gestión de organizaciones', false, ARRAY['organizations.read'], true, true, 30, 'Building'),
  ('/admin/users', 'Usuarios', 'Gestión de usuarios', false, ARRAY['users.read'], true, true, 31, 'Users'),
  ('/admin/roles', 'Roles y Permisos', 'Gestión de roles', false, ARRAY['roles.read', 'permissions.manage'], true, true, 32, 'Shield'),
  ('/admin/routes', 'Rutas', 'Gestión de rutas', false, ARRAY['routes.read'], true, true, 33, 'Route');

-- ============================================
-- 14. TRADUCCIONES DE RUTAS
-- ============================================

-- Función helper para insertar traducciones
CREATE OR REPLACE FUNCTION insert_route_translation(
  p_pathname TEXT,
  p_es_path TEXT,
  p_es_name TEXT,
  p_en_path TEXT,
  p_en_name TEXT,
  p_fr_path TEXT,
  p_fr_name TEXT
) RETURNS VOID AS $$
DECLARE
  v_route_id UUID;
BEGIN
  SELECT id INTO v_route_id FROM app.routes WHERE pathname = p_pathname;
  
  IF v_route_id IS NOT NULL THEN
    INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name) VALUES
      (v_route_id, 'es', p_es_path, p_es_name),
      (v_route_id, 'en', p_en_path, p_en_name),
      (v_route_id, 'fr', p_fr_path, p_fr_name);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Ejecutar traducciones
SELECT insert_route_translation('/', '/', 'Inicio', '/', 'Home', '/', 'Accueil');
SELECT insert_route_translation('/about', '/acerca-de', 'Acerca de', '/about', 'About', '/a-propos', 'À propos');
SELECT insert_route_translation('/auth/login', '/auth/ingresar', 'Iniciar Sesión', '/auth/login', 'Login', '/auth/connexion', 'Connexion');
SELECT insert_route_translation('/auth/register', '/auth/registro', 'Registrarse', '/auth/register', 'Register', '/auth/inscription', 'Inscription');
SELECT insert_route_translation('/library', '/biblioteca', 'Biblioteca', '/library', 'Library', '/bibliothèque', 'Bibliothèque');
SELECT insert_route_translation('/pages-my-books', '/mis-libros', 'Mis Libros', '/my-books', 'My Books', '/mes-livres', 'Mes Livres');
SELECT insert_route_translation('/books/create', '/libros/crear', 'Crear Libro', '/books/create', 'Create Book', '/livres/creer', 'Créer Livre');
SELECT insert_route_translation('/my-world', '/mi-mundo', 'Mi Mundo', '/my-world', 'My World', '/mon-monde', 'Mon Monde');
SELECT insert_route_translation('/my-progress', '/mi-progreso', 'Mi Progreso', '/my-progress', 'My Progress', '/mes-progres', 'Mes Progrès');
SELECT insert_route_translation('/admin/organizations', '/admin/organizaciones', 'Organizaciones', '/admin/organizations', 'Organizations', '/admin/organisations', 'Organisations');
SELECT insert_route_translation('/admin/users', '/admin/usuarios', 'Usuarios', '/admin/users', 'Users', '/admin/utilisateurs', 'Utilisateurs');
SELECT insert_route_translation('/admin/roles', '/admin/roles', 'Roles y Permisos', '/admin/roles', 'Roles & Permissions', '/admin/roles', 'Rôles et Permissions');
SELECT insert_route_translation('/admin/routes', '/admin/rutas', 'Rutas', '/admin/routes', 'Routes', '/admin/routes', 'Routes');

-- Eliminar función helper
DROP FUNCTION insert_route_translation;

-- ============================================
-- CONTINÚA EN PARTE 3...
-- ============================================
