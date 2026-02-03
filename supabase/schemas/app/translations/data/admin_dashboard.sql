-- supabase/schemas/app/translations/data/admin_dashboard.sql
-- ============================================
-- SCRIPT 14: SISTEMA DE TRADUCCIONES COMPLETO
-- ============================================

-- ============================================
-- TABLA: languages
-- ============================================
CREATE TABLE IF NOT EXISTS app.languages (
  code VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  native_name VARCHAR(100),
  flag_emoji VARCHAR(10),
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: translation_namespaces
-- ============================================
CREATE TABLE IF NOT EXISTS app.translation_namespaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- ============================================
-- TABLA: translation_categories
-- ============================================
CREATE TABLE IF NOT EXISTS app.translation_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  slug VARCHAR(100) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- ============================================
-- TABLA: translation_keys
-- ============================================
CREATE TABLE IF NOT EXISTS app.translation_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  namespace_slug VARCHAR(100) NOT NULL REFERENCES app.translation_namespaces(slug) ON DELETE CASCADE,
  key_name VARCHAR(500) NOT NULL,
  category_id UUID REFERENCES app.translation_categories(id) ON DELETE SET NULL,
  description TEXT,
  context TEXT,
  default_value TEXT,
  is_system_key BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(namespace_slug, key_name)
);

-- ============================================
-- TABLA: translations
-- ============================================
CREATE TABLE IF NOT EXISTS app.translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  translation_key_id UUID NOT NULL REFERENCES app.translation_keys(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL REFERENCES app.languages(code) ON DELETE CASCADE,
  value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(translation_key_id, language_code)
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX idx_languages_active ON app.languages(is_active);
CREATE INDEX idx_translation_namespaces_slug ON app.translation_namespaces(slug);
CREATE INDEX idx_translation_namespaces_active ON app.translation_namespaces(is_active);
CREATE INDEX idx_translation_categories_slug ON app.translation_categories(slug);
CREATE INDEX idx_translation_categories_active ON app.translation_categories(is_active);
CREATE INDEX idx_translation_keys_namespace ON app.translation_keys(namespace_slug);
CREATE INDEX idx_translation_keys_category ON app.translation_keys(category_id);
CREATE INDEX idx_translation_keys_active ON app.translation_keys(is_active);
CREATE INDEX idx_translations_key_id ON app.translations(translation_key_id);
CREATE INDEX idx_translations_language ON app.translations(language_code);
CREATE INDEX idx_translations_active ON app.translations(is_active);

-- ============================================
-- TRIGGERS updated_at
-- ============================================
CREATE TRIGGER update_languages_updated_at
  BEFORE UPDATE ON app.languages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_translation_namespaces_updated_at
  BEFORE UPDATE ON app.translation_namespaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_translation_categories_updated_at
  BEFORE UPDATE ON app.translation_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_translation_keys_updated_at
  BEFORE UPDATE ON app.translation_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_translations_updated_at
  BEFORE UPDATE ON app.translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE app.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.translation_namespaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.translation_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.translation_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read languages" ON app.languages FOR SELECT USING (true);
CREATE POLICY "Auth manage languages" ON app.languages FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public read namespaces" ON app.translation_namespaces FOR SELECT USING (true);
CREATE POLICY "Auth manage namespaces" ON app.translation_namespaces FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public read categories" ON app.translation_categories FOR SELECT USING (true);
CREATE POLICY "Auth manage categories" ON app.translation_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public read keys" ON app.translation_keys FOR SELECT USING (true);
CREATE POLICY "Auth manage keys" ON app.translation_keys FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public read translations" ON app.translations FOR SELECT USING (true);
CREATE POLICY "Auth manage translations" ON app.translations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- GRANTS: Permisos de acceso a tablas
-- ============================================

-- Lectura pública (anon) para todas las tablas de traducciones
GRANT SELECT ON app.languages TO anon;
GRANT SELECT ON app.translation_namespaces TO anon;
GRANT SELECT ON app.translation_categories TO anon;
GRANT SELECT ON app.translation_keys TO anon;
GRANT SELECT ON app.translations TO anon;

-- Lectura para usuarios autenticados
GRANT SELECT ON app.languages TO authenticated;
GRANT SELECT ON app.translation_namespaces TO authenticated;
GRANT SELECT ON app.translation_categories TO authenticated;
GRANT SELECT ON app.translation_keys TO authenticated;
GRANT SELECT ON app.translations TO authenticated;

-- Gestión completa para usuarios autenticados
GRANT INSERT, UPDATE, DELETE ON app.languages TO authenticated;
GRANT INSERT, UPDATE, DELETE ON app.translation_namespaces TO authenticated;
GRANT INSERT, UPDATE, DELETE ON app.translation_categories TO authenticated;
GRANT INSERT, UPDATE, DELETE ON app.translation_keys TO authenticated;
GRANT INSERT, UPDATE, DELETE ON app.translations TO authenticated;

-- ============================================
-- DATOS INICIALES
-- ============================================
INSERT INTO app.languages (code, name, native_name, flag_emoji, is_default, is_active, order_index) VALUES
  ('es', 'Spanish', 'Español', '🇪🇸', true, true, 1),
  ('en', 'English', 'English', '🇬🇧', false, true, 2),
  ('fr', 'French', 'Français', '🇫🇷', false, true, 3);

INSERT INTO app.translation_namespaces (slug, name, description, is_active) VALUES
  ('common', 'Common Translations', 'Traducciones comunes usadas en toda la aplicación', true),
  ('auth', 'Authentication', 'Traducciones del sistema de autenticación', true),
  ('admin', 'Admin Panel', 'Traducciones del panel de administración', true),
  ('errors', 'Error Messages', 'Mensajes de error del sistema', true),
  ('navigation', 'Navigation', 'Traducciones de navegación y menús', true);

INSERT INTO app.translation_categories (name, description, slug) VALUES
  ('UI Components', 'User interface components', 'ui-components'),
  ('Forms', 'Form labels and validation messages', 'forms'),
  ('Navigation', 'Navigation menus and links', 'navigation'),
  ('Messages', 'System messages and notifications', 'messages'),
  ('Errors', 'Error messages', 'errors'),
  ('Actions', 'Action buttons and commands', 'actions');