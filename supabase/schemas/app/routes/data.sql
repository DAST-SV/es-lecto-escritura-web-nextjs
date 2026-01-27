-- ============================================
-- DATOS INICIALES: routes y route_translations
-- Archivo: routes/data.sql
-- ============================================

-- Rutas principales
INSERT INTO app.routes (pathname, display_name, description, show_in_menu, menu_order, is_public) VALUES
  ('/', 'Home', 'Página principal', true, 1, true),
  ('/library', 'Library', 'Biblioteca de recursos', true, 2, false),
  ('/my-world', 'My World', 'Mi mundo personal', true, 3, false),
  ('/my-progress', 'My Progress', 'Mi progreso', true, 4, false),
  ('/admin', 'Admin', 'Panel de administración', true, 100, false),
  ('/admin/routes', 'Routes', 'Gestión de rutas', false, 101, false),
  ('/admin/route-translations', 'Route Translations', 'Traducciones de rutas', false, 102, false),
  ('/admin/role-permissions', 'Role Permissions', 'Permisos por rol', false, 103, false),
  ('/admin/user-permissions', 'User Permissions', 'Permisos de usuarios', false, 104, false),
  ('/admin/user-roles', 'User Roles', 'Roles de usuarios', false, 105, false),
  ('/admin/route-scanner', 'Route Scanner', 'Escanear rutas', false, 106, false)
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
