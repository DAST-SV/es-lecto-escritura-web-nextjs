-- supabase/schemas/app/auth/00_init.sql
-- ============================================================================
-- MÓDULO: AUTH - INICIALIZACIÓN
-- DESCRIPCIÓN: Crear schema, extensiones y configuración inicial
-- ============================================================================

-- Crear schema si no existe
CREATE SCHEMA IF NOT EXISTS app;
SET search_path TO app, public;

-- ============================================================================
-- EXTENSIONES
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- GRANTS INICIALES
-- ============================================================================

GRANT USAGE ON SCHEMA app TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA app TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA app TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA app TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app TO service_role;

SELECT 'AUTH: Inicialización completada' AS status;
