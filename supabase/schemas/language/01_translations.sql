-- ============================================
-- SCRIPT COMPLETO - SISTEMA DE TRADUCCIONES
-- Copia y pega TODO esto en Supabase SQL Editor
-- ============================================

-- ============================================
-- PASO 1: LIMPIAR TODO (si existe)
-- ============================================
DROP TABLE IF EXISTS translations CASCADE;
DROP TABLE IF EXISTS translation_namespaces CASCADE;
DROP TABLE IF EXISTS languages CASCADE;
DROP VIEW IF EXISTS active_languages CASCADE;
DROP FUNCTION IF EXISTS get_default_language() CASCADE;
DROP FUNCTION IF EXISTS get_translations(VARCHAR, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS get_translation(VARCHAR, VARCHAR, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS validate_single_default_language() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================
-- PASO 2: CREAR TABLAS
-- ============================================

-- Tabla de idiomas
CREATE TABLE languages (
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

-- Tabla de namespaces
CREATE TABLE translation_namespaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de traducciones
CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  namespace_slug VARCHAR(100) NOT NULL REFERENCES translation_namespaces(slug) ON DELETE CASCADE,
  translation_key VARCHAR(500) NOT NULL,
  language_code VARCHAR(10) NOT NULL REFERENCES languages(code) ON DELETE CASCADE,
  value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(namespace_slug, translation_key, language_code)
);

-- ============================================
-- PASO 3: CREAR ÍNDICES
-- ============================================
CREATE INDEX idx_languages_active ON languages(is_active);
CREATE INDEX idx_translations_namespace ON translations(namespace_slug);
CREATE INDEX idx_translations_language ON translations(language_code);
CREATE INDEX idx_translations_composite ON translations(namespace_slug, language_code);

-- ============================================
-- PASO 4: FUNCIONES SIMPLES
-- ============================================

-- Función: Obtener idioma por defecto
CREATE OR REPLACE FUNCTION get_default_language()
RETURNS VARCHAR(10) AS $$
BEGIN
  RETURN (SELECT code FROM languages WHERE is_default = true AND is_active = true LIMIT 1);
END;
$$ LANGUAGE plpgsql STABLE;

-- Función: Auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_languages_updated_at 
  BEFORE UPDATE ON languages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_namespaces_updated_at 
  BEFORE UPDATE ON translation_namespaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_translations_updated_at 
  BEFORE UPDATE ON translations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PASO 5: HABILITAR RLS (seguridad)
-- ============================================
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_namespaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- Permitir lectura a todos
CREATE POLICY "Anyone can read languages" ON languages FOR SELECT USING (true);
CREATE POLICY "Anyone can read namespaces" ON translation_namespaces FOR SELECT USING (true);
CREATE POLICY "Anyone can read translations" ON translations FOR SELECT USING (true);

-- ============================================
-- PASO 6: INSERTAR DATOS DE PRUEBA
-- ============================================

-- Idiomas
INSERT INTO languages (code, name, native_name, flag_emoji, is_default, order_index) VALUES
('es', 'Español', 'Español', '🇪🇸', true, 1),
('en', 'English', 'English', '🇺🇸', false, 2),
('fr', 'Français', 'Français', '🇫🇷', false, 3);

-- Namespaces
INSERT INTO translation_namespaces (slug, name, description) VALUES
('test', 'Test Translations', 'Namespace de prueba'),
('common', 'Common', 'Traducciones comunes del sitio');

-- Traducciones en ESPAÑOL
INSERT INTO translations (namespace_slug, translation_key, language_code, value) VALUES
('test', 'welcome', 'es', 'Bienvenido al sistema'),
('test', 'description', 'es', 'Este es un ejemplo de traducción dinámica desde Supabase'),
('test', 'button.start', 'es', 'Comenzar Ahora'),
('common', 'nav.home', 'es', 'Inicio'),
('common', 'nav.about', 'es', 'Acerca de'),
('common', 'nav.contact', 'es', 'Contacto');

-- Traducciones en INGLÉS
INSERT INTO translations (namespace_slug, translation_key, language_code, value) VALUES
('test', 'welcome', 'en', 'Welcome to the system'),
('test', 'description', 'en', 'This is an example of dynamic translation from Supabase'),
('test', 'button.start', 'en', 'Start Now'),
('common', 'nav.home', 'en', 'Home'),
('common', 'nav.about', 'en', 'About'),
('common', 'nav.contact', 'en', 'Contact');

-- Traducciones en FRANCÉS
INSERT INTO translations (namespace_slug, translation_key, language_code, value) VALUES
('test', 'welcome', 'fr', 'Bienvenue dans le système'),
('test', 'description', 'fr', 'Ceci est un exemple de traduction dynamique depuis Supabase'),
('test', 'button.start', 'fr', 'Commencer Maintenant'),
('common', 'nav.home', 'fr', 'Accueil'),
('common', 'nav.about', 'fr', 'À propos'),
('common', 'nav.contact', 'fr', 'Contact');

-- ============================================
-- ✅ LISTO! Verifica con estas queries:
-- ============================================

-- Ver idiomas
SELECT * FROM languages;

-- Ver namespaces
SELECT * FROM translation_namespaces;

-- Ver todas las traducciones
SELECT * FROM translations ORDER BY namespace_slug, language_code, translation_key;

-- Ver traducciones en español
SELECT namespace_slug, translation_key, value 
FROM translations 
WHERE language_code = 'es'
ORDER BY namespace_slug, translation_key;