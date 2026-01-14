-- ============================================
-- SCRIPT 01: SCHEMA Y TIPOS BASE
-- ============================================
-- Crea schema app y tipos enumerados
-- ============================================

-- Crear schema si no existe
CREATE SCHEMA IF NOT EXISTS app;

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TIPOS ENUMERADOS
-- ============================================

-- Tipo para permission_type (grant/deny)
DO $$ BEGIN
  CREATE TYPE app.permission_type AS ENUM ('grant', 'deny');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tipo para códigos de idioma
DO $$ BEGIN
  CREATE TYPE app.language_code AS ENUM ('es', 'en', 'fr', 'it');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- FUNCIÓN AUXILIAR: updated_at trigger
-- ============================================

CREATE OR REPLACE FUNCTION app.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON SCHEMA app IS 'Schema principal de la aplicación - contiene todas las tablas de negocio';
COMMENT ON TYPE app.permission_type IS 'Tipo de permiso individual: grant (permitir) o deny (bloquear)';
COMMENT ON TYPE app.language_code IS 'Códigos de idioma soportados por la aplicación';
COMMENT ON FUNCTION app.set_updated_at() IS 'Función trigger para actualizar automáticamente updated_at';

-- ============================================
-- VERIFICAR
-- ============================================

-- Ver tipos creados
SELECT n.nspname as schema, t.typname as type_name
FROM pg_type t
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'app';

-- Debe mostrar: permission_type, language_code
