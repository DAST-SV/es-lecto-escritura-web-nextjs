-- ============================================================================
-- TRANSLATIONS SCHEMA: ROW LEVEL SECURITY
-- DESCRIPCIÓN: Políticas de seguridad para tablas de traducciones
-- ============================================================================

SET search_path TO app, public;

-- ============================================================================
-- HABILITAR RLS
-- ============================================================================

ALTER TABLE app.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.translation_namespaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.translation_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.translation_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.translations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICIES: languages
-- ============================================================================

DROP POLICY IF EXISTS "Public read languages" ON app.languages;
CREATE POLICY "Public read languages" ON app.languages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth manage languages" ON app.languages;
CREATE POLICY "Auth manage languages" ON app.languages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- POLICIES: translation_namespaces
-- ============================================================================

DROP POLICY IF EXISTS "Public read namespaces" ON app.translation_namespaces;
CREATE POLICY "Public read namespaces" ON app.translation_namespaces FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth manage namespaces" ON app.translation_namespaces;
CREATE POLICY "Auth manage namespaces" ON app.translation_namespaces FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- POLICIES: translation_categories
-- ============================================================================

DROP POLICY IF EXISTS "Public read categories" ON app.translation_categories;
CREATE POLICY "Public read categories" ON app.translation_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth manage categories" ON app.translation_categories;
CREATE POLICY "Auth manage categories" ON app.translation_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- POLICIES: translation_keys
-- ============================================================================

DROP POLICY IF EXISTS "Public read keys" ON app.translation_keys;
CREATE POLICY "Public read keys" ON app.translation_keys FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth manage keys" ON app.translation_keys;
CREATE POLICY "Auth manage keys" ON app.translation_keys FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- POLICIES: translations
-- ============================================================================

DROP POLICY IF EXISTS "Public read translations" ON app.translations;
CREATE POLICY "Public read translations" ON app.translations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth manage translations" ON app.translations;
CREATE POLICY "Auth manage translations" ON app.translations FOR ALL TO authenticated USING (true) WITH CHECK (true);

SELECT 'TRANSLATIONS: RLS policies creadas' AS status;
