-- supabase/schemas/app/auth/types/language_code.sql
-- ============================================================================
-- DOMAIN: language_code
-- DESCRIPCION: Tipo de dato para codigos de idioma ISO 639-1
-- ============================================================================

SET search_path TO app, public;

-- Crear domain para codigos de idioma
-- Formato: 2 letras minusculas, opcionalmente seguido de guion y 2 mayusculas
-- Ejemplos validos: es, en, fr, pt-BR, zh-CN
CREATE DOMAIN app.language_code AS VARCHAR(10)
  CHECK (VALUE ~ '^[a-z]{2}(-[A-Z]{2})?$');

COMMENT ON DOMAIN app.language_code IS 'Codigo de idioma ISO 639-1 (ej: es, en, fr, pt-BR)';

SELECT 'AUTH: Domain language_code creado' AS status;
