-- ======================================================
-- Tabla: book_characters
-- Archivo: tables/book_characters.sql
-- ======================================================

SET search_path TO books, public;

CREATE TABLE book_characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(300) NOT NULL,
    description TEXT NULL,
    image_url TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE book_characters IS 'Catálogo de personajes que aparecen en los libros';
COMMENT ON COLUMN book_characters.id IS 'Identificador único del personaje';
COMMENT ON COLUMN book_characters.name IS 'Nombre del personaje';
COMMENT ON COLUMN book_characters.description IS 'Descripción del personaje';
COMMENT ON COLUMN book_characters.image_url IS 'URL de la imagen del personaje';
