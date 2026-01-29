-- =============================================
-- TRADUCCIONES DE CATÁLOGOS DE LIBROS
-- =============================================
-- Permite traducir categorías, géneros, valores, niveles y etiquetas
-- Al cambiar el locale, los nombres de catálogos cambian
-- =============================================

-- Traducciones de categorías
CREATE TABLE IF NOT EXISTS books.book_category_translations (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES books.book_categories(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL REFERENCES app.languages(code) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_category_translations UNIQUE(category_id, language_code)
);

-- Traducciones de géneros
CREATE TABLE IF NOT EXISTS books.book_genre_translations (
    id SERIAL PRIMARY KEY,
    genre_id INTEGER NOT NULL REFERENCES books.book_genres(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL REFERENCES app.languages(code) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_genre_translations UNIQUE(genre_id, language_code)
);

-- Traducciones de valores educativos
CREATE TABLE IF NOT EXISTS books.book_value_translations (
    id SERIAL PRIMARY KEY,
    value_id INTEGER NOT NULL REFERENCES books.book_values(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL REFERENCES app.languages(code) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_value_translations UNIQUE(value_id, language_code)
);

-- Traducciones de niveles de lectura
CREATE TABLE IF NOT EXISTS books.book_level_translations (
    id SERIAL PRIMARY KEY,
    level_id SMALLINT NOT NULL REFERENCES books.book_levels(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL REFERENCES app.languages(code) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_level_translations UNIQUE(level_id, language_code)
);

-- Traducciones de etiquetas
CREATE TABLE IF NOT EXISTS books.book_tag_translations (
    id SERIAL PRIMARY KEY,
    tag_id INTEGER NOT NULL REFERENCES books.book_tags(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL REFERENCES app.languages(code) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_tag_translations UNIQUE(tag_id, language_code)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_category_translations_category ON books.book_category_translations(category_id);
CREATE INDEX IF NOT EXISTS idx_category_translations_language ON books.book_category_translations(language_code);

CREATE INDEX IF NOT EXISTS idx_genre_translations_genre ON books.book_genre_translations(genre_id);
CREATE INDEX IF NOT EXISTS idx_genre_translations_language ON books.book_genre_translations(language_code);

CREATE INDEX IF NOT EXISTS idx_value_translations_value ON books.book_value_translations(value_id);
CREATE INDEX IF NOT EXISTS idx_value_translations_language ON books.book_value_translations(language_code);

CREATE INDEX IF NOT EXISTS idx_level_translations_level ON books.book_level_translations(level_id);
CREATE INDEX IF NOT EXISTS idx_level_translations_language ON books.book_level_translations(language_code);

CREATE INDEX IF NOT EXISTS idx_tag_translations_tag ON books.book_tag_translations(tag_id);
CREATE INDEX IF NOT EXISTS idx_tag_translations_language ON books.book_tag_translations(language_code);

-- =============================================
-- FUNCIONES HELPER PARA OBTENER CATÁLOGOS TRADUCIDOS
-- =============================================

-- Función para obtener categorías con traducción
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

-- Función para obtener géneros con traducción
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

-- Función para obtener valores con traducción
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

-- Función para obtener niveles con traducción
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

-- Función para obtener etiquetas con traducción
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

-- Comentarios
COMMENT ON TABLE books.book_category_translations IS 'Traducciones de categorías de libros por idioma';
COMMENT ON TABLE books.book_genre_translations IS 'Traducciones de géneros literarios por idioma';
COMMENT ON TABLE books.book_value_translations IS 'Traducciones de valores educativos por idioma';
COMMENT ON TABLE books.book_level_translations IS 'Traducciones de niveles de lectura por idioma';
COMMENT ON TABLE books.book_tag_translations IS 'Traducciones de etiquetas por idioma';
