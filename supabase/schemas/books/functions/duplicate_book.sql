-- ======================================================
-- Función: duplicate_book
-- Archivo: functions/duplicate_book.sql
-- Descripción: Duplica un libro completo con todas sus páginas
-- ======================================================

SET search_path TO books, public;

CREATE OR REPLACE FUNCTION duplicate_book(
    source_book_id UUID,
    new_title VARCHAR(255) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_book_id UUID;
    source_book RECORD;
    page_record RECORD;
BEGIN
    -- Verificar permisos (solo puede duplicar sus propios libros)
    SELECT * INTO source_book
    FROM books
    WHERE id = source_book_id
    AND user_id = auth.uid()
    AND deleted_at IS NULL;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Libro no encontrado o sin permisos';
    END IF;

    -- Crear nuevo libro
    INSERT INTO books (
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
        FALSE -- Siempre empieza como no publicado
    )
    RETURNING id INTO new_book_id;

    -- Copiar páginas
    FOR page_record IN
        SELECT * FROM book_pages WHERE book_id = source_book_id ORDER BY page_number
    LOOP
        INSERT INTO book_pages (
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

    -- Copiar relaciones (categorías, valores, géneros, etc.)
    INSERT INTO books_categories (book_id, category_id, is_primary)
    SELECT new_book_id, category_id, is_primary
    FROM books_categories
    WHERE book_id = source_book_id;

    INSERT INTO books_values (book_id, value_id, is_primary)
    SELECT new_book_id, value_id, is_primary
    FROM books_values
    WHERE book_id = source_book_id;

    INSERT INTO books_genres (book_id, genre_id)
    SELECT new_book_id, genre_id
    FROM books_genres
    WHERE book_id = source_book_id;

    INSERT INTO books_tags (book_id, tag_id, is_primary)
    SELECT new_book_id, tag_id, is_primary
    FROM books_tags
    WHERE book_id = source_book_id;

    INSERT INTO books_authors (book_id, author_id, author_order)
    SELECT new_book_id, author_id, author_order
    FROM books_authors
    WHERE book_id = source_book_id;

    INSERT INTO books_characters (book_id, character_id, is_main)
    SELECT new_book_id, character_id, is_main
    FROM books_characters
    WHERE book_id = source_book_id;

    INSERT INTO books_languages (book_id, language_id, is_original)
    SELECT new_book_id, language_id, is_original
    FROM books_languages
    WHERE book_id = source_book_id;

    RETURN new_book_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION duplicate_book IS 'Duplica un libro completo con todas sus páginas y relaciones';
