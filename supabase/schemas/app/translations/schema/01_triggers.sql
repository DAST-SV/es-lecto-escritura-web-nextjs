-- supabase/schemas/app/translations/schema/01_triggers.sql
-- ============================================================================
-- TRANSLATIONS SCHEMA: TRIGGERS
-- ============================================================================

SET search_path TO app, public;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

SELECT 'TRANSLATIONS: Triggers creados' AS status;
