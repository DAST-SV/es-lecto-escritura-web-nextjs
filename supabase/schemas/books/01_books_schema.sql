-- ======================================================
-- SISTEMA DE GESTIÓN DE LIBROS DIGITALES INTERACTIVOS
-- Archivo: 01_books_schema.sql
-- Descripción: Creación del schema, tablas y relaciones
-- ======================================================

-- ======================================================
-- PASO 1: CONFIGURACIÓN INICIAL DEL SCHEMA
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

-- ⭐ ESTABLECER SEARCH PATH - Ahora podemos trabajar sin prefijos
SET search_path TO books, public;

-- ======================================================
-- PASO 2: TABLAS DE CATÁLOGO (Datos de referencia)
-- ======================================================

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

-- ======================================================
-- PASO 3: ENTIDADES PRINCIPALES
-- ======================================================

-- ==============================================
-- Tabla: book_authors
-- ==============================================
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

-- ==============================================
-- Tabla: book_characters
-- ==============================================
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

-- ==============================================
-- Tabla: books (principal)
-- ==============================================
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NULL,
    type_id SMALLINT NOT NULL,
    level_id SMALLINT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    cover_url TEXT NULL,
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

-- ==============================================
-- Tabla: book_pages
-- ==============================================
CREATE TABLE book_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL,
    page_number SMALLINT NOT NULL,
    layout VARCHAR(50) NOT NULL DEFAULT 'standard',
    animation VARCHAR(50) NULL,
    title TEXT NULL,
    content TEXT NULL,
    image_url TEXT NULL,
    audio_url TEXT NULL,
    interactive_game VARCHAR(100) NULL,
    items JSONB NULL,
    background_url TEXT NULL,
    background_color VARCHAR(50) NULL,
    text_color VARCHAR(50) NULL,
    font VARCHAR(50) NULL,
    border_style VARCHAR(50) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_book_pages_book FOREIGN KEY (book_id)
        REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT uq_book_pages_book_page_number UNIQUE (book_id, page_number),
    CONSTRAINT chk_book_pages_page_number_positive CHECK (page_number > 0)
);

COMMENT ON TABLE book_pages IS 'Páginas individuales de cada libro';
COMMENT ON COLUMN book_pages.id IS 'Identificador único de la página';
COMMENT ON COLUMN book_pages.book_id IS 'Libro al que pertenece la página';
COMMENT ON COLUMN book_pages.page_number IS 'Número de orden de la página';
COMMENT ON COLUMN book_pages.layout IS 'Tipo de layout (ej: standard, full-image, split)';
COMMENT ON COLUMN book_pages.animation IS 'Tipo de animación aplicada';
COMMENT ON COLUMN book_pages.title IS 'Título de la página (opcional)';
COMMENT ON COLUMN book_pages.content IS 'Texto/contenido principal de la página';
COMMENT ON COLUMN book_pages.image_url IS 'URL de la imagen principal';
COMMENT ON COLUMN book_pages.audio_url IS 'URL del audio narrado';
COMMENT ON COLUMN book_pages.interactive_game IS 'Identificador del juego interactivo';
COMMENT ON COLUMN book_pages.items IS 'Elementos adicionales en formato JSON (ej: stickers, objetos interactivos)';
COMMENT ON COLUMN book_pages.background_url IS 'URL de la imagen de fondo';
COMMENT ON COLUMN book_pages.background_color IS 'Color de fondo en formato CSS';
COMMENT ON COLUMN book_pages.text_color IS 'Color del texto en formato CSS';
COMMENT ON COLUMN book_pages.font IS 'Fuente tipográfica (ej: Arial, Comic Sans)';
COMMENT ON COLUMN book_pages.border_style IS 'Estilo del borde en formato CSS';

CREATE INDEX idx_book_pages_book ON book_pages(book_id);
CREATE INDEX idx_book_pages_book_page_number ON book_pages(book_id, page_number);
CREATE INDEX idx_book_pages_items_gin ON book_pages USING gin(items);

-- ======================================================
-- PASO 4: TABLAS DE RELACIÓN (Many-to-Many)
-- ======================================================

-- ==============================================
-- Tabla: books_authors (relación)
-- ==============================================
CREATE TABLE books_authors (
    book_id UUID NOT NULL,
    author_id UUID NOT NULL,
    author_order SMALLINT NOT NULL DEFAULT 1,
    PRIMARY KEY (book_id, author_id),
    CONSTRAINT fk_books_authors_book FOREIGN KEY (book_id)
        REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT fk_books_authors_author FOREIGN KEY (author_id)
        REFERENCES book_authors(id) ON DELETE CASCADE
);

COMMENT ON TABLE books_authors IS 'Relación muchos a muchos entre libros y autores';
COMMENT ON COLUMN books_authors.author_order IS 'Orden de aparición del autor';

CREATE INDEX idx_books_authors_book ON books_authors(book_id);
CREATE INDEX idx_books_authors_author ON books_authors(author_id);
CREATE INDEX idx_books_authors_lookup ON books_authors(author_id, book_id);

-- ==============================================
-- Tabla: books_characters (relación)
-- ==============================================
CREATE TABLE books_characters (
    book_id UUID NOT NULL,
    character_id UUID NOT NULL,
    is_main BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (book_id, character_id),
    CONSTRAINT fk_books_characters_book FOREIGN KEY (book_id)
        REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT fk_books_characters_character FOREIGN KEY (character_id)
        REFERENCES book_characters(id) ON DELETE CASCADE
);

COMMENT ON TABLE books_characters IS 'Relación muchos a muchos entre libros y personajes';
COMMENT ON COLUMN books_characters.is_main IS 'Indica si el personaje es protagonista';

CREATE INDEX idx_books_characters_book ON books_characters(book_id);
CREATE INDEX idx_books_characters_character ON books_characters(character_id);

-- ==============================================
-- Tabla: books_categories (relación)
-- ==============================================
CREATE TABLE books_categories (
    book_id UUID NOT NULL,
    category_id INTEGER NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (book_id, category_id),
    CONSTRAINT fk_books_categories_book FOREIGN KEY (book_id)
        REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT fk_books_categories_category FOREIGN KEY (category_id)
        REFERENCES book_categories(id) ON DELETE CASCADE
);

COMMENT ON TABLE books_categories IS 'Relación muchos a muchos entre libros y categorías';
COMMENT ON COLUMN books_categories.is_primary IS 'Indica si es la categoría principal';

CREATE INDEX idx_books_categories_book ON books_categories(book_id);
CREATE INDEX idx_books_categories_category ON books_categories(category_id);

-- ==============================================
-- Tabla: books_values (relación)
-- ==============================================
CREATE TABLE books_values (
    book_id UUID NOT NULL,
    value_id INTEGER NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (book_id, value_id),
    CONSTRAINT fk_books_values_book FOREIGN KEY (book_id)
        REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT fk_books_values_value FOREIGN KEY (value_id)
        REFERENCES book_values(id) ON DELETE CASCADE
);

COMMENT ON TABLE books_values IS 'Relación muchos a muchos entre libros y valores educativos';
COMMENT ON COLUMN books_values.is_primary IS 'Indica si es el valor principal del libro';

CREATE INDEX idx_books_values_book ON books_values(book_id);
CREATE INDEX idx_books_values_value ON books_values(value_id);

-- ==============================================
-- Tabla: books_genres (relación)
-- ==============================================
CREATE TABLE books_genres (
    book_id UUID NOT NULL,
    genre_id INTEGER NOT NULL,
    PRIMARY KEY (book_id, genre_id),
    CONSTRAINT fk_books_genres_book FOREIGN KEY (book_id)
        REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT fk_books_genres_genre FOREIGN KEY (genre_id)
        REFERENCES book_genres(id) ON DELETE CASCADE
);

COMMENT ON TABLE books_genres IS 'Relación muchos a muchos entre libros y géneros literarios';

CREATE INDEX idx_books_genres_book ON books_genres(book_id);
CREATE INDEX idx_books_genres_genre ON books_genres(genre_id);

-- ==============================================
-- Tabla: books_languages (relación)
-- ==============================================
CREATE TABLE books_languages (
    book_id UUID NOT NULL,
    language_id INTEGER NOT NULL,
    is_original BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (book_id, language_id),
    CONSTRAINT fk_books_languages_book FOREIGN KEY (book_id)
        REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT fk_books_languages_language FOREIGN KEY (language_id)
        REFERENCES book_languages(id) ON DELETE CASCADE
);

COMMENT ON TABLE books_languages IS 'Idiomas disponibles para cada libro';
COMMENT ON COLUMN books_languages.is_original IS 'Indica si es el idioma original del libro';

CREATE INDEX idx_books_languages_book ON books_languages(book_id);
CREATE INDEX idx_books_languages_language ON books_languages(language_id);

-- ==============================================
-- Tabla: books_tags (relación)
-- ==============================================
CREATE TABLE books_tags (
    book_id UUID NOT NULL,
    tag_id INTEGER NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (book_id, tag_id),
    CONSTRAINT fk_books_tags_book FOREIGN KEY (book_id)
        REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT fk_books_tags_tag FOREIGN KEY (tag_id)
        REFERENCES book_tags(id) ON DELETE CASCADE
);

COMMENT ON TABLE books_tags IS 'Relación muchos a muchos entre libros y etiquetas temáticas';
COMMENT ON COLUMN books_tags.is_primary IS 'Indica si es la etiqueta principal';

CREATE INDEX idx_books_tags_book ON books_tags(book_id);
CREATE INDEX idx_books_tags_tag ON books_tags(tag_id);

-- ======================================================
-- PASO 5: TABLAS DE AUDITORÍA Y ANALYTICS
-- ======================================================

-- ==============================================
-- Tabla: book_audit_logs
-- ==============================================
CREATE TABLE book_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL,
    old_data JSONB NULL,
    new_data JSONB NULL,
    user_id UUID NULL,
    ip_address INET NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_action CHECK (action IN ('INSERT', 'UPDATE', 'DELETE'))
);

COMMENT ON TABLE book_audit_logs IS 'Registro de auditoría para cambios importantes en el sistema';

CREATE INDEX idx_book_audit_logs_table_record ON book_audit_logs(table_name, record_id);
CREATE INDEX idx_book_audit_logs_user ON book_audit_logs(user_id);
CREATE INDEX idx_book_audit_logs_created_at ON book_audit_logs(created_at DESC);

-- ==============================================
-- Tabla: book_views
-- ==============================================
CREATE TABLE book_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL,
    user_id UUID NULL,
    session_id UUID NULL,
    page_number SMALLINT NULL,
    view_duration INTEGER NULL,
    device_type VARCHAR(50) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_book_views_book FOREIGN KEY (book_id)
        REFERENCES books(id) ON DELETE CASCADE
);

COMMENT ON TABLE book_views IS 'Registro de visualizaciones de libros para analytics';
COMMENT ON COLUMN book_views.view_duration IS 'Duración de la visualización en segundos';

CREATE INDEX idx_book_views_book ON book_views(book_id);
CREATE INDEX idx_book_views_user ON book_views(user_id);
CREATE INDEX idx_book_views_created_at ON book_views(created_at DESC);