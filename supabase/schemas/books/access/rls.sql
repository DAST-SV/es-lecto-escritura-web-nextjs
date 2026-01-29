-- =============================================
-- RLS POLICIES PARA SISTEMA DE ACCESO
-- =============================================

-- Habilitar RLS en tablas que no lo tengan
ALTER TABLE books.book_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_page_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_rating_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_countries ENABLE ROW LEVEL SECURITY;

-- =============================================
-- BOOK_TRANSLATIONS
-- =============================================

-- Service role: acceso total
DROP POLICY IF EXISTS "service_role_book_translations" ON books.book_translations;
CREATE POLICY "service_role_book_translations" ON books.book_translations
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Lectura pública: traducciones de libros publicados
DROP POLICY IF EXISTS "public_read_book_translations" ON books.book_translations;
CREATE POLICY "public_read_book_translations" ON books.book_translations
    FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books.books b
            WHERE b.id = book_id
            AND b.is_published = TRUE
            AND b.deleted_at IS NULL
        )
        AND is_active = TRUE
    );

-- Autores pueden gestionar traducciones de sus libros
DROP POLICY IF EXISTS "authors_manage_book_translations" ON books.book_translations;
CREATE POLICY "authors_manage_book_translations" ON books.book_translations
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books.books b
            WHERE b.id = book_id AND b.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM books.books b
            WHERE b.id = book_id AND b.user_id = auth.uid()
        )
    );

-- =============================================
-- BOOK_PAGE_TRANSLATIONS
-- =============================================

DROP POLICY IF EXISTS "service_role_book_page_translations" ON books.book_page_translations;
CREATE POLICY "service_role_book_page_translations" ON books.book_page_translations
    FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_book_page_translations" ON books.book_page_translations;
CREATE POLICY "public_read_book_page_translations" ON books.book_page_translations
    FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books.book_pages bp
            JOIN books.books b ON b.id = bp.book_id
            WHERE bp.id = book_page_id
            AND b.is_published = TRUE
            AND b.deleted_at IS NULL
        )
    );

DROP POLICY IF EXISTS "authors_manage_book_page_translations" ON books.book_page_translations;
CREATE POLICY "authors_manage_book_page_translations" ON books.book_page_translations
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books.book_pages bp
            JOIN books.books b ON b.id = bp.book_id
            WHERE bp.id = book_page_id AND b.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM books.book_pages bp
            JOIN books.books b ON b.id = bp.book_id
            WHERE bp.id = book_page_id AND b.user_id = auth.uid()
        )
    );

-- =============================================
-- BOOK_COLLABORATORS
-- =============================================

DROP POLICY IF EXISTS "service_role_book_collaborators" ON books.book_collaborators;
CREATE POLICY "service_role_book_collaborators" ON books.book_collaborators
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Lectura pública: colaboradores de libros publicados
DROP POLICY IF EXISTS "public_read_book_collaborators" ON books.book_collaborators;
CREATE POLICY "public_read_book_collaborators" ON books.book_collaborators
    FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books.books b
            WHERE b.id = book_id
            AND b.is_published = TRUE
            AND b.deleted_at IS NULL
        )
    );

-- Dueño del libro puede gestionar colaboradores
DROP POLICY IF EXISTS "owner_manage_book_collaborators" ON books.book_collaborators;
CREATE POLICY "owner_manage_book_collaborators" ON books.book_collaborators
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books.books b
            WHERE b.id = book_id AND b.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM books.books b
            WHERE b.id = book_id AND b.user_id = auth.uid()
        )
    );

-- =============================================
-- BOOK_RATINGS
-- =============================================

DROP POLICY IF EXISTS "service_role_book_ratings" ON books.book_ratings;
CREATE POLICY "service_role_book_ratings" ON books.book_ratings
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Lectura pública
DROP POLICY IF EXISTS "public_read_book_ratings" ON books.book_ratings;
CREATE POLICY "public_read_book_ratings" ON books.book_ratings
    FOR SELECT TO anon, authenticated USING (true);

-- Usuarios autenticados pueden gestionar sus propios ratings
DROP POLICY IF EXISTS "users_manage_own_ratings" ON books.book_ratings;
CREATE POLICY "users_manage_own_ratings" ON books.book_ratings
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- =============================================
-- BOOK_REVIEWS
-- =============================================

DROP POLICY IF EXISTS "service_role_book_reviews" ON books.book_reviews;
CREATE POLICY "service_role_book_reviews" ON books.book_reviews
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Lectura pública: reviews aprobadas y no eliminadas
DROP POLICY IF EXISTS "public_read_book_reviews" ON books.book_reviews;
CREATE POLICY "public_read_book_reviews" ON books.book_reviews
    FOR SELECT TO anon, authenticated
    USING (is_approved = TRUE AND deleted_at IS NULL AND is_hidden = FALSE);

-- Usuarios pueden ver sus propias reviews (incluso no aprobadas)
DROP POLICY IF EXISTS "users_read_own_reviews" ON books.book_reviews;
CREATE POLICY "users_read_own_reviews" ON books.book_reviews
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Usuarios pueden gestionar sus propias reviews
DROP POLICY IF EXISTS "users_manage_own_reviews" ON books.book_reviews;
CREATE POLICY "users_manage_own_reviews" ON books.book_reviews
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_update_own_reviews" ON books.book_reviews;
CREATE POLICY "users_update_own_reviews" ON books.book_reviews
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_delete_own_reviews" ON books.book_reviews;
CREATE POLICY "users_delete_own_reviews" ON books.book_reviews
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- =============================================
-- BOOK_REVIEW_VOTES
-- =============================================

DROP POLICY IF EXISTS "service_role_book_review_votes" ON books.book_review_votes;
CREATE POLICY "service_role_book_review_votes" ON books.book_review_votes
    FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_review_votes" ON books.book_review_votes;
CREATE POLICY "public_read_review_votes" ON books.book_review_votes
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "users_manage_own_votes" ON books.book_review_votes;
CREATE POLICY "users_manage_own_votes" ON books.book_review_votes
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- =============================================
-- BOOK_RATING_STATS
-- =============================================

DROP POLICY IF EXISTS "service_role_book_rating_stats" ON books.book_rating_stats;
CREATE POLICY "service_role_book_rating_stats" ON books.book_rating_stats
    FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_book_rating_stats" ON books.book_rating_stats;
CREATE POLICY "public_read_book_rating_stats" ON books.book_rating_stats
    FOR SELECT TO anon, authenticated USING (true);

-- =============================================
-- BOOK_COUNTRIES
-- =============================================

DROP POLICY IF EXISTS "service_role_book_countries" ON books.book_countries;
CREATE POLICY "service_role_book_countries" ON books.book_countries
    FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_book_countries" ON books.book_countries;
CREATE POLICY "public_read_book_countries" ON books.book_countries
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "authors_manage_book_countries" ON books.book_countries;
CREATE POLICY "authors_manage_book_countries" ON books.book_countries
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books.books b
            WHERE b.id = book_id AND b.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM books.books b
            WHERE b.id = book_id AND b.user_id = auth.uid()
        )
    );

-- =============================================
-- CATALOG TRANSLATIONS (Solo lectura pública)
-- =============================================

ALTER TABLE books.book_category_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_genre_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_value_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_level_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_tag_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.country_translations ENABLE ROW LEVEL SECURITY;

-- Service role para todas
DROP POLICY IF EXISTS "service_role_category_translations" ON books.book_category_translations;
CREATE POLICY "service_role_category_translations" ON books.book_category_translations
    FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_genre_translations" ON books.book_genre_translations;
CREATE POLICY "service_role_genre_translations" ON books.book_genre_translations
    FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_value_translations" ON books.book_value_translations;
CREATE POLICY "service_role_value_translations" ON books.book_value_translations
    FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_level_translations" ON books.book_level_translations;
CREATE POLICY "service_role_level_translations" ON books.book_level_translations
    FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_tag_translations" ON books.book_tag_translations;
CREATE POLICY "service_role_tag_translations" ON books.book_tag_translations
    FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_countries" ON books.countries;
CREATE POLICY "service_role_countries" ON books.countries
    FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_country_translations" ON books.country_translations;
CREATE POLICY "service_role_country_translations" ON books.country_translations
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Lectura pública para catálogos
DROP POLICY IF EXISTS "public_read_category_translations" ON books.book_category_translations;
CREATE POLICY "public_read_category_translations" ON books.book_category_translations
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_genre_translations" ON books.book_genre_translations;
CREATE POLICY "public_read_genre_translations" ON books.book_genre_translations
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_value_translations" ON books.book_value_translations;
CREATE POLICY "public_read_value_translations" ON books.book_value_translations
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_level_translations" ON books.book_level_translations;
CREATE POLICY "public_read_level_translations" ON books.book_level_translations
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_tag_translations" ON books.book_tag_translations;
CREATE POLICY "public_read_tag_translations" ON books.book_tag_translations
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_countries" ON books.countries;
CREATE POLICY "public_read_countries" ON books.countries
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_country_translations" ON books.country_translations;
CREATE POLICY "public_read_country_translations" ON books.country_translations
    FOR SELECT TO anon, authenticated USING (true);
