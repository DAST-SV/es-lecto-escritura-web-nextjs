-- supabase/schemas/books/00_init.sql
-- ============================================================================
-- MÓDULO: books
-- DESCRIPCIÓN: Inicialización del schema books
-- ============================================================================

-- Crear schema si no existe
CREATE SCHEMA IF NOT EXISTS books;

-- Configurar search_path
SET search_path TO books, app, public;

-- Grants básicos
GRANT USAGE ON SCHEMA books TO authenticated;
GRANT USAGE ON SCHEMA books TO anon;

SELECT 'BOOKS: Schema inicializado' AS status;
