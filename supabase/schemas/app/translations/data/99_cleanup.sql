-- supabase/schemas/app/translations/data/99_cleanup.sql
-- ============================================================================
-- TRANSLATIONS DATA: CLEANUP Y VERIFICACIÓN
-- DESCRIPCIÓN: Limpieza de funciones temporales y verificación final
-- ============================================================================

SET search_path TO app, public;

-- ============================================================================
-- LIMPIEZA: Eliminar función helper
-- ============================================================================

DROP FUNCTION IF EXISTS insert_translation;

SELECT 'TRANSLATIONS: Función helper eliminada' AS status;

-- ============================================================================
-- VERIFICACIÓN: Cantidad de claves por namespace
-- ============================================================================

SELECT
    namespace_slug,
    COUNT(*) as total_keys
FROM app.translation_keys
GROUP BY namespace_slug
ORDER BY namespace_slug;

-- ============================================================================
-- VERIFICACIÓN: Cantidad de traducciones por idioma
-- ============================================================================

SELECT
    language_code,
    COUNT(*) as total_translations
FROM app.translations
GROUP BY language_code
ORDER BY language_code;

-- ============================================================================
-- VERIFICACIÓN: Muestra de traducciones de auth
-- ============================================================================

SELECT
    tk.namespace_slug,
    tk.key_name,
    t.language_code,
    t.value
FROM app.translation_keys tk
JOIN app.translations t ON tk.id = t.translation_key_id
WHERE tk.namespace_slug = 'auth'
ORDER BY tk.key_name, t.language_code
LIMIT 30;

-- ============================================================================
-- RESUMEN ESPERADO
-- ============================================================================
-- auth: ~60 claves
-- navigation: ~11 claves
-- common: ~14 claves
-- errors: ~4 claves
-- TOTAL: ~89 claves x 3 idiomas = ~267 traducciones
-- ============================================================================

SELECT 'TRANSLATIONS: Verificación completada - Revisa resultados arriba' AS status;
