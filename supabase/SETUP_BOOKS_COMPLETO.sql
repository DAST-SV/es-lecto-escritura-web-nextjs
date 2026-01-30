-- ======================================================
-- SETUP COMPLETO DEL SCHEMA BOOKS
-- ======================================================
-- Este archivo contiene toda la estructura del sistema de libros
-- Incluye: tablas, funciones, triggers, vistas, RLS y storage
-- ======================================================

-- ======================================================
-- PARTE 1: INICIALIZACIÓN DEL SCHEMA
-- ======================================================

CREATE SCHEMA IF NOT EXISTS books;

COMMENT ON SCHEMA books IS 'Sistema completo de gestión de libros digitales interactivos';

GRANT USAGE ON SCHEMA books TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA books TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA books TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA books TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA books TO postgres, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA books GRANT ALL ON TABLES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA books GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA books GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA books GRANT USAGE, SELECT ON SEQUENCES TO authenticated, service_role;

SET search_path TO books, public;

-- ======================================================
-- PARTE 2: TIPOS ENUM
-- ======================================================

-- Tipo para roles de colaboradores
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'collaborator_role' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'books')) THEN
        CREATE TYPE books.collaborator_role AS ENUM ('author', 'co_author', 'editor', 'illustrator', 'translator');
    END IF;
END $$;

-- Tipo para niveles de acceso
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'access_type' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'books')) THEN
        CREATE TYPE books.access_type AS ENUM ('public', 'freemium', 'premium', 'community');
    END IF;
END $$;

-- ======================================================
-- PARTE 3: FUNCIONES BASE
-- ======================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION books.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION books.update_updated_at_column() IS 'Actualiza automáticamente el campo updated_at al modificar un registro';

-- ======================================================
-- PARTE 4: TABLAS DE CATÁLOGO
-- ======================================================

-- Tabla: book_types
CREATE TABLE IF NOT EXISTS books.book_types (
    id SMALLINT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE books.book_types IS 'Catálogo de tipos de libros (oficial vs usuario)';

-- Tabla: book_levels
CREATE TABLE IF NOT EXISTS books.book_levels (
    id SMALLINT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    min_age SMALLINT NULL,
    max_age SMALLINT NULL,
    description TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE books.book_levels IS 'Catálogo de niveles de lectura según edad';

-- Tabla: book_categories
CREATE TABLE IF NOT EXISTS books.book_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NULL UNIQUE,
    description TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE books.book_categories IS 'Catálogo de categorías literarias';

-- Tabla: book_values
CREATE TABLE IF NOT EXISTS books.book_values (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE books.book_values IS 'Catálogo de valores educativos y morales';

-- Tabla: book_genres
CREATE TABLE IF NOT EXISTS books.book_genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE books.book_genres IS 'Catálogo de géneros literarios';

-- Tabla: book_languages
CREATE TABLE IF NOT EXISTS books.book_languages (
    id SERIAL PRIMARY KEY,
    iso_code VARCHAR(5) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE books.book_languages IS 'Catálogo de idiomas disponibles';

-- Tabla: book_tags
CREATE TABLE IF NOT EXISTS books.book_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NULL UNIQUE,
    description TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE books.book_tags IS 'Catálogo de etiquetas temáticas para libros';

-- ======================================================
-- PARTE 5: TABLAS PRINCIPALES
-- ======================================================

-- Tabla: book_authors
CREATE TABLE IF NOT EXISTS books.book_authors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(300) NOT NULL,
    biography TEXT NULL,
    photo_url TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE books.book_authors IS 'Catálogo de autores de libros';
CREATE INDEX IF NOT EXISTS idx_book_authors_name_search ON books.book_authors USING gin(to_tsvector('spanish', name));

-- Tabla: book_characters
CREATE TABLE IF NOT EXISTS books.book_characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(300) NOT NULL,
    description TEXT NULL,
    image_url TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE books.book_characters IS 'Catálogo de personajes que aparecen en los libros';

-- Tabla: books (principal)
CREATE TABLE IF NOT EXISTS books.books (
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
    access_type books.access_type NOT NULL DEFAULT 'public',
    free_pages_count SMALLINT DEFAULT 5,
    deleted_at TIMESTAMPTZ NULL,
    deleted_by UUID NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ NULL,

    CONSTRAINT fk_books_user FOREIGN KEY (user_id)
        REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_books_type FOREIGN KEY (type_id)
        REFERENCES books.book_types(id) ON DELETE RESTRICT,
    CONSTRAINT fk_books_level FOREIGN KEY (level_id)
        REFERENCES books.book_levels(id) ON DELETE SET NULL
);

COMMENT ON TABLE books.books IS 'Tabla principal de libros del sistema';
COMMENT ON COLUMN books.books.access_type IS 'Tipo de acceso: public (gratis), freemium (parcialmente gratis), premium (suscripción plataforma), community (suscripción comunidad del autor)';
COMMENT ON COLUMN books.books.free_pages_count IS 'Número de páginas gratuitas en modo freemium (por defecto 5)';

CREATE INDEX IF NOT EXISTS idx_books_user ON books.books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_type ON books.books(type_id);
CREATE INDEX IF NOT EXISTS idx_books_level ON books.books(level_id);
CREATE INDEX IF NOT EXISTS idx_books_published ON books.books(is_published) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_books_featured ON books.books(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_books_not_deleted ON books.books(id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books.books(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_title_search ON books.books USING gin(to_tsvector('spanish', title));
CREATE INDEX IF NOT EXISTS idx_books_description_search ON books.books USING gin(to_tsvector('spanish', description));
CREATE INDEX IF NOT EXISTS idx_books_featured_active ON books.books(created_at DESC)
    WHERE is_featured = TRUE AND is_published = TRUE AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_books_access_type ON books.books(access_type);

-- Tabla: book_pages
CREATE TABLE IF NOT EXISTS books.book_pages (
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
    access_level books.access_type DEFAULT 'public',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_book_pages_book FOREIGN KEY (book_id)
        REFERENCES books.books(id) ON DELETE CASCADE,
    CONSTRAINT uq_book_pages_book_page_number UNIQUE (book_id, page_number),
    CONSTRAINT chk_book_pages_page_number_positive CHECK (page_number > 0)
);

COMMENT ON TABLE books.book_pages IS 'Páginas individuales de cada libro';
COMMENT ON COLUMN books.book_pages.access_level IS 'Nivel de acceso específico de la página (puede sobrescribir el del libro)';

CREATE INDEX IF NOT EXISTS idx_book_pages_book ON books.book_pages(book_id);
CREATE INDEX IF NOT EXISTS idx_book_pages_book_page_number ON books.book_pages(book_id, page_number);
CREATE INDEX IF NOT EXISTS idx_book_pages_items_gin ON books.book_pages USING gin(items);
CREATE INDEX IF NOT EXISTS idx_book_pages_access_level ON books.book_pages(access_level);

-- Tabla: book_audit_logs
CREATE TABLE IF NOT EXISTS books.book_audit_logs (
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

COMMENT ON TABLE books.book_audit_logs IS 'Registro de auditoría para cambios importantes en el sistema';

CREATE INDEX IF NOT EXISTS idx_book_audit_logs_table_record ON books.book_audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_book_audit_logs_user ON books.book_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_book_audit_logs_created_at ON books.book_audit_logs(created_at DESC);

-- Tabla: book_views
CREATE TABLE IF NOT EXISTS books.book_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL,
    user_id UUID NULL,
    session_id UUID NULL,
    page_number SMALLINT NULL,
    view_duration INTEGER NULL,
    device_type VARCHAR(50) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_book_views_book FOREIGN KEY (book_id)
        REFERENCES books.books(id) ON DELETE CASCADE
);

COMMENT ON TABLE books.book_views IS 'Registro de visualizaciones de libros para analytics';

CREATE INDEX IF NOT EXISTS idx_book_views_book ON books.book_views(book_id);
CREATE INDEX IF NOT EXISTS idx_book_views_user ON books.book_views(user_id);
CREATE INDEX IF NOT EXISTS idx_book_views_created_at ON books.book_views(created_at DESC);

-- ======================================================
-- PARTE 6: TABLAS DE RELACIÓN (Many-to-Many)
-- ======================================================

-- books_authors
CREATE TABLE IF NOT EXISTS books.books_authors (
    book_id UUID NOT NULL,
    author_id UUID NOT NULL,
    author_order SMALLINT NOT NULL DEFAULT 1,
    PRIMARY KEY (book_id, author_id),
    CONSTRAINT fk_books_authors_book FOREIGN KEY (book_id)
        REFERENCES books.books(id) ON DELETE CASCADE,
    CONSTRAINT fk_books_authors_author FOREIGN KEY (author_id)
        REFERENCES books.book_authors(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_books_authors_book ON books.books_authors(book_id);
CREATE INDEX IF NOT EXISTS idx_books_authors_author ON books.books_authors(author_id);

-- books_characters
CREATE TABLE IF NOT EXISTS books.books_characters (
    book_id UUID NOT NULL,
    character_id UUID NOT NULL,
    is_main BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (book_id, character_id),
    CONSTRAINT fk_books_characters_book FOREIGN KEY (book_id)
        REFERENCES books.books(id) ON DELETE CASCADE,
    CONSTRAINT fk_books_characters_character FOREIGN KEY (character_id)
        REFERENCES books.book_characters(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_books_characters_book ON books.books_characters(book_id);
CREATE INDEX IF NOT EXISTS idx_books_characters_character ON books.books_characters(character_id);

-- books_categories
CREATE TABLE IF NOT EXISTS books.books_categories (
    book_id UUID NOT NULL,
    category_id INTEGER NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (book_id, category_id),
    CONSTRAINT fk_books_categories_book FOREIGN KEY (book_id)
        REFERENCES books.books(id) ON DELETE CASCADE,
    CONSTRAINT fk_books_categories_category FOREIGN KEY (category_id)
        REFERENCES books.book_categories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_books_categories_book ON books.books_categories(book_id);
CREATE INDEX IF NOT EXISTS idx_books_categories_category ON books.books_categories(category_id);

-- books_values
CREATE TABLE IF NOT EXISTS books.books_values (
    book_id UUID NOT NULL,
    value_id INTEGER NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (book_id, value_id),
    CONSTRAINT fk_books_values_book FOREIGN KEY (book_id)
        REFERENCES books.books(id) ON DELETE CASCADE,
    CONSTRAINT fk_books_values_value FOREIGN KEY (value_id)
        REFERENCES books.book_values(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_books_values_book ON books.books_values(book_id);
CREATE INDEX IF NOT EXISTS idx_books_values_value ON books.books_values(value_id);

-- books_genres
CREATE TABLE IF NOT EXISTS books.books_genres (
    book_id UUID NOT NULL,
    genre_id INTEGER NOT NULL,
    PRIMARY KEY (book_id, genre_id),
    CONSTRAINT fk_books_genres_book FOREIGN KEY (book_id)
        REFERENCES books.books(id) ON DELETE CASCADE,
    CONSTRAINT fk_books_genres_genre FOREIGN KEY (genre_id)
        REFERENCES books.book_genres(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_books_genres_book ON books.books_genres(book_id);
CREATE INDEX IF NOT EXISTS idx_books_genres_genre ON books.books_genres(genre_id);

-- books_languages
CREATE TABLE IF NOT EXISTS books.books_languages (
    book_id UUID NOT NULL,
    language_id INTEGER NOT NULL,
    is_original BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (book_id, language_id),
    CONSTRAINT fk_books_languages_book FOREIGN KEY (book_id)
        REFERENCES books.books(id) ON DELETE CASCADE,
    CONSTRAINT fk_books_languages_language FOREIGN KEY (language_id)
        REFERENCES books.book_languages(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_books_languages_book ON books.books_languages(book_id);
CREATE INDEX IF NOT EXISTS idx_books_languages_language ON books.books_languages(language_id);

-- books_tags
CREATE TABLE IF NOT EXISTS books.books_tags (
    book_id UUID NOT NULL,
    tag_id INTEGER NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (book_id, tag_id),
    CONSTRAINT fk_books_tags_book FOREIGN KEY (book_id)
        REFERENCES books.books(id) ON DELETE CASCADE,
    CONSTRAINT fk_books_tags_tag FOREIGN KEY (tag_id)
        REFERENCES books.book_tags(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_books_tags_book ON books.books_tags(book_id);
CREATE INDEX IF NOT EXISTS idx_books_tags_tag ON books.books_tags(tag_id);

-- ======================================================
-- PARTE 7: TRADUCCIONES DE LIBROS (Multi-idioma)
-- ======================================================

-- book_translations
CREATE TABLE IF NOT EXISTS books.book_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books.books(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL REFERENCES app.languages(code) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_url TEXT,
    pdf_url TEXT,
    is_original BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_book_translations_book_language UNIQUE(book_id, language_code)
);

COMMENT ON TABLE books.book_translations IS 'Versiones de libros por idioma - cada registro es una versión completa del libro en un idioma específico';
COMMENT ON COLUMN books.book_translations.is_original IS 'Indica si es el idioma original del libro';
COMMENT ON COLUMN books.book_translations.pdf_url IS 'URL del PDF en este idioma específico';

CREATE INDEX IF NOT EXISTS idx_book_translations_book_id ON books.book_translations(book_id);
CREATE INDEX IF NOT EXISTS idx_book_translations_language ON books.book_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_book_translations_active ON books.book_translations(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_book_translations_original ON books.book_translations(is_original) WHERE is_original = TRUE;

-- book_page_translations
CREATE TABLE IF NOT EXISTS books.book_page_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_page_id UUID NOT NULL REFERENCES books.book_pages(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL REFERENCES app.languages(code) ON DELETE CASCADE,
    title TEXT,
    content TEXT,
    image_url TEXT,
    audio_url TEXT,
    audio_timestamps JSONB, -- Para lectura guiada
    text_overlay_data JSONB, -- Para OCR
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_book_page_translations_page_language UNIQUE(book_page_id, language_code)
);

COMMENT ON TABLE books.book_page_translations IS 'Contenido de páginas por idioma - extraído del PDF de cada versión';
COMMENT ON COLUMN books.book_page_translations.audio_timestamps IS 'Timestamps de audio para sincronización palabra por palabra (lectura guiada)';
COMMENT ON COLUMN books.book_page_translations.text_overlay_data IS 'Posiciones de palabras extraídas por OCR para overlay visual (lectura guiada)';

CREATE INDEX IF NOT EXISTS idx_book_page_translations_page_id ON books.book_page_translations(book_page_id);
CREATE INDEX IF NOT EXISTS idx_book_page_translations_language ON books.book_page_translations(language_code);

-- Trigger para actualizar updated_at en traducciones
CREATE OR REPLACE FUNCTION books.update_book_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_book_translations_updated_at ON books.book_translations;
CREATE TRIGGER trg_book_translations_updated_at
    BEFORE UPDATE ON books.book_translations
    FOR EACH ROW
    EXECUTE FUNCTION books.update_book_translations_updated_at();

DROP TRIGGER IF EXISTS trg_book_page_translations_updated_at ON books.book_page_translations;
CREATE TRIGGER trg_book_page_translations_updated_at
    BEFORE UPDATE ON books.book_page_translations
    FOR EACH ROW
    EXECUTE FUNCTION books.update_book_translations_updated_at();

-- ======================================================
-- PARTE 8: TRADUCCIONES DE CATÁLOGOS
-- ======================================================

-- book_category_translations
CREATE TABLE IF NOT EXISTS books.book_category_translations (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES books.book_categories(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL REFERENCES app.languages(code) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_category_translations UNIQUE(category_id, language_code)
);

CREATE INDEX IF NOT EXISTS idx_category_translations_category ON books.book_category_translations(category_id);
CREATE INDEX IF NOT EXISTS idx_category_translations_language ON books.book_category_translations(language_code);

-- book_genre_translations
CREATE TABLE IF NOT EXISTS books.book_genre_translations (
    id SERIAL PRIMARY KEY,
    genre_id INTEGER NOT NULL REFERENCES books.book_genres(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL REFERENCES app.languages(code) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_genre_translations UNIQUE(genre_id, language_code)
);

CREATE INDEX IF NOT EXISTS idx_genre_translations_genre ON books.book_genre_translations(genre_id);
CREATE INDEX IF NOT EXISTS idx_genre_translations_language ON books.book_genre_translations(language_code);

-- book_value_translations
CREATE TABLE IF NOT EXISTS books.book_value_translations (
    id SERIAL PRIMARY KEY,
    value_id INTEGER NOT NULL REFERENCES books.book_values(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL REFERENCES app.languages(code) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_value_translations UNIQUE(value_id, language_code)
);

CREATE INDEX IF NOT EXISTS idx_value_translations_value ON books.book_value_translations(value_id);
CREATE INDEX IF NOT EXISTS idx_value_translations_language ON books.book_value_translations(language_code);

-- book_level_translations
CREATE TABLE IF NOT EXISTS books.book_level_translations (
    id SERIAL PRIMARY KEY,
    level_id SMALLINT NOT NULL REFERENCES books.book_levels(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL REFERENCES app.languages(code) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_level_translations UNIQUE(level_id, language_code)
);

CREATE INDEX IF NOT EXISTS idx_level_translations_level ON books.book_level_translations(level_id);
CREATE INDEX IF NOT EXISTS idx_level_translations_language ON books.book_level_translations(language_code);

-- book_tag_translations
CREATE TABLE IF NOT EXISTS books.book_tag_translations (
    id SERIAL PRIMARY KEY,
    tag_id INTEGER NOT NULL REFERENCES books.book_tags(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL REFERENCES app.languages(code) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_tag_translations UNIQUE(tag_id, language_code)
);

CREATE INDEX IF NOT EXISTS idx_tag_translations_tag ON books.book_tag_translations(tag_id);
CREATE INDEX IF NOT EXISTS idx_tag_translations_language ON books.book_tag_translations(language_code);

-- Funciones helper para catálogos traducidos
CREATE OR REPLACE FUNCTION books.get_categories_translated(p_language_code VARCHAR DEFAULT 'es')
RETURNS TABLE (
    id INTEGER,
    name VARCHAR,
    description TEXT,
    slug VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        COALESCE(t.name, c.name) AS name,
        COALESCE(t.description, c.description) AS description,
        c.slug
    FROM books.book_categories c
    LEFT JOIN books.book_category_translations t
        ON t.category_id = c.id
        AND t.language_code = p_language_code
    ORDER BY COALESCE(t.name, c.name);
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION books.get_genres_translated(p_language_code VARCHAR DEFAULT 'es')
RETURNS TABLE (
    id INTEGER,
    name VARCHAR,
    description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        g.id,
        COALESCE(t.name, g.name) AS name,
        COALESCE(t.description, g.description) AS description
    FROM books.book_genres g
    LEFT JOIN books.book_genre_translations t
        ON t.genre_id = g.id
        AND t.language_code = p_language_code
    ORDER BY COALESCE(t.name, g.name);
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION books.get_values_translated(p_language_code VARCHAR DEFAULT 'es')
RETURNS TABLE (
    id INTEGER,
    name VARCHAR,
    description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        v.id,
        COALESCE(t.name, v.name) AS name,
        COALESCE(t.description, v.description) AS description
    FROM books.book_values v
    LEFT JOIN books.book_value_translations t
        ON t.value_id = v.id
        AND t.language_code = p_language_code
    ORDER BY COALESCE(t.name, v.name);
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION books.get_levels_translated(p_language_code VARCHAR DEFAULT 'es')
RETURNS TABLE (
    id SMALLINT,
    name VARCHAR,
    description TEXT,
    min_age SMALLINT,
    max_age SMALLINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        l.id,
        COALESCE(t.name, l.name) AS name,
        COALESCE(t.description, l.description) AS description,
        l.min_age,
        l.max_age
    FROM books.book_levels l
    LEFT JOIN books.book_level_translations t
        ON t.level_id = l.id
        AND t.language_code = p_language_code
    ORDER BY l.min_age;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION books.get_tags_translated(p_language_code VARCHAR DEFAULT 'es')
RETURNS TABLE (
    id INTEGER,
    name VARCHAR,
    slug VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        tg.id,
        COALESCE(t.name, tg.name) AS name,
        tg.slug
    FROM books.book_tags tg
    LEFT JOIN books.book_tag_translations t
        ON t.tag_id = tg.id
        AND t.language_code = p_language_code
    ORDER BY COALESCE(t.name, tg.name);
END;
$$ LANGUAGE plpgsql STABLE;

-- ======================================================
-- PARTE 9: SISTEMA DE COLABORADORES
-- ======================================================

CREATE TABLE IF NOT EXISTS books.book_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books.books(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role books.collaborator_role NOT NULL DEFAULT 'author',
    display_order SMALLINT DEFAULT 1,
    is_primary BOOLEAN DEFAULT FALSE,
    contribution_description TEXT,
    revenue_share_percentage DECIMAL(5,2) DEFAULT 0,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    added_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_book_collaborators UNIQUE(book_id, user_id, role)
);

COMMENT ON TABLE books.book_collaborators IS 'Colaboradores de libros vinculados a usuarios reales de la plataforma';

CREATE INDEX IF NOT EXISTS idx_book_collaborators_book ON books.book_collaborators(book_id);
CREATE INDEX IF NOT EXISTS idx_book_collaborators_user ON books.book_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_book_collaborators_role ON books.book_collaborators(role);
CREATE INDEX IF NOT EXISTS idx_book_collaborators_primary ON books.book_collaborators(is_primary) WHERE is_primary = TRUE;

-- Trigger para updated_at en colaboradores
CREATE OR REPLACE FUNCTION books.update_collaborators_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_book_collaborators_updated_at ON books.book_collaborators;
CREATE TRIGGER trg_book_collaborators_updated_at
    BEFORE UPDATE ON books.book_collaborators
    FOR EACH ROW
    EXECUTE FUNCTION books.update_collaborators_updated_at();

-- Vista de colaboradores con información completa
CREATE OR REPLACE VIEW books.v_book_collaborators_full AS
SELECT
    bc.id,
    bc.book_id,
    bc.user_id,
    bc.role,
    bc.display_order,
    bc.is_primary,
    bc.contribution_description,
    bc.revenue_share_percentage,
    bc.added_at,
    COALESCE(up.display_name, up.first_name || ' ' || up.last_name, au.email) AS user_display_name,
    up.avatar_url AS user_avatar_url,
    up.bio AS user_bio,
    ap.username AS author_username,
    ap.is_verified AS author_is_verified
FROM books.book_collaborators bc
JOIN auth.users au ON au.id = bc.user_id
LEFT JOIN app.user_profiles up ON up.user_id = bc.user_id
LEFT JOIN app.author_profiles ap ON ap.user_id = bc.user_id
ORDER BY bc.book_id, bc.display_order, bc.added_at;

-- Función para buscar usuarios para colaboración
CREATE OR REPLACE FUNCTION books.search_users_for_collaboration(
    p_search_term VARCHAR,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    user_id UUID,
    display_name VARCHAR,
    email VARCHAR,
    avatar_url TEXT,
    is_author BOOLEAN,
    author_username VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        au.id AS user_id,
        COALESCE(up.display_name, up.first_name || ' ' || up.last_name)::VARCHAR AS display_name,
        au.email::VARCHAR,
        up.avatar_url,
        (ap.user_id IS NOT NULL) AS is_author,
        ap.username AS author_username
    FROM auth.users au
    LEFT JOIN app.user_profiles up ON up.user_id = au.id
    LEFT JOIN app.author_profiles ap ON ap.user_id = au.id
    WHERE
        au.email ILIKE '%' || p_search_term || '%'
        OR up.display_name ILIKE '%' || p_search_term || '%'
        OR up.first_name ILIKE '%' || p_search_term || '%'
        OR up.last_name ILIKE '%' || p_search_term || '%'
        OR ap.username ILIKE '%' || p_search_term || '%'
    ORDER BY
        CASE WHEN ap.user_id IS NOT NULL THEN 0 ELSE 1 END,
        COALESCE(up.display_name, au.email)
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ======================================================
-- PARTE 10: SISTEMA DE RATINGS Y REVIEWS
-- ======================================================

-- book_ratings
CREATE TABLE IF NOT EXISTS books.book_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books.books(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_book_ratings UNIQUE(book_id, user_id),
    CONSTRAINT chk_rating_range CHECK (rating >= 1 AND rating <= 5)
);

CREATE INDEX IF NOT EXISTS idx_book_ratings_book ON books.book_ratings(book_id);
CREATE INDEX IF NOT EXISTS idx_book_ratings_user ON books.book_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_book_ratings_rating ON books.book_ratings(rating);

-- book_reviews
CREATE TABLE IF NOT EXISTS books.book_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books.books(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(200),
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id),
    rejection_reason TEXT,
    helpful_count INTEGER DEFAULT 0,
    reported_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_book_reviews UNIQUE(book_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_book_reviews_book ON books.book_reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_book_reviews_user ON books.book_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_book_reviews_approved ON books.book_reviews(is_approved) WHERE is_approved = TRUE;
CREATE INDEX IF NOT EXISTS idx_book_reviews_featured ON books.book_reviews(is_featured) WHERE is_featured = TRUE;

-- book_review_votes
CREATE TABLE IF NOT EXISTS books.book_review_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES books.book_reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_review_votes UNIQUE(review_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_review_votes_review ON books.book_review_votes(review_id);

-- book_rating_stats
CREATE TABLE IF NOT EXISTS books.book_rating_stats (
    book_id UUID PRIMARY KEY REFERENCES books.books(id) ON DELETE CASCADE,
    total_ratings INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    rating_1_count INTEGER DEFAULT 0,
    rating_2_count INTEGER DEFAULT 0,
    rating_3_count INTEGER DEFAULT 0,
    rating_4_count INTEGER DEFAULT 0,
    rating_5_count INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_book_rating_stats_average ON books.book_rating_stats(average_rating DESC);

-- Triggers para ratings
CREATE OR REPLACE FUNCTION books.update_book_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_book_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_book_id := OLD.book_id;
    ELSE
        v_book_id := NEW.book_id;
    END IF;

    INSERT INTO books.book_rating_stats (book_id, total_ratings, average_rating, rating_1_count, rating_2_count, rating_3_count, rating_4_count, rating_5_count, updated_at)
    SELECT
        v_book_id,
        COUNT(*),
        COALESCE(AVG(rating), 0),
        COUNT(*) FILTER (WHERE rating = 1),
        COUNT(*) FILTER (WHERE rating = 2),
        COUNT(*) FILTER (WHERE rating = 3),
        COUNT(*) FILTER (WHERE rating = 4),
        COUNT(*) FILTER (WHERE rating = 5),
        NOW()
    FROM books.book_ratings
    WHERE book_id = v_book_id
    ON CONFLICT (book_id) DO UPDATE SET
        total_ratings = EXCLUDED.total_ratings,
        average_rating = EXCLUDED.average_rating,
        rating_1_count = EXCLUDED.rating_1_count,
        rating_2_count = EXCLUDED.rating_2_count,
        rating_3_count = EXCLUDED.rating_3_count,
        rating_4_count = EXCLUDED.rating_4_count,
        rating_5_count = EXCLUDED.rating_5_count,
        updated_at = NOW();

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_book_rating_stats ON books.book_ratings;
CREATE TRIGGER trg_update_book_rating_stats
    AFTER INSERT OR UPDATE OR DELETE ON books.book_ratings
    FOR EACH ROW
    EXECUTE FUNCTION books.update_book_rating_stats();

-- Trigger para contador de reviews
CREATE OR REPLACE FUNCTION books.update_book_review_count()
RETURNS TRIGGER AS $$
DECLARE
    v_book_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_book_id := OLD.book_id;
    ELSE
        v_book_id := NEW.book_id;
    END IF;

    UPDATE books.book_rating_stats
    SET
        total_reviews = (
            SELECT COUNT(*) FROM books.book_reviews
            WHERE book_id = v_book_id
            AND is_approved = TRUE
            AND deleted_at IS NULL
        ),
        updated_at = NOW()
    WHERE book_id = v_book_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_book_review_count ON books.book_reviews;
CREATE TRIGGER trg_update_book_review_count
    AFTER INSERT OR UPDATE OR DELETE ON books.book_reviews
    FOR EACH ROW
    EXECUTE FUNCTION books.update_book_review_count();

-- Trigger para helpful_count
CREATE OR REPLACE FUNCTION books.update_review_helpful_count()
RETURNS TRIGGER AS $$
DECLARE
    v_review_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_review_id := OLD.review_id;
    ELSE
        v_review_id := NEW.review_id;
    END IF;

    UPDATE books.book_reviews
    SET helpful_count = (
        SELECT COUNT(*) FROM books.book_review_votes
        WHERE review_id = v_review_id AND is_helpful = TRUE
    )
    WHERE id = v_review_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_review_helpful_count ON books.book_review_votes;
CREATE TRIGGER trg_update_review_helpful_count
    AFTER INSERT OR UPDATE OR DELETE ON books.book_review_votes
    FOR EACH ROW
    EXECUTE FUNCTION books.update_review_helpful_count();

-- Trigger para updated_at en reviews
CREATE OR REPLACE FUNCTION books.update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_book_ratings_updated_at ON books.book_ratings;
CREATE TRIGGER trg_book_ratings_updated_at
    BEFORE UPDATE ON books.book_ratings
    FOR EACH ROW
    EXECUTE FUNCTION books.update_reviews_updated_at();

DROP TRIGGER IF EXISTS trg_book_reviews_updated_at ON books.book_reviews;
CREATE TRIGGER trg_book_reviews_updated_at
    BEFORE UPDATE ON books.book_reviews
    FOR EACH ROW
    EXECUTE FUNCTION books.update_reviews_updated_at();

-- Funciones helper para reviews
CREATE OR REPLACE FUNCTION books.get_book_rating_stats(p_book_id UUID)
RETURNS TABLE (
    total_ratings INTEGER,
    average_rating DECIMAL,
    rating_1_count INTEGER,
    rating_2_count INTEGER,
    rating_3_count INTEGER,
    rating_4_count INTEGER,
    rating_5_count INTEGER,
    total_reviews INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        brs.total_ratings,
        brs.average_rating,
        brs.rating_1_count,
        brs.rating_2_count,
        brs.rating_3_count,
        brs.rating_4_count,
        brs.rating_5_count,
        brs.total_reviews
    FROM books.book_rating_stats brs
    WHERE brs.book_id = p_book_id;

    IF NOT FOUND THEN
        RETURN QUERY SELECT 0, 0::DECIMAL, 0, 0, 0, 0, 0, 0;
    END IF;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION books.get_book_reviews(
    p_book_id UUID,
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0,
    p_only_approved BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    review_id UUID,
    user_id UUID,
    user_name VARCHAR,
    user_avatar TEXT,
    rating SMALLINT,
    title VARCHAR,
    content TEXT,
    helpful_count INTEGER,
    is_featured BOOLEAN,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        br.id AS review_id,
        br.user_id,
        COALESCE(up.display_name, up.first_name || ' ' || up.last_name)::VARCHAR AS user_name,
        up.avatar_url AS user_avatar,
        brat.rating,
        br.title,
        br.content,
        br.helpful_count,
        br.is_featured,
        br.created_at
    FROM books.book_reviews br
    LEFT JOIN app.user_profiles up ON up.user_id = br.user_id
    LEFT JOIN books.book_ratings brat ON brat.book_id = br.book_id AND brat.user_id = br.user_id
    WHERE br.book_id = p_book_id
    AND br.deleted_at IS NULL
    AND br.is_hidden = FALSE
    AND (NOT p_only_approved OR br.is_approved = TRUE)
    ORDER BY br.is_featured DESC, br.helpful_count DESC, br.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- ======================================================
-- PARTE 11: SISTEMA GEOGRÁFICO
-- ======================================================

-- countries
CREATE TABLE IF NOT EXISTS books.countries (
    code CHAR(2) PRIMARY KEY,
    code_alpha3 CHAR(3),
    region VARCHAR(50),
    subregion VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    display_order SMALLINT DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_countries_region ON books.countries(region);
CREATE INDEX IF NOT EXISTS idx_countries_active ON books.countries(is_active) WHERE is_active = TRUE;

-- country_translations
CREATE TABLE IF NOT EXISTS books.country_translations (
    country_code CHAR(2) NOT NULL REFERENCES books.countries(code) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL REFERENCES app.languages(code) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (country_code, language_code)
);

CREATE INDEX IF NOT EXISTS idx_country_translations_language ON books.country_translations(language_code);

-- book_countries
CREATE TABLE IF NOT EXISTS books.book_countries (
    book_id UUID NOT NULL REFERENCES books.books(id) ON DELETE CASCADE,
    country_code CHAR(2) NOT NULL REFERENCES books.countries(code) ON DELETE CASCADE,
    is_origin BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (book_id, country_code)
);

CREATE INDEX IF NOT EXISTS idx_book_countries_book ON books.book_countries(book_id);
CREATE INDEX IF NOT EXISTS idx_book_countries_country ON books.book_countries(country_code);
CREATE INDEX IF NOT EXISTS idx_book_countries_origin ON books.book_countries(is_origin) WHERE is_origin = TRUE;

-- Función para países traducidos
CREATE OR REPLACE FUNCTION books.get_countries_translated(p_language_code VARCHAR DEFAULT 'es')
RETURNS TABLE (
    code CHAR(2),
    name VARCHAR,
    region VARCHAR,
    subregion VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.code,
        COALESCE(ct.name, c.code)::VARCHAR AS name,
        c.region,
        c.subregion
    FROM books.countries c
    LEFT JOIN books.country_translations ct
        ON ct.country_code = c.code
        AND ct.language_code = p_language_code
    WHERE c.is_active = TRUE
    ORDER BY c.display_order, ct.name;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION books.get_countries_by_region(
    p_region VARCHAR,
    p_language_code VARCHAR DEFAULT 'es'
)
RETURNS TABLE (
    code CHAR(2),
    name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.code,
        COALESCE(ct.name, c.code)::VARCHAR AS name
    FROM books.countries c
    LEFT JOIN books.country_translations ct
        ON ct.country_code = c.code
        AND ct.language_code = p_language_code
    WHERE c.is_active = TRUE
    AND c.region = p_region
    ORDER BY c.display_order, ct.name;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION books.get_book_origin_country(
    p_book_id UUID,
    p_language_code VARCHAR DEFAULT 'es'
)
RETURNS TABLE (
    code CHAR(2),
    name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.code,
        COALESCE(ct.name, c.code)::VARCHAR AS name
    FROM books.book_countries bc
    JOIN books.countries c ON c.code = bc.country_code
    LEFT JOIN books.country_translations ct
        ON ct.country_code = c.code
        AND ct.language_code = p_language_code
    WHERE bc.book_id = p_book_id
    AND bc.is_origin = TRUE
    LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- ======================================================
-- PARTE 12: ANALYTICS
-- ======================================================

-- book_reading_sessions
CREATE TABLE IF NOT EXISTS books.book_reading_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL,
    user_id UUID NULL,
    session_id VARCHAR(100) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ NULL,
    duration_seconds INTEGER NULL,
    total_pages SMALLINT NOT NULL,
    pages_read INTEGER NOT NULL DEFAULT 0,
    unique_pages INTEGER NOT NULL DEFAULT 0,
    completion_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
    device_type VARCHAR(50) NULL,
    browser VARCHAR(100) NULL,
    os VARCHAR(100) NULL,
    ip_address INET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_reading_sessions_book
        FOREIGN KEY (book_id)
        REFERENCES books.books(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reading_sessions_user
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_reading_sessions_duration_positive
        CHECK (duration_seconds IS NULL OR duration_seconds >= 0),

    CONSTRAINT chk_reading_sessions_completion
        CHECK (completion_percentage BETWEEN 0 AND 100)
);

CREATE INDEX IF NOT EXISTS idx_reading_sessions_book ON books.book_reading_sessions(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user ON books.book_reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_started_at ON books.book_reading_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_book_user ON books.book_reading_sessions(book_id, user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_session_id ON books.book_reading_sessions(session_id);

-- book_page_views (analytics)
CREATE TABLE IF NOT EXISTS books.book_page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    page_number SMALLINT NOT NULL,
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration_seconds INTEGER NULL,
    interactions_count INTEGER NOT NULL DEFAULT 0,
    zoomed BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_page_views_book
        FOREIGN KEY (book_id)
        REFERENCES books.books(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_page_views_duration_positive
        CHECK (duration_seconds IS NULL OR duration_seconds >= 0),

    CONSTRAINT chk_page_views_page_positive
        CHECK (page_number > 0)
);

CREATE INDEX IF NOT EXISTS idx_page_views_book ON books.book_page_views(book_id);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON books.book_page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_book_page ON books.book_page_views(book_id, page_number);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON books.book_page_views(viewed_at DESC);

-- user_book_progress
CREATE TABLE IF NOT EXISTS books.user_book_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    book_id UUID NOT NULL,
    current_page SMALLINT NOT NULL DEFAULT 1,
    total_pages SMALLINT NOT NULL,
    completion_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    total_reading_time INTEGER NOT NULL DEFAULT 0,
    last_read_at TIMESTAMPTZ NULL,
    completed_at TIMESTAMPTZ NULL,
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    bookmarks JSONB NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_user_progress_user
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_progress_book
        FOREIGN KEY (book_id)
        REFERENCES books.books(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_user_progress_user_book
        UNIQUE (user_id, book_id),

    CONSTRAINT chk_user_progress_pages
        CHECK (current_page > 0 AND total_pages > 0),

    CONSTRAINT chk_user_progress_completion
        CHECK (completion_percentage BETWEEN 0 AND 100)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user ON books.user_book_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_book ON books.user_book_progress(book_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_book ON books.user_book_progress(user_id, book_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_updated_at ON books.user_book_progress(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_favorites ON books.user_book_progress(user_id) WHERE is_favorite = TRUE;

-- book_statistics (tabla agregada)
CREATE TABLE IF NOT EXISTS books.book_statistics (
    book_id UUID PRIMARY KEY,
    total_readers INTEGER NOT NULL DEFAULT 0,
    active_readers INTEGER NOT NULL DEFAULT 0,
    completed_readers INTEGER NOT NULL DEFAULT 0,
    total_sessions INTEGER NOT NULL DEFAULT 0,
    total_reading_time INTEGER NOT NULL DEFAULT 0,
    avg_session_duration INTEGER NOT NULL DEFAULT 0,
    total_page_views INTEGER NOT NULL DEFAULT 0,
    avg_pages_per_session NUMERIC(5,2) NOT NULL DEFAULT 0,
    most_viewed_page SMALLINT NULL,
    avg_completion_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
    bounce_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
    first_read_at TIMESTAMPTZ NULL,
    last_read_at TIMESTAMPTZ NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_book_stats_book
        FOREIGN KEY (book_id)
        REFERENCES books.books(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_book_stats_total_readers ON books.book_statistics(total_readers DESC);
CREATE INDEX IF NOT EXISTS idx_book_stats_avg_completion ON books.book_statistics(avg_completion_rate DESC);
CREATE INDEX IF NOT EXISTS idx_book_stats_updated_at ON books.book_statistics(updated_at DESC);

-- Trigger para user_book_progress updated_at
DROP TRIGGER IF EXISTS trigger_user_progress_updated_at ON books.user_book_progress;
CREATE TRIGGER trigger_user_progress_updated_at
BEFORE UPDATE ON books.user_book_progress
FOR EACH ROW
EXECUTE FUNCTION books.update_updated_at_column();

-- Función para refrescar estadísticas
CREATE OR REPLACE FUNCTION books.refresh_book_statistics(target_book_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO books.book_statistics (
        book_id,
        total_readers,
        active_readers,
        completed_readers,
        total_sessions,
        total_reading_time,
        avg_session_duration,
        total_page_views,
        avg_pages_per_session,
        avg_completion_rate,
        first_read_at,
        last_read_at
    )
    SELECT
        target_book_id,
        COUNT(DISTINCT rs.user_id) FILTER (WHERE rs.user_id IS NOT NULL),
        COUNT(DISTINCT up.user_id) FILTER (WHERE up.is_completed = FALSE),
        COUNT(DISTINCT up.user_id) FILTER (WHERE up.is_completed = TRUE),
        COUNT(rs.id),
        COALESCE(SUM(rs.duration_seconds), 0),
        COALESCE(AVG(rs.duration_seconds), 0)::INTEGER,
        COUNT(pv.id),
        COALESCE(AVG(rs.pages_read), 0),
        COALESCE(AVG(rs.completion_percentage), 0),
        MIN(rs.started_at),
        MAX(rs.started_at)
    FROM books.book_reading_sessions rs
    LEFT JOIN books.user_book_progress up ON rs.book_id = up.book_id
    LEFT JOIN books.book_page_views pv ON rs.book_id = pv.book_id
    WHERE rs.book_id = target_book_id

    ON CONFLICT (book_id)
    DO UPDATE SET
        total_readers = EXCLUDED.total_readers,
        active_readers = EXCLUDED.active_readers,
        completed_readers = EXCLUDED.completed_readers,
        total_sessions = EXCLUDED.total_sessions,
        total_reading_time = EXCLUDED.total_reading_time,
        avg_session_duration = EXCLUDED.avg_session_duration,
        total_page_views = EXCLUDED.total_page_views,
        avg_pages_per_session = EXCLUDED.avg_pages_per_session,
        avg_completion_rate = EXCLUDED.avg_completion_rate,
        first_read_at = EXCLUDED.first_read_at,
        last_read_at = EXCLUDED.last_read_at,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ======================================================
-- PARTE 13: FUNCIONES DE LIBROS
-- ======================================================

-- Incrementar vistas
CREATE OR REPLACE FUNCTION books.increment_book_views(book_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE books.books
    SET view_count = view_count + 1
    WHERE id = book_uuid
    AND is_published = TRUE
    AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Soft delete
CREATE OR REPLACE FUNCTION books.soft_delete_book(book_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE books.books
    SET deleted_at = NOW(),
        deleted_by = auth.uid()
    WHERE id = book_uuid
    AND user_id = auth.uid()
    AND deleted_at IS NULL;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Validación de publicación
CREATE OR REPLACE FUNCTION books.validate_book_for_publishing()
RETURNS TRIGGER AS $$
DECLARE
    page_count INTEGER;
    has_cover BOOLEAN;
BEGIN
    IF NEW.is_published = TRUE AND (OLD.is_published = FALSE OR OLD.is_published IS NULL) THEN
        SELECT COUNT(*) INTO page_count FROM books.book_pages WHERE book_id = NEW.id;

        IF page_count = 0 THEN
            RAISE EXCEPTION 'No se puede publicar un libro sin páginas';
        END IF;

        has_cover := NEW.cover_url IS NOT NULL AND LENGTH(NEW.cover_url) > 0;

        IF NOT has_cover THEN
            RAISE EXCEPTION 'No se puede publicar un libro sin portada';
        END IF;

        IF NEW.title IS NULL OR LENGTH(TRIM(NEW.title)) = 0 THEN
            RAISE EXCEPTION 'No se puede publicar un libro sin título';
        END IF;

        NEW.published_at := NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Búsqueda de libros
CREATE OR REPLACE FUNCTION books.search_books(
    search_query TEXT,
    filter_level_id SMALLINT DEFAULT NULL,
    filter_category_id INTEGER DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    description TEXT,
    cover_url TEXT,
    level_name VARCHAR(100),
    authors TEXT[],
    categories TEXT[],
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        b.id,
        b.title,
        b.description,
        b.cover_url,
        l.name as level_name,
        COALESCE(
            array_agg(DISTINCT a.name) FILTER (WHERE a.id IS NOT NULL),
            ARRAY[]::VARCHAR[]
        ) as authors,
        COALESCE(
            array_agg(DISTINCT c.name) FILTER (WHERE c.id IS NOT NULL),
            ARRAY[]::VARCHAR[]
        ) as categories,
        ts_rank(
            to_tsvector('spanish', b.title || ' ' || COALESCE(b.description, '')),
            plainto_tsquery('spanish', search_query)
        ) as relevance
    FROM books.books b
    LEFT JOIN books.book_levels l ON b.level_id = l.id
    LEFT JOIN books.books_authors ba ON b.id = ba.book_id
    LEFT JOIN books.book_authors a ON ba.author_id = a.id
    LEFT JOIN books.books_categories bc ON b.id = bc.book_id
    LEFT JOIN books.book_categories c ON bc.category_id = c.id
    WHERE
        b.is_published = TRUE
        AND b.deleted_at IS NULL
        AND to_tsvector('spanish', b.title || ' ' || COALESCE(b.description, ''))
            @@ plainto_tsquery('spanish', search_query)
        AND (filter_level_id IS NULL OR b.level_id = filter_level_id)
        AND (filter_category_id IS NULL OR EXISTS (
            SELECT 1 FROM books.books_categories
            WHERE book_id = b.id AND category_id = filter_category_id
        ))
    GROUP BY b.id, l.name
    ORDER BY relevance DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Función de auditoría
CREATE OR REPLACE FUNCTION books.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO books.book_audit_logs (table_name, record_id, action, old_data, user_id)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD), auth.uid());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO books.book_audit_logs (table_name, record_id, action, old_data, new_data, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO books.book_audit_logs (table_name, record_id, action, new_data, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW), auth.uid());
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Limpieza de auditoría
CREATE OR REPLACE FUNCTION books.cleanup_old_audit_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM books.book_audit_logs
    WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Duplicar libro
CREATE OR REPLACE FUNCTION books.duplicate_book(
    source_book_id UUID,
    new_title VARCHAR(255) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_book_id UUID;
    source_book RECORD;
    page_record RECORD;
BEGIN
    SELECT * INTO source_book
    FROM books.books
    WHERE id = source_book_id
    AND user_id = auth.uid()
    AND deleted_at IS NULL;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Libro no encontrado o sin permisos';
    END IF;

    INSERT INTO books.books (
        user_id, type_id, level_id, title, description,
        cover_url, is_published
    )
    VALUES (
        auth.uid(),
        source_book.type_id,
        source_book.level_id,
        COALESCE(new_title, source_book.title || ' (Copia)'),
        source_book.description,
        source_book.cover_url,
        FALSE
    )
    RETURNING id INTO new_book_id;

    FOR page_record IN
        SELECT * FROM books.book_pages WHERE book_id = source_book_id ORDER BY page_number
    LOOP
        INSERT INTO books.book_pages (
            book_id, page_number, layout, animation, title, content,
            image_url, audio_url, interactive_game, items,
            background_url, background_color, text_color, font, border_style
        )
        VALUES (
            new_book_id,
            page_record.page_number,
            page_record.layout,
            page_record.animation,
            page_record.title,
            page_record.content,
            page_record.image_url,
            page_record.audio_url,
            page_record.interactive_game,
            page_record.items,
            page_record.background_url,
            page_record.background_color,
            page_record.text_color,
            page_record.font,
            page_record.border_style
        );
    END LOOP;

    INSERT INTO books.books_categories (book_id, category_id, is_primary)
    SELECT new_book_id, category_id, is_primary
    FROM books.books_categories
    WHERE book_id = source_book_id;

    INSERT INTO books.books_values (book_id, value_id, is_primary)
    SELECT new_book_id, value_id, is_primary
    FROM books.books_values
    WHERE book_id = source_book_id;

    INSERT INTO books.books_genres (book_id, genre_id)
    SELECT new_book_id, genre_id
    FROM books.books_genres
    WHERE book_id = source_book_id;

    INSERT INTO books.books_tags (book_id, tag_id, is_primary)
    SELECT new_book_id, tag_id, is_primary
    FROM books.books_tags
    WHERE book_id = source_book_id;

    INSERT INTO books.books_authors (book_id, author_id, author_order)
    SELECT new_book_id, author_id, author_order
    FROM books.books_authors
    WHERE book_id = source_book_id;

    INSERT INTO books.books_characters (book_id, character_id, is_main)
    SELECT new_book_id, character_id, is_main
    FROM books.books_characters
    WHERE book_id = source_book_id;

    INSERT INTO books.books_languages (book_id, language_id, is_original)
    SELECT new_book_id, language_id, is_original
    FROM books.books_languages
    WHERE book_id = source_book_id;

    RETURN new_book_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ======================================================
-- PARTE 14: TRIGGERS PRINCIPALES
-- ======================================================

-- Trigger updated_at para books
DROP TRIGGER IF EXISTS trigger_books_updated_at ON books.books;
CREATE TRIGGER trigger_books_updated_at
    BEFORE UPDATE ON books.books
    FOR EACH ROW
    EXECUTE FUNCTION books.update_updated_at_column();

-- Trigger auditoría para books
DROP TRIGGER IF EXISTS trigger_audit_books ON books.books;
CREATE TRIGGER trigger_audit_books
    AFTER INSERT OR UPDATE OR DELETE ON books.books
    FOR EACH ROW
    EXECUTE FUNCTION books.audit_trigger_function();

-- Trigger validación de publicación
DROP TRIGGER IF EXISTS trigger_validate_book_publishing ON books.books;
CREATE TRIGGER trigger_validate_book_publishing
    BEFORE UPDATE ON books.books
    FOR EACH ROW
    EXECUTE FUNCTION books.validate_book_for_publishing();

-- ======================================================
-- PARTE 15: VISTAS
-- ======================================================

-- Vista de información completa de libros
CREATE OR REPLACE VIEW books.books_full_info AS
SELECT
    b.id,
    b.user_id,
    b.title,
    b.description,
    b.cover_url,
    b.is_published,
    b.is_featured,
    b.view_count,
    b.created_at,
    b.published_at,
    bt.name as type_name,
    l.name as level_name,
    l.min_age,
    l.max_age,
    COALESCE(
        array_agg(DISTINCT a.name ORDER BY a.name) FILTER (WHERE a.id IS NOT NULL),
        ARRAY[]::VARCHAR[]
    ) as authors,
    COALESCE(
        array_agg(DISTINCT c.name ORDER BY c.name) FILTER (WHERE c.id IS NOT NULL),
        ARRAY[]::VARCHAR[]
    ) as categories,
    COALESCE(
        array_agg(DISTINCT v.name ORDER BY v.name) FILTER (WHERE v.id IS NOT NULL),
        ARRAY[]::VARCHAR[]
    ) as values,
    COALESCE(
        array_agg(DISTINCT g.name ORDER BY g.name) FILTER (WHERE g.id IS NOT NULL),
        ARRAY[]::VARCHAR[]
    ) as genres,
    COALESCE(
        array_agg(DISTINCT t.name ORDER BY t.name) FILTER (WHERE t.id IS NOT NULL),
        ARRAY[]::VARCHAR[]
    ) as tags,
    (SELECT COUNT(*) FROM books.book_pages WHERE book_id = b.id) as page_count
FROM books.books b
LEFT JOIN books.book_types bt ON b.type_id = bt.id
LEFT JOIN books.book_levels l ON b.level_id = l.id
LEFT JOIN books.books_authors ba ON b.id = ba.book_id
LEFT JOIN books.book_authors a ON ba.author_id = a.id
LEFT JOIN books.books_categories bc ON b.id = bc.book_id
LEFT JOIN books.book_categories c ON bc.category_id = c.id
LEFT JOIN books.books_values bv ON b.id = bv.book_id
LEFT JOIN books.book_values v ON bv.value_id = v.id
LEFT JOIN books.books_genres bg ON b.id = bg.book_id
LEFT JOIN books.book_genres g ON bg.genre_id = g.id
LEFT JOIN books.books_tags btg ON b.id = btg.book_id
LEFT JOIN books.book_tags t ON btg.tag_id = t.id
WHERE b.deleted_at IS NULL
GROUP BY b.id, bt.name, l.name, l.min_age, l.max_age;

-- Vista de estadísticas por libro
CREATE OR REPLACE VIEW books.v_book_statistics AS
SELECT
    b.id as book_id,
    b.title,
    COUNT(DISTINCT bv.user_id) as unique_viewers,
    COUNT(bv.id) as total_views,
    AVG(bv.view_duration) as avg_view_duration,
    MAX(bv.created_at) as last_viewed_at
FROM books.books b
LEFT JOIN books.book_views bv ON b.id = bv.book_id
WHERE b.deleted_at IS NULL
GROUP BY b.id, b.title;

-- ======================================================
-- PARTE 16: ROW LEVEL SECURITY
-- ======================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE books.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.books_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.books_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.books_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.books_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.books_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.books_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.books_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_page_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_category_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_genre_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_value_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_level_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_tag_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_rating_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.country_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.user_book_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_statistics ENABLE ROW LEVEL SECURITY;

-- ======================================================
-- Políticas para SERVICE_ROLE (acceso total)
-- ======================================================

CREATE POLICY "Service role: acceso total a books"
    ON books.books FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_pages"
    ON books.book_pages FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a books_authors"
    ON books.books_authors FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a books_characters"
    ON books.books_characters FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a books_categories"
    ON books.books_categories FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a books_values"
    ON books.books_values FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a books_genres"
    ON books.books_genres FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a books_languages"
    ON books.books_languages FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a books_tags"
    ON books.books_tags FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_audit_logs"
    ON books.book_audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_views"
    ON books.book_views FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_translations"
    ON books.book_translations FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_page_translations"
    ON books.book_page_translations FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_category_translations"
    ON books.book_category_translations FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_genre_translations"
    ON books.book_genre_translations FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_value_translations"
    ON books.book_value_translations FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_level_translations"
    ON books.book_level_translations FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_tag_translations"
    ON books.book_tag_translations FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_collaborators"
    ON books.book_collaborators FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_ratings"
    ON books.book_ratings FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_reviews"
    ON books.book_reviews FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_review_votes"
    ON books.book_review_votes FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_rating_stats"
    ON books.book_rating_stats FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a countries"
    ON books.countries FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a country_translations"
    ON books.country_translations FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_countries"
    ON books.book_countries FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_reading_sessions"
    ON books.book_reading_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_page_views"
    ON books.book_page_views FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a user_book_progress"
    ON books.user_book_progress FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_statistics"
    ON books.book_statistics FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ======================================================
-- Políticas de LECTURA PÚBLICA (libros publicados)
-- ======================================================

CREATE POLICY "Público: leer libros publicados"
    ON books.books FOR SELECT TO anon, authenticated
    USING (is_published = TRUE AND deleted_at IS NULL);

CREATE POLICY "Público: leer book_pages de libros publicados"
    ON books.book_pages FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books.books
            WHERE books.id = book_pages.book_id
            AND books.is_published = TRUE
            AND books.deleted_at IS NULL
        )
    );

CREATE POLICY "Público: leer books_authors de libros publicados"
    ON books.books_authors FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books.books
            WHERE books.id = books_authors.book_id
            AND books.is_published = TRUE
            AND books.deleted_at IS NULL
        )
    );

CREATE POLICY "Público: leer books_characters de libros publicados"
    ON books.books_characters FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books.books
            WHERE books.id = books_characters.book_id
            AND books.is_published = TRUE
            AND books.deleted_at IS NULL
        )
    );

CREATE POLICY "Público: leer books_categories de libros publicados"
    ON books.books_categories FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books.books
            WHERE books.id = books_categories.book_id
            AND books.is_published = TRUE
            AND books.deleted_at IS NULL
        )
    );

CREATE POLICY "Público: leer books_values de libros publicados"
    ON books.books_values FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books.books
            WHERE books.id = books_values.book_id
            AND books.is_published = TRUE
            AND books.deleted_at IS NULL
        )
    );

CREATE POLICY "Público: leer books_genres de libros publicados"
    ON books.books_genres FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books.books
            WHERE books.id = books_genres.book_id
            AND books.is_published = TRUE
            AND books.deleted_at IS NULL
        )
    );

CREATE POLICY "Público: leer books_languages de libros publicados"
    ON books.books_languages FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books.books
            WHERE books.id = books_languages.book_id
            AND books.is_published = TRUE
            AND books.deleted_at IS NULL
        )
    );

CREATE POLICY "Público: leer books_tags de libros publicados"
    ON books.books_tags FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books.books
            WHERE books.id = books_tags.book_id
            AND books.is_published = TRUE
            AND books.deleted_at IS NULL
        )
    );

-- ======================================================
-- Políticas para USUARIOS AUTENTICADOS (sus propios libros)
-- ======================================================

CREATE POLICY "Usuarios: leer libros propios"
    ON books.books FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Usuarios: crear libros propios"
    ON books.books FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuarios: actualizar libros propios"
    ON books.books FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuarios: eliminar libros propios"
    ON books.books FOR DELETE TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Usuarios: leer book_pages de libros propios"
    ON books.book_pages FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books.books
            WHERE books.id = book_pages.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios: crear book_pages en libros propios"
    ON books.book_pages FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM books.books
            WHERE books.id = book_pages.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios: actualizar book_pages de libros propios"
    ON books.book_pages FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books.books
            WHERE books.id = book_pages.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios: eliminar book_pages de libros propios"
    ON books.book_pages FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books.books
            WHERE books.id = book_pages.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios: gestionar books_authors de libros propios"
    ON books.books_authors FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books.books
            WHERE books.id = books_authors.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios: gestionar books_characters de libros propios"
    ON books.books_characters FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books.books
            WHERE books.id = books_characters.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios: gestionar books_categories de libros propios"
    ON books.books_categories FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books.books
            WHERE books.id = books_categories.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios: gestionar books_values de libros propios"
    ON books.books_values FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books.books
            WHERE books.id = books_values.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios: gestionar books_genres de libros propios"
    ON books.books_genres FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books.books
            WHERE books.id = books_genres.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios: gestionar books_languages de libros propios"
    ON books.books_languages FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books.books
            WHERE books.id = books_languages.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios: gestionar books_tags de libros propios"
    ON books.books_tags FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books.books
            WHERE books.id = books_tags.book_id
            AND books.user_id = auth.uid()
        )
    );

-- ======================================================
-- Políticas de LECTURA PÚBLICA para catálogos
-- ======================================================

CREATE POLICY "Público: leer tipos de libros"
    ON books.book_types FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Público: leer niveles de lectura"
    ON books.book_levels FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Público: leer categorías"
    ON books.book_categories FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Público: leer valores"
    ON books.book_values FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Público: leer géneros"
    ON books.book_genres FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Público: leer idiomas activos"
    ON books.book_languages FOR SELECT TO anon, authenticated
    USING (is_active = TRUE);

CREATE POLICY "Público: leer etiquetas"
    ON books.book_tags FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Público: leer autores"
    ON books.book_authors FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Público: leer personajes"
    ON books.book_characters FOR SELECT TO anon, authenticated
    USING (true);

-- Políticas para traducciones (lectura pública)
CREATE POLICY "Público: leer traducciones de categorías"
    ON books.book_category_translations FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Público: leer traducciones de géneros"
    ON books.book_genre_translations FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Público: leer traducciones de valores"
    ON books.book_value_translations FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Público: leer traducciones de niveles"
    ON books.book_level_translations FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Público: leer traducciones de etiquetas"
    ON books.book_tag_translations FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Público: leer traducciones de libros publicados"
    ON books.book_translations FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books.books
            WHERE books.id = book_translations.book_id
            AND books.is_published = TRUE
            AND books.deleted_at IS NULL
        )
        AND is_active = TRUE
    );

CREATE POLICY "Público: leer traducciones de páginas de libros publicados"
    ON books.book_page_translations FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books.book_pages bp
            JOIN books.books b ON b.id = bp.book_id
            WHERE bp.id = book_page_translations.book_page_id
            AND b.is_published = TRUE
            AND b.deleted_at IS NULL
        )
    );

-- Políticas para países
CREATE POLICY "Público: leer países"
    ON books.countries FOR SELECT TO anon, authenticated
    USING (is_active = TRUE);

CREATE POLICY "Público: leer traducciones de países"
    ON books.country_translations FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Público: leer book_countries de libros publicados"
    ON books.book_countries FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books.books
            WHERE books.id = book_countries.book_id
            AND books.is_published = TRUE
            AND books.deleted_at IS NULL
        )
    );

-- Políticas para ratings y reviews
CREATE POLICY "Público: leer estadísticas de ratings"
    ON books.book_rating_stats FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Público: leer reviews aprobadas"
    ON books.book_reviews FOR SELECT TO anon, authenticated
    USING (is_approved = TRUE AND is_hidden = FALSE AND deleted_at IS NULL);

CREATE POLICY "Usuarios: gestionar sus propios ratings"
    ON books.book_ratings FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuarios: gestionar sus propias reviews"
    ON books.book_reviews FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuarios: gestionar sus votos de reviews"
    ON books.book_review_votes FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Políticas para colaboradores
CREATE POLICY "Público: leer colaboradores de libros publicados"
    ON books.book_collaborators FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books.books
            WHERE books.id = book_collaborators.book_id
            AND books.is_published = TRUE
            AND books.deleted_at IS NULL
        )
    );

CREATE POLICY "Usuarios: gestionar colaboradores de libros propios"
    ON books.book_collaborators FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books.books
            WHERE books.id = book_collaborators.book_id
            AND books.user_id = auth.uid()
        )
    );

-- Políticas para analytics
CREATE POLICY "Usuarios: insertar sus propias sesiones"
    ON books.book_reading_sessions FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Usuarios: ver sus propias sesiones"
    ON books.book_reading_sessions FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Usuarios: insertar vistas de páginas"
    ON books.book_page_views FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Usuarios: ver vistas de páginas"
    ON books.book_page_views FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Usuarios: gestionar su propio progreso"
    ON books.user_book_progress FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Público: ver estadísticas de libros"
    ON books.book_statistics FOR SELECT TO authenticated, anon
    USING (true);

-- Políticas de auditoría
CREATE POLICY "Usuarios: ver sus propios registros de auditoría"
    ON books.book_audit_logs FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Cualquiera: insertar vistas de libros"
    ON books.book_views FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- ======================================================
-- PARTE 17: PERMISOS DE TABLAS (Analytics)
-- ======================================================

GRANT SELECT, INSERT, UPDATE ON books.book_reading_sessions TO authenticated;
GRANT SELECT, INSERT ON books.book_page_views TO authenticated;
GRANT SELECT, INSERT, UPDATE ON books.user_book_progress TO authenticated;
GRANT SELECT ON books.book_statistics TO authenticated, anon;

-- ======================================================
-- PARTE 18: VISTAS PÚBLICAS (Exponer al API REST)
-- ======================================================

-- Vistas para catálogos
CREATE OR REPLACE VIEW public.book_types AS SELECT * FROM books.book_types;
CREATE OR REPLACE VIEW public.book_levels AS SELECT * FROM books.book_levels;
CREATE OR REPLACE VIEW public.book_categories AS SELECT * FROM books.book_categories;
CREATE OR REPLACE VIEW public.book_values AS SELECT * FROM books.book_values;
CREATE OR REPLACE VIEW public.book_genres AS SELECT * FROM books.book_genres;
CREATE OR REPLACE VIEW public.book_languages AS SELECT * FROM books.book_languages;
CREATE OR REPLACE VIEW public.book_tags AS SELECT * FROM books.book_tags;

-- Vistas para tablas principales
CREATE OR REPLACE VIEW public.book_authors AS SELECT * FROM books.book_authors;
CREATE OR REPLACE VIEW public.book_characters AS SELECT * FROM books.book_characters;
CREATE OR REPLACE VIEW public.books AS SELECT * FROM books.books;
CREATE OR REPLACE VIEW public.book_pages AS SELECT * FROM books.book_pages;

-- Vistas para relaciones
CREATE OR REPLACE VIEW public.books_authors AS SELECT * FROM books.books_authors;
CREATE OR REPLACE VIEW public.books_characters AS SELECT * FROM books.books_characters;
CREATE OR REPLACE VIEW public.books_categories AS SELECT * FROM books.books_categories;
CREATE OR REPLACE VIEW public.books_values AS SELECT * FROM books.books_values;
CREATE OR REPLACE VIEW public.books_genres AS SELECT * FROM books.books_genres;
CREATE OR REPLACE VIEW public.books_languages AS SELECT * FROM books.books_languages;
CREATE OR REPLACE VIEW public.books_tags AS SELECT * FROM books.books_tags;

-- Vistas para auditoría/analytics
CREATE OR REPLACE VIEW public.book_audit_logs AS SELECT * FROM books.book_audit_logs;
CREATE OR REPLACE VIEW public.book_views AS SELECT * FROM books.book_views;

-- Permisos para vistas públicas
GRANT SELECT ON public.book_types TO anon, authenticated;
GRANT SELECT ON public.book_levels TO anon, authenticated;
GRANT SELECT ON public.book_categories TO anon, authenticated;
GRANT SELECT ON public.book_values TO anon, authenticated;
GRANT SELECT ON public.book_genres TO anon, authenticated;
GRANT SELECT ON public.book_languages TO anon, authenticated;
GRANT SELECT ON public.book_tags TO anon, authenticated;
GRANT SELECT ON public.book_authors TO anon, authenticated;
GRANT SELECT ON public.book_characters TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.books TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.book_pages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.books_authors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.books_characters TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.books_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.books_values TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.books_genres TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.books_languages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.books_tags TO authenticated;

GRANT SELECT, INSERT ON public.book_views TO anon, authenticated;
GRANT INSERT ON public.book_authors TO authenticated;
GRANT INSERT ON public.book_characters TO authenticated;

-- ======================================================
-- PARTE 19: CONFIGURACIÓN DE STORAGE
-- ======================================================

-- Crear bucket 'book-images'
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('book-images', 'book-images', true)
    ON CONFLICT (id) DO NOTHING;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Configurar límites para imágenes
UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
WHERE id = 'book-images';

-- Crear bucket 'book-pdfs'
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('book-pdfs', 'book-pdfs', true)
    ON CONFLICT (id) DO NOTHING;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Configurar límites para PDFs
UPDATE storage.buckets
SET file_size_limit = 52428800,
    allowed_mime_types = ARRAY['application/pdf']
WHERE id = 'book-pdfs';

-- Limpiar políticas antiguas de storage
DROP POLICY IF EXISTS "Usuarios: subir imágenes propias" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios: actualizar imágenes propias" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios: eliminar imágenes propias" ON storage.objects;
DROP POLICY IF EXISTS "Público: leer todas las imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios: subir PDFs propios" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios: actualizar PDFs propios" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios: eliminar PDFs propios" ON storage.objects;
DROP POLICY IF EXISTS "Público: leer todos los PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Acceso total: service role" ON storage.objects;

-- Políticas para imágenes
CREATE POLICY "Usuarios: subir imágenes propias" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'book-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Usuarios: actualizar imágenes propias" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'book-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Usuarios: eliminar imágenes propias" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'book-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Público: leer todas las imágenes" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'book-images');

-- Políticas para PDFs
CREATE POLICY "Usuarios: subir PDFs propios" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'book-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Usuarios: actualizar PDFs propios" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'book-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Usuarios: eliminar PDFs propios" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'book-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Público: leer todos los PDFs" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'book-pdfs');

-- Política global para service role
CREATE POLICY "Acceso total: service role" ON storage.objects
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ======================================================
-- VERIFICACIÓN FINAL
-- ======================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SETUP BOOKS COMPLETO EJECUTADO';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Schema: books';
    RAISE NOTICE 'ENUMs: collaborator_role, access_type';
    RAISE NOTICE 'Tablas principales: books, book_pages, book_authors, book_characters';
    RAISE NOTICE 'Tablas de catálogo: book_types, book_levels, book_categories, book_values, book_genres, book_languages, book_tags';
    RAISE NOTICE 'Tablas de relación: books_authors, books_characters, books_categories, books_values, books_genres, books_languages, books_tags';
    RAISE NOTICE 'Traducciones: book_translations, book_page_translations, category/genre/value/level/tag_translations';
    RAISE NOTICE 'Colaboradores: book_collaborators';
    RAISE NOTICE 'Reviews: book_ratings, book_reviews, book_review_votes, book_rating_stats';
    RAISE NOTICE 'Geografía: countries, country_translations, book_countries';
    RAISE NOTICE 'Analytics: book_reading_sessions, book_page_views, user_book_progress, book_statistics';
    RAISE NOTICE 'Storage: book-images, book-pdfs';
    RAISE NOTICE '========================================';
END $$;
