-- ======================================================
-- Tabla: books (principal)
-- Archivo: tables/books.sql
-- ======================================================

SET search_path TO books, public;

CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NULL,
    type_id SMALLINT NOT NULL,
    level_id SMALLINT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    cover_url TEXT NULL,
    pdf_url TEXT NULL,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    view_count INTEGER NOT NULL DEFAULT 0,
    deleted_at TIMESTAMPTZ NULL,
    deleted_by UUID NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ NULL,

    CONSTRAINT fk_books_user FOREIGN KEY (user_id)
        REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_books_type FOREIGN KEY (type_id)
        REFERENCES book_types(id) ON DELETE RESTRICT,
    CONSTRAINT fk_books_level FOREIGN KEY (level_id)
        REFERENCES book_levels(id) ON DELETE SET NULL
);

COMMENT ON TABLE books IS 'Tabla principal de libros del sistema';
COMMENT ON COLUMN books.id IS 'Identificador único del libro';
COMMENT ON COLUMN books.user_id IS 'Usuario creador (NULL si es libro oficial)';
COMMENT ON COLUMN books.type_id IS 'Tipo de libro (oficial o usuario)';
COMMENT ON COLUMN books.level_id IS 'Nivel de lectura recomendado';
COMMENT ON COLUMN books.title IS 'Título del libro';
COMMENT ON COLUMN books.description IS 'Descripción o sinopsis del libro';
COMMENT ON COLUMN books.cover_url IS 'URL de la imagen de portada';
COMMENT ON COLUMN books.pdf_url IS 'URL del archivo PDF del libro';
COMMENT ON COLUMN books.is_published IS 'Indica si el libro está visible públicamente';
COMMENT ON COLUMN books.is_featured IS 'Indica si el libro está destacado en la plataforma';
COMMENT ON COLUMN books.view_count IS 'Número de veces que se ha visualizado';
COMMENT ON COLUMN books.deleted_at IS 'Fecha de eliminación lógica (NULL si está activo)';
COMMENT ON COLUMN books.deleted_by IS 'Usuario que eliminó el registro';
COMMENT ON COLUMN books.published_at IS 'Fecha en que se publicó el libro';

CREATE INDEX idx_books_user ON books(user_id);
CREATE INDEX idx_books_type ON books(type_id);
CREATE INDEX idx_books_level ON books(level_id);
CREATE INDEX idx_books_published ON books(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_books_featured ON books(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_books_not_deleted ON books(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_books_created_at ON books(created_at DESC);
CREATE INDEX idx_books_title_search ON books USING gin(to_tsvector('spanish', title));
CREATE INDEX idx_books_description_search ON books USING gin(to_tsvector('spanish', description));
CREATE INDEX idx_books_featured_active ON books(created_at DESC)
    WHERE is_featured = TRUE AND is_published = TRUE AND deleted_at IS NULL;
