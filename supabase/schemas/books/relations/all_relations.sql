-- ======================================================
-- TABLAS DE RELACIÓN (Many-to-Many)
-- Archivo: relations/all_relations.sql
-- ======================================================

SET search_path TO books, public;

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
