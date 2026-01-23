-- ============================================================================
-- TRANSLATIONS SCHEMA: TRIGGERS
-- DESCRIPCIÓN: Triggers para actualizar updated_at automáticamente
-- ============================================================================

SET search_path TO app, public;

-- Crear función si no existe (puede estar definida en auth module)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS updated_at
-- ============================================================================

DROP TRIGGER IF EXISTS update_languages_updated_at ON app.languages;
CREATE TRIGGER update_languages_updated_at
  BEFORE UPDATE ON app.languages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_translation_namespaces_updated_at ON app.translation_namespaces;
CREATE TRIGGER update_translation_namespaces_updated_at
  BEFORE UPDATE ON app.translation_namespaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_translation_categories_updated_at ON app.translation_categories;
CREATE TRIGGER update_translation_categories_updated_at
  BEFORE UPDATE ON app.translation_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_translation_keys_updated_at ON app.translation_keys;
CREATE TRIGGER update_translation_keys_updated_at
  BEFORE UPDATE ON app.translation_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_translations_updated_at ON app.translations;
CREATE TRIGGER update_translations_updated_at
  BEFORE UPDATE ON app.translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

SELECT 'TRANSLATIONS: Triggers creados' AS status;
