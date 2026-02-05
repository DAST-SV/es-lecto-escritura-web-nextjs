-- supabase/schemas/books/00_init.sql
-- ============================================================================
-- MODULO: books
-- DESCRIPCION: Inicializacion del schema books
-- ============================================================================

-- Crear schema si no existe
CREATE SCHEMA IF NOT EXISTS books;

-- Configurar search_path
SET search_path TO books, app, public;

-- ============================================================================
-- GRANTS INICIALES
-- ============================================================================

-- Acceso al schema
GRANT USAGE ON SCHEMA books TO anon;
GRANT USAGE ON SCHEMA books TO authenticated;

-- Permisos para authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA books TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA books TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA books TO authenticated;

-- Permisos para anon (lectura publica)
GRANT SELECT ON ALL TABLES IN SCHEMA books TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA books TO anon;

-- Permisos para service_role
GRANT ALL ON ALL TABLES IN SCHEMA books TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA books TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA books TO service_role;

-- Default privileges para futuras tablas
ALTER DEFAULT PRIVILEGES IN SCHEMA books GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA books GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA books GRANT ALL ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA books GRANT USAGE, SELECT ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA books GRANT ALL ON SEQUENCES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA books GRANT EXECUTE ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA books GRANT EXECUTE ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA books GRANT EXECUTE ON FUNCTIONS TO service_role;

SELECT 'BOOKS: Schema inicializado con grants' AS status;
