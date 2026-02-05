-- supabase/schemas/app/translations/schema/03_initial_data.sql
-- ============================================================================
-- TRANSLATIONS SCHEMA: DATOS INICIALES
-- DESCRIPCIÓN: Idiomas, namespaces y categorías del sistema
-- ============================================================================

SET search_path TO app, public;

-- ============================================================================
-- DATOS: languages
-- ============================================================================

INSERT INTO app.languages (code, name, native_name, flag_emoji, is_default, is_active, order_index) VALUES
  ('es', 'Spanish', 'Español', '🇪🇸', true, true, 1),
  ('en', 'English', 'English', '🇬🇧', false, true, 2),
  ('fr', 'French', 'Français', '🇫🇷', false, true, 3)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  native_name = EXCLUDED.native_name,
  flag_emoji = EXCLUDED.flag_emoji;

-- ============================================================================
-- DATOS: translation_namespaces
-- ============================================================================

INSERT INTO app.translation_namespaces (slug, name, description, is_active) VALUES
  ('common', 'Common Translations', 'Traducciones comunes usadas en toda la aplicación', true),
  ('auth', 'Authentication', 'Traducciones del sistema de autenticación', true),
  ('admin', 'Admin Panel', 'Traducciones del panel de administración', true),
  ('errors', 'Error Messages', 'Mensajes de error del sistema', true),
  ('navigation', 'Navigation', 'Traducciones de navegación y menús', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ============================================================================
-- DATOS: translation_categories
-- ============================================================================

INSERT INTO app.translation_categories (name, description, slug) VALUES
  ('UI Components', 'User interface components', 'ui-components'),
  ('Forms', 'Form labels and validation messages', 'forms'),
  ('Navigation', 'Navigation menus and links', 'navigation'),
  ('Messages', 'System messages and notifications', 'messages'),
  ('Errors', 'Error messages', 'errors'),
  ('Actions', 'Action buttons and commands', 'actions'),
  ('Notifications', 'Toast messages and alerts', 'notifications'),
  ('UI', 'General UI elements', 'ui')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

SELECT 'TRANSLATIONS: Datos iniciales insertados (3 idiomas, 5 namespaces, 8 categorias)' AS status;
