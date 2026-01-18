-- ============================================
-- SCRIPT 01: SCHEMA Y TIPOS BASE
-- ============================================

-- Crear schema
CREATE SCHEMA IF NOT EXISTS app;

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tipo: permission_type
DO $$ BEGIN
  CREATE TYPE app.permission_type AS ENUM ('grant', 'deny');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tipo: language_code
DO $$ BEGIN
  CREATE TYPE app.language_code AS ENUM ('es', 'en', 'fr', 'it');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Función auxiliar: updated_at trigger
CREATE OR REPLACE FUNCTION app.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comentarios
COMMENT ON SCHEMA app IS 'Schema principal de la aplicación';
COMMENT ON TYPE app.permission_type IS 'Tipo de permiso: grant (permitir) o deny (bloquear)';
COMMENT ON TYPE app.language_code IS 'Códigos de idioma: es, en, fr, it';
COMMENT ON FUNCTION app.set_updated_at() IS 'Actualiza automáticamente updated_at';

-- Verificar
SELECT n.nspname as schema, t.typname as type_name
FROM pg_type t
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'app';