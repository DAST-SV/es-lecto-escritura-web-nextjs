-- ============================================
-- SCRIPT 04: TABLA ROUTE_TRANSLATIONS (CORREGIDO)
-- ============================================
-- Traducciones de rutas a diferentes idiomas
-- ✅ RLS básico (las políticas avanzadas se agregan después)
-- ============================================

CREATE TABLE app.route_translations (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID NOT NULL REFERENCES app.routes(id) ON DELETE CASCADE,
  language_code app.language_code NOT NULL,
  
  -- Traducción
  translated_path VARCHAR(255) NOT NULL,
  translated_name VARCHAR(200) NOT NULL,
  
  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Auditoría
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT route_translations_unique UNIQUE (route_id, language_code),
  CONSTRAINT route_translations_path_format CHECK (translated_path ~ '^/[a-z0-9\-/]*$')
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX idx_route_translations_route_id ON app.route_translations(route_id);
CREATE INDEX idx_route_translations_language ON app.route_translations(language_code);
CREATE INDEX idx_route_translations_path ON app.route_translations(translated_path);
CREATE INDEX idx_route_translations_is_active ON app.route_translations(is_active);

-- ============================================
-- TRIGGER updated_at
-- ============================================

CREATE TRIGGER set_route_translations_updated_at
  BEFORE UPDATE ON app.route_translations
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

-- ============================================
-- HABILITAR RLS
-- ============================================

ALTER TABLE app.route_translations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS BÁSICAS (temporales)
-- ============================================

-- SELECT: Todos pueden ver traducciones activas
CREATE POLICY "route_translations_select_policy" ON app.route_translations
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- INSERT/UPDATE/DELETE: Permitir temporalmente (se restringe después)
CREATE POLICY "route_translations_modify_policy" ON app.route_translations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- PERMISOS GRANT
-- ============================================

GRANT SELECT ON app.route_translations TO authenticated;
GRANT INSERT, UPDATE, DELETE ON app.route_translations TO authenticated;

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Traducciones para /library
INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'es'::app.language_code, '/biblioteca', 'Biblioteca'
FROM app.routes r WHERE r.pathname = '/library';

INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'en'::app.language_code, '/library', 'Library'
FROM app.routes r WHERE r.pathname = '/library';

INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'fr'::app.language_code, '/bibliotheque', 'Bibliothèque'
FROM app.routes r WHERE r.pathname = '/library';

INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'it'::app.language_code, '/biblioteca', 'Biblioteca'
FROM app.routes r WHERE r.pathname = '/library';

-- Traducciones para /my-world
INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'es'::app.language_code, '/mi-mundo', 'Mi Mundo'
FROM app.routes r WHERE r.pathname = '/my-world';

INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'en'::app.language_code, '/my-world', 'My World'
FROM app.routes r WHERE r.pathname = '/my-world';

INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'fr'::app.language_code, '/mon-monde', 'Mon Monde'
FROM app.routes r WHERE r.pathname = '/my-world';

-- Traducciones para /my-progress
INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'es'::app.language_code, '/mi-progreso', 'Mi Progreso'
FROM app.routes r WHERE r.pathname = '/my-progress';

INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'en'::app.language_code, '/my-progress', 'My Progress'
FROM app.routes r WHERE r.pathname = '/my-progress';

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON TABLE app.route_translations IS 'Traducciones de rutas a diferentes idiomas';
COMMENT ON COLUMN app.route_translations.translated_path IS 'Pathname traducido (ej: /biblioteca)';
COMMENT ON COLUMN app.route_translations.translated_name IS 'Nombre traducido visible';

-- ============================================
-- VERIFICAR
-- ============================================

SELECT 
  r.pathname,
  rt.language_code,
  rt.translated_path,
  rt.translated_name
FROM app.route_translations rt
JOIN app.routes r ON r.id = rt.route_id
ORDER BY r.pathname, rt.language_code;
-- Debe mostrar traducciones
