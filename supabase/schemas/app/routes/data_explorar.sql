-- ============================================
-- DATOS: Ruta /explorar (Exploración de libros)
-- Archivo: routes/data_explorar.sql
-- ============================================

-- Insertar ruta principal (pública)
INSERT INTO app.routes (pathname, display_name, description, show_in_menu, menu_order, is_public, is_active)
VALUES ('/explorar', 'Explore', 'Explorar y buscar libros', true, 2, true, true)
ON CONFLICT (pathname) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  show_in_menu = EXCLUDED.show_in_menu,
  menu_order = EXCLUDED.menu_order,
  is_public = EXCLUDED.is_public,
  is_active = EXCLUDED.is_active;

-- Traducciones: Español
INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'es'::app.language_code, '/explorar', 'Explorar'
FROM app.routes r WHERE r.pathname = '/explorar'
ON CONFLICT (route_id, language_code) DO UPDATE SET
  translated_path = EXCLUDED.translated_path,
  translated_name = EXCLUDED.translated_name;

-- Traducciones: Inglés
INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'en'::app.language_code, '/explore', 'Explore'
FROM app.routes r WHERE r.pathname = '/explorar'
ON CONFLICT (route_id, language_code) DO UPDATE SET
  translated_path = EXCLUDED.translated_path,
  translated_name = EXCLUDED.translated_name;

-- Traducciones: Francés
INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'fr'::app.language_code, '/explorer', 'Explorer'
FROM app.routes r WHERE r.pathname = '/explorar'
ON CONFLICT (route_id, language_code) DO UPDATE SET
  translated_path = EXCLUDED.translated_path,
  translated_name = EXCLUDED.translated_name;

-- Verificar
SELECT
  r.pathname,
  r.display_name,
  r.is_public,
  rt.language_code,
  rt.translated_path,
  rt.translated_name
FROM app.routes r
LEFT JOIN app.route_translations rt ON r.id = rt.route_id
WHERE r.pathname = '/explorar';
