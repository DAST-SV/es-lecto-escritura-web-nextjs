-- ============================================================================
-- TRANSLATIONS DATA: FUNCIÓN HELPER
-- DESCRIPCIÓN: Función temporal para facilitar inserción de traducciones
-- ============================================================================

SET search_path TO app, public;

-- Función helper para insertar una clave con sus traducciones
CREATE OR REPLACE FUNCTION insert_translation(
    p_namespace VARCHAR(100),
    p_key_name VARCHAR(500),
    p_es TEXT,
    p_en TEXT,
    p_fr TEXT,
    p_category VARCHAR(100) DEFAULT NULL,
    p_description TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_key_id UUID;
    v_category_id UUID;
BEGIN
    -- Obtener category_id si se proporciona
    IF p_category IS NOT NULL THEN
        SELECT id INTO v_category_id FROM app.translation_categories WHERE slug = p_category;
    END IF;

    -- Insertar la clave (o obtener si ya existe)
    INSERT INTO app.translation_keys (namespace_slug, key_name, category_id, description, is_system_key, is_active)
    VALUES (p_namespace, p_key_name, v_category_id, p_description, true, true)
    ON CONFLICT (namespace_slug, key_name) DO UPDATE
    SET description = EXCLUDED.description, category_id = EXCLUDED.category_id
    RETURNING id INTO v_key_id;

    -- Insertar traducciones en español
    INSERT INTO app.translations (translation_key_id, language_code, value, is_active, is_verified)
    VALUES (v_key_id, 'es', p_es, true, true)
    ON CONFLICT (translation_key_id, language_code) DO UPDATE
    SET value = EXCLUDED.value, is_verified = true;

    -- Insertar traducciones en inglés
    INSERT INTO app.translations (translation_key_id, language_code, value, is_active, is_verified)
    VALUES (v_key_id, 'en', p_en, true, true)
    ON CONFLICT (translation_key_id, language_code) DO UPDATE
    SET value = EXCLUDED.value, is_verified = true;

    -- Insertar traducciones en francés
    INSERT INTO app.translations (translation_key_id, language_code, value, is_active, is_verified)
    VALUES (v_key_id, 'fr', p_fr, true, true)
    ON CONFLICT (translation_key_id, language_code) DO UPDATE
    SET value = EXCLUDED.value, is_verified = true;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION insert_translation IS 'Función helper temporal para insertar traducciones (se eliminará al final)';

SELECT 'TRANSLATIONS: Función helper creada' AS status;
