-- supabase/schemas/app/translations/schema/02_rls.sql
-- ============================================================================
-- TRANSLATIONS SCHEMA: ROW LEVEL SECURITY
-- ============================================================================

SET search_path TO app, public;

ALTER TABLE app.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.translation_namespaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.translation_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.translation_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.translations ENABLE ROW LEVEL SECURITY;

-- languages
CREATE POLICY "Public read languages" ON app.languages FOR SELECT USING (true);
CREATE POLICY "Auth manage languages" ON app.languages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- translation_namespaces
CREATE POLICY "Public read namespaces" ON app.translation_namespaces FOR SELECT USING (true);
CREATE POLICY "Auth manage namespaces" ON app.translation_namespaces FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- translation_categories
CREATE POLICY "Public read categories" ON app.translation_categories FOR SELECT USING (true);
CREATE POLICY "Auth manage categories" ON app.translation_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- translation_keys
CREATE POLICY "Public read keys" ON app.translation_keys FOR SELECT USING (true);
CREATE POLICY "Auth manage keys" ON app.translation_keys FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- translations
CREATE POLICY "Public read translations" ON app.translations FOR SELECT USING (true);
CREATE POLICY "Auth manage translations" ON app.translations FOR ALL TO authenticated USING (true) WITH CHECK (true);

SELECT 'TRANSLATIONS: RLS policies creadas' AS status;
