-- ======================================================
-- TABLAS DE CATÁLOGO (Datos de referencia)
-- Archivo: catalogs/tables.sql
-- ======================================================

SET search_path TO books, public;

-- ==============================================
-- Tabla: book_types
-- ==============================================
CREATE TABLE book_types (
    id SMALLINT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE book_types IS 'Catálogo de tipos de libros (oficial vs usuario)';
COMMENT ON COLUMN book_types.id IS 'Identificador único del tipo';
COMMENT ON COLUMN book_types.name IS 'Nombre del tipo (ej: official, user)';
COMMENT ON COLUMN book_types.description IS 'Descripción opcional del tipo';

-- ==============================================
-- Tabla: book_levels
-- ==============================================
CREATE TABLE book_levels (
    id SMALLINT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    min_age SMALLINT NULL,
    max_age SMALLINT NULL,
    description TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE book_levels IS 'Catálogo de niveles de lectura según edad';
COMMENT ON COLUMN book_levels.id IS 'Identificador único del nivel';
COMMENT ON COLUMN book_levels.name IS 'Nombre descriptivo del rango de edad';
COMMENT ON COLUMN book_levels.min_age IS 'Edad mínima recomendada';
COMMENT ON COLUMN book_levels.max_age IS 'Edad máxima recomendada (NULL para sin límite)';

-- ==============================================
-- Tabla: book_categories
-- ==============================================
CREATE TABLE book_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NULL UNIQUE,
    description TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE book_categories IS 'Catálogo de categorías literarias';
COMMENT ON COLUMN book_categories.id IS 'Identificador único de la categoría';
COMMENT ON COLUMN book_categories.name IS 'Nombre de la categoría (ej: Cuentos, Fábulas)';
COMMENT ON COLUMN book_categories.slug IS 'Versión URL-friendly del nombre';

-- ==============================================
-- Tabla: book_values
-- ==============================================
CREATE TABLE book_values (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE book_values IS 'Catálogo de valores educativos y morales';
COMMENT ON COLUMN book_values.id IS 'Identificador único del valor';
COMMENT ON COLUMN book_values.name IS 'Nombre del valor (ej: Responsabilidad, Honestidad)';

-- ==============================================
-- Tabla: book_genres
-- ==============================================
CREATE TABLE book_genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE book_genres IS 'Catálogo de géneros literarios';
COMMENT ON COLUMN book_genres.id IS 'Identificador único del género';
COMMENT ON COLUMN book_genres.name IS 'Nombre del género (ej: cuento, novela, poesía)';

-- ==============================================
-- Tabla: book_languages
-- ==============================================
CREATE TABLE book_languages (
    id SERIAL PRIMARY KEY,
    iso_code VARCHAR(5) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE book_languages IS 'Catálogo de idiomas disponibles';
COMMENT ON COLUMN book_languages.id IS 'Identificador único del idioma';
COMMENT ON COLUMN book_languages.iso_code IS 'Código ISO del idioma (ej: es, en, fr)';
COMMENT ON COLUMN book_languages.is_active IS 'Indica si el idioma está habilitado';

-- ==============================================
-- Tabla: book_tags
-- ==============================================
CREATE TABLE book_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NULL UNIQUE,
    description TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE book_tags IS 'Catálogo de etiquetas temáticas para libros';
COMMENT ON COLUMN book_tags.id IS 'Identificador único de la etiqueta';
COMMENT ON COLUMN book_tags.name IS 'Nombre de la etiqueta (ej: Magia, Aventuras)';
COMMENT ON COLUMN book_tags.slug IS 'Versión URL-friendly del nombre';
