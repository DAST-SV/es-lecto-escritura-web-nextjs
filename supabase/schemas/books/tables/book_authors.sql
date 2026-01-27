-- ======================================================
-- Tabla: book_authors
-- Archivo: tables/book_authors.sql
-- ======================================================

SET search_path TO books, public;

CREATE TABLE book_authors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(300) NOT NULL,
    biography TEXT NULL,
    photo_url TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE book_authors IS 'Catálogo de autores de libros';
COMMENT ON COLUMN book_authors.id IS 'Identificador único del autor';
COMMENT ON COLUMN book_authors.name IS 'Nombre completo del autor';
COMMENT ON COLUMN book_authors.biography IS 'Biografía o descripción del autor';
COMMENT ON COLUMN book_authors.photo_url IS 'URL de la foto del autor';

CREATE INDEX idx_book_authors_name_search ON book_authors USING gin(to_tsvector('spanish', name));
