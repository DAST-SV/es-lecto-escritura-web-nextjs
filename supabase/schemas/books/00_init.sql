-- ======================================================
-- SISTEMA DE GESTIÓN DE LIBROS DIGITALES INTERACTIVOS
-- Archivo: 00_init.sql
-- Descripción: Inicialización del schema y permisos base
-- ======================================================

-- Crear schema
CREATE SCHEMA IF NOT EXISTS books;

-- Comentario del schema
COMMENT ON SCHEMA books IS 'Sistema completo de gestión de libros digitales interactivos';

-- Permisos básicos
GRANT USAGE ON SCHEMA books TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA books TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA books TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA books TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA books TO postgres, authenticated, service_role;

-- Permisos por defecto para objetos futuros
ALTER DEFAULT PRIVILEGES IN SCHEMA books GRANT ALL ON TABLES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA books GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA books GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA books GRANT USAGE, SELECT ON SEQUENCES TO authenticated, service_role;

-- Establecer search path
SET search_path TO books, public;
