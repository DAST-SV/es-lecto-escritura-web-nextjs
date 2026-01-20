-- ============================================
-- SCRIPT 14: SISTEMA DE TRADUCCIONES COMPLETO
-- ============================================
-- Este script implementa un sistema completo de traducciones con:
-- - Gestión de idiomas (languages)
-- - Namespaces para organizar traducciones
-- - Traducciones con validaciones
-- ============================================

-- ============================================
-- PASO 1: LIMPIAR TODO (si existe)
-- ============================================
DROP TABLE IF EXISTS app.translations CASCADE;
DROP TABLE IF EXISTS app.translation_namespaces CASCADE;
DROP TABLE IF EXISTS app.languages CASCADE;
DROP VIEW IF EXISTS app.active_languages CASCADE;
DROP FUNCTION IF EXISTS app.get_default_language() CASCADE;
DROP FUNCTION IF EXISTS app.get_translations(VARCHAR, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS app.get_translation(VARCHAR, VARCHAR, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS app.validate_single_default_language() CASCADE;
DROP TRIGGER IF EXISTS validate_single_default_language_trigger ON app.languages CASCADE;

-- ============================================
-- PASO 2: CREAR TABLAS
-- ============================================

-- Tabla de idiomas
CREATE TABLE app.languages (
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
CREATE TABLE app.translation_namespaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de traducciones
CREATE TABLE app.translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  namespace_slug VARCHAR(100) NOT NULL REFERENCES app.translation_namespaces(slug) ON DELETE CASCADE,
  translation_key VARCHAR(500) NOT NULL,
  language_code VARCHAR(10) NOT NULL REFERENCES app.languages(code) ON DELETE CASCADE,
  value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(namespace_slug, translation_key, language_code)
);

-- ============================================
-- PASO 3: CREAR ÍNDICES
-- ============================================
CREATE INDEX idx_languages_active ON app.languages(is_active);
CREATE INDEX idx_languages_default ON app.languages(is_default) WHERE is_default = true;
CREATE INDEX idx_translation_namespaces_slug ON app.translation_namespaces(slug);
CREATE INDEX idx_translation_namespaces_active ON app.translation_namespaces(is_active);
CREATE INDEX idx_translations_namespace ON app.translations(namespace_slug);
CREATE INDEX idx_translations_language ON app.translations(language_code);
CREATE INDEX idx_translations_composite ON app.translations(namespace_slug, language_code);
CREATE INDEX idx_translations_key ON app.translations(translation_key);

-- ============================================
-- PASO 4: FUNCIONES
-- ============================================

-- Función: Obtener idioma por defecto
CREATE OR REPLACE FUNCTION app.get_default_language()
RETURNS VARCHAR(10) AS $$
BEGIN
  RETURN (SELECT code FROM app.languages WHERE is_default = true AND is_active = true LIMIT 1);
END;
$$ LANGUAGE plpgsql STABLE;

-- Función: Validar que solo haya un idioma por defecto
CREATE OR REPLACE FUNCTION app.validate_single_default_language()
RETURNS TRIGGER AS $$
DECLARE
  default_count INTEGER;
BEGIN
  IF NEW.is_default = true THEN
    -- Contar cuántos idiomas por defecto hay (excluyendo el actual si es UPDATE)
    SELECT COUNT(*) INTO default_count
    FROM app.languages
    WHERE is_default = true
      AND is_active = true
      AND code != NEW.code;

    IF default_count > 0 THEN
      RAISE EXCEPTION 'Solo puede haber un idioma por defecto activo';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar idioma por defecto único
CREATE TRIGGER validate_single_default_language_trigger
  BEFORE INSERT OR UPDATE ON app.languages
  FOR EACH ROW
  EXECUTE FUNCTION app.validate_single_default_language();

-- Trigger para auto-actualizar updated_at en languages
CREATE TRIGGER update_languages_updated_at
  BEFORE UPDATE ON app.languages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para auto-actualizar updated_at en translation_namespaces
CREATE TRIGGER update_translation_namespaces_updated_at
  BEFORE UPDATE ON app.translation_namespaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para auto-actualizar updated_at en translations
CREATE TRIGGER update_translations_updated_at
  BEFORE UPDATE ON app.translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PASO 5: VISTA DE IDIOMAS ACTIVOS
-- ============================================
CREATE OR REPLACE VIEW app.active_languages AS
SELECT * FROM app.languages
WHERE is_active = true
ORDER BY order_index, code;

-- ============================================
-- PASO 6: HABILITAR RLS (seguridad)
-- ============================================
ALTER TABLE app.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.translation_namespaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.translations ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública
CREATE POLICY "Anyone can read languages"
  ON app.languages FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read namespaces"
  ON app.translation_namespaces FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read translations"
  ON app.translations FOR SELECT
  USING (true);

-- Políticas de escritura (solo autenticados)
CREATE POLICY "Authenticated users can insert languages"
  ON app.languages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update languages"
  ON app.languages FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete languages"
  ON app.languages FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert namespaces"
  ON app.translation_namespaces FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update namespaces"
  ON app.translation_namespaces FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete namespaces"
  ON app.translation_namespaces FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert translations"
  ON app.translations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update translations"
  ON app.translations FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete translations"
  ON app.translations FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- PASO 7: INSERTAR DATOS INICIALES
-- ============================================

-- Insertar idiomas iniciales
INSERT INTO app.languages (code, name, native_name, flag_emoji, is_default, is_active, order_index) VALUES
  ('es', 'Spanish', 'Español', '🇪🇸', true, true, 1),
  ('en', 'English', 'English', '🇬🇧', false, true, 2),
  ('fr', 'French', 'Français', '🇫🇷', false, true, 3)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  native_name = EXCLUDED.native_name,
  flag_emoji = EXCLUDED.flag_emoji,
  is_default = EXCLUDED.is_default,
  is_active = EXCLUDED.is_active,
  order_index = EXCLUDED.order_index;

-- Insertar namespaces iniciales
INSERT INTO app.translation_namespaces (slug, name, description, is_active) VALUES
  ('common', 'Common Translations', 'Traducciones comunes usadas en toda la aplicación', true),
  ('auth', 'Authentication', 'Traducciones del sistema de autenticación', true),
  ('admin', 'Admin Panel', 'Traducciones del panel de administración', true),
  ('books', 'Books Module', 'Traducciones del módulo de libros', true),
  ('errors', 'Error Messages', 'Mensajes de error del sistema', true),
  ('navigation', 'Navigation', 'Traducciones de navegación y menús', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- ============================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- ============================================
COMMENT ON TABLE app.languages IS 'Idiomas disponibles en el sistema';
COMMENT ON TABLE app.translation_namespaces IS 'Namespaces para organizar traducciones por módulo';
COMMENT ON TABLE app.translations IS 'Traducciones del sistema organizadas por namespace, clave e idioma';
COMMENT ON FUNCTION app.get_default_language() IS 'Retorna el código del idioma por defecto activo';
COMMENT ON FUNCTION app.validate_single_default_language() IS 'Valida que solo haya un idioma marcado como por defecto';
