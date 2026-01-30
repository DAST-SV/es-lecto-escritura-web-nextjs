-- supabase/schemas/app/translations/schema/00_tables.sql
-- ============================================================================
-- TRANSLATIONS SCHEMA: TABLAS
-- DESCRIPCIÓN: Definición de todas las tablas del sistema de traducciones
-- ============================================================================

SET search_path TO app, public;

-- Limpiar tablas existentes
DROP TABLE IF EXISTS app.translations CASCADE;
DROP TABLE IF EXISTS app.translation_keys CASCADE;
DROP TABLE IF EXISTS app.translation_categories CASCADE;
DROP TABLE IF EXISTS app.translation_namespaces CASCADE;
DROP TABLE IF EXISTS app.languages CASCADE;

-- ============================================================================
-- TABLA: languages
-- ============================================================================
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

COMMENT ON TABLE app.languages IS 'Idiomas soportados por la plataforma';

-- ============================================================================
-- TABLA: translation_namespaces
-- ============================================================================
CREATE TABLE app.translation_namespaces (
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

COMMENT ON TABLE app.translation_namespaces IS 'Namespaces para organizar traducciones por módulo';

-- ============================================================================
-- TABLA: translation_categories
-- ============================================================================
CREATE TABLE app.translation_categories (
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

COMMENT ON TABLE app.translation_categories IS 'Categorías para clasificar traducciones';

-- ============================================================================
-- TABLA: translation_keys
-- ============================================================================
CREATE TABLE app.translation_keys (
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

COMMENT ON TABLE app.translation_keys IS 'Claves de traducción con metadata';

-- ============================================================================
-- TABLA: translations
-- ============================================================================
CREATE TABLE app.translations (
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

COMMENT ON TABLE app.translations IS 'Traducciones en diferentes idiomas';

-- ============================================================================
-- ÍNDICES
-- ============================================================================
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

SELECT 'TRANSLATIONS: Tablas creadas' AS status;
