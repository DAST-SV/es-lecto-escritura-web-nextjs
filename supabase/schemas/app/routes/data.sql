-- supabase/schemas/app/routes/data.sql
-- ============================================
-- DATOS INICIALES: routes y route_translations
-- ============================================

-- Rutas principales (app)
INSERT INTO app.routes (pathname, display_name, description, show_in_menu, menu_order, is_public) VALUES
  ('/',          'Home',        'Página principal',          true, 1, true),
  ('/library',   'Library',     'Biblioteca de recursos',    true, 2, false),
  ('/my-world',  'My World',    'Mi mundo personal',         true, 3, false),
  ('/my-progress','My Progress','Mi progreso',               true, 4, false)
ON CONFLICT (pathname) DO NOTHING;

-- Rutas admin (todas las del dashboard)
INSERT INTO app.routes (pathname, display_name, description, show_in_menu, menu_order, is_public) VALUES
  -- Dashboard principal
  ('/admin',                        'Admin Dashboard',          'Panel de administración',           true, 100, false),
  -- Acceso y permisos
  ('/admin/routes',                 'Rutas',                    'Gestión de rutas',                  false, 120, false),
  ('/admin/route-scanner',          'Escáner de Rutas',         'Escanear rutas del proyecto',       false, 121, false),
  ('/admin/route-translations',     'Rutas Traducidas',         'Traducciones de URLs',              false, 122, false),
  ('/admin/route-permissions',      'Permisos de Rutas',        'Permisos por ruta',                 false, 123, false),
  ('/admin/roles',                  'Roles',                    'Gestión de roles',                  false, 110, false),
  ('/admin/role-permissions',       'Permisos de Rol',          'Permisos por rol',                  false, 111, false),
  ('/admin/user-roles',             'Roles de Usuario',         'Asignación de roles a usuarios',    false, 112, false),
  ('/admin/user-permissions',       'Permisos de Usuario',      'Permisos individuales',             false, 113, false),
  -- Usuarios
  ('/admin/users',                  'Usuarios',                 'Gestión de usuarios',               false, 140, false),
  ('/admin/user-profiles',          'Perfiles de Usuario',      'Gestión de perfiles',               false, 141, false),
  ('/admin/user-relationships',     'Relaciones',               'Relaciones entre usuarios',         false, 142, false),
  ('/admin/role-language-access',   'Acceso por Idioma',        'Control por rol e idioma',          false, 114, false),
  -- Organizaciones
  ('/admin/organizations',          'Organizaciones',           'Gestión de organizaciones',         false, 101, false),
  ('/admin/organization-members',   'Miembros Org.',            'Miembros de organización',          false, 115, false),
  -- Libros y contenido
  ('/admin/books-management',       'Libros',                   'Administración de libros',          false, 200, false),
  ('/admin/book-categories',        'Categorías de Libros',     'Categorías de libros',              false, 201, false),
  ('/admin/book-levels',            'Niveles de Lectura',       'Niveles de dificultad',             false, 202, false),
  ('/admin/book-genres',            'Géneros Literarios',       'Géneros de libros',                 false, 203, false),
  ('/admin/book-tags',              'Etiquetas',                'Etiquetas de libros',               false, 204, false),
  ('/admin/book-authors',           'Autores',                  'Gestión de autores',                false, 205, false),
  ('/admin/book-pages',             'Páginas de Libros',        'Gestión de páginas',                false, 206, false),
  -- Interacción
  ('/admin/book-reviews',           'Reseñas',                  'Reseñas de libros',                 false, 210, false),
  ('/admin/book-ratings',           'Calificaciones',           'Calificaciones de libros',          false, 211, false),
  ('/admin/reading-progress',       'Progreso de Lectura',      'Progreso de lectura',               false, 212, false),
  ('/admin/reading-sessions',       'Sesiones de Lectura',      'Sesiones de lectura',               false, 213, false),
  ('/admin/favorites',              'Favoritos',                'Gestión de favoritos',              false, 214, false),
  ('/admin/reading-lists',          'Listas de Lectura',        'Listas de lectura',                 false, 215, false),
  -- Traducciones
  ('/admin/translation-namespaces', 'Namespaces',               'Namespaces de traducción',          false, 130, false),
  ('/admin/translation-categories', 'Categorías Traducción',    'Categorías de traducción',          false, 131, false),
  ('/admin/translation-keys',       'Claves de Traducción',     'Claves de traducción',              false, 132, false),
  ('/admin/translations',           'Traducciones',             'Gestión de traducciones UI',        false, 133, false),
  -- Sistema
  ('/admin/languages',              'Idiomas',                  'Gestión de idiomas',                false, 103, false),
  ('/admin/audit',                  'Auditoría',                'Registro de auditoría del sistema', false, 150, false)
ON CONFLICT (pathname) DO NOTHING;

-- Traducciones: /library
INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'es'::app.language_code, '/biblioteca', 'Biblioteca'
FROM app.routes r WHERE r.pathname = '/library'
ON CONFLICT (route_id, language_code) DO NOTHING;

INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'en'::app.language_code, '/library', 'Library'
FROM app.routes r WHERE r.pathname = '/library'
ON CONFLICT (route_id, language_code) DO NOTHING;

INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'fr'::app.language_code, '/bibliotheque', 'Bibliothèque'
FROM app.routes r WHERE r.pathname = '/library'
ON CONFLICT (route_id, language_code) DO NOTHING;

-- Traducciones: /my-world
INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'es'::app.language_code, '/mi-mundo', 'Mi Mundo'
FROM app.routes r WHERE r.pathname = '/my-world'
ON CONFLICT (route_id, language_code) DO NOTHING;

INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'en'::app.language_code, '/my-world', 'My World'
FROM app.routes r WHERE r.pathname = '/my-world'
ON CONFLICT (route_id, language_code) DO NOTHING;

INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'fr'::app.language_code, '/mon-monde', 'Mon Monde'
FROM app.routes r WHERE r.pathname = '/my-world'
ON CONFLICT (route_id, language_code) DO NOTHING;

-- Traducciones: /my-progress
INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'es'::app.language_code, '/mi-progreso', 'Mi Progreso'
FROM app.routes r WHERE r.pathname = '/my-progress'
ON CONFLICT (route_id, language_code) DO NOTHING;

INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'en'::app.language_code, '/my-progress', 'My Progress'
FROM app.routes r WHERE r.pathname = '/my-progress'
ON CONFLICT (route_id, language_code) DO NOTHING;

INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'fr'::app.language_code, '/mes-progres', 'Mes Progrès'
FROM app.routes r WHERE r.pathname = '/my-progress'
ON CONFLICT (route_id, language_code) DO NOTHING;
