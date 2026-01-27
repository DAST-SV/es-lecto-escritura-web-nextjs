-- ======================================================
-- ROW LEVEL SECURITY (RLS)
-- Archivo: rls/all_policies.sql
-- ======================================================

SET search_path TO books, public;

-- ======================================================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- ======================================================

-- Tablas principales
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_views ENABLE ROW LEVEL SECURITY;

-- Tablas de relación
ALTER TABLE books_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE books_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE books_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE books_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE books_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE books_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE books_tags ENABLE ROW LEVEL SECURITY;

-- Catálogos
ALTER TABLE book_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_characters ENABLE ROW LEVEL SECURITY;

-- ======================================================
-- POLÍTICAS PARA SERVICE_ROLE (acceso total)
-- ======================================================

CREATE POLICY "Service role: acceso total a books"
    ON books FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_pages"
    ON book_pages FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a books_authors"
    ON books_authors FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a books_characters"
    ON books_characters FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a books_categories"
    ON books_categories FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a books_values"
    ON books_values FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a books_genres"
    ON books_genres FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a books_languages"
    ON books_languages FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a books_tags"
    ON books_tags FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_audit_logs"
    ON book_audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_views"
    ON book_views FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ======================================================
-- POLÍTICAS DE LECTURA PÚBLICA (libros publicados)
-- ======================================================

CREATE POLICY "Público: leer libros publicados"
    ON books FOR SELECT TO anon, authenticated
    USING (is_published = TRUE AND deleted_at IS NULL);

CREATE POLICY "Público: leer book_pages de libros publicados"
    ON book_pages FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = book_pages.book_id
            AND books.is_published = TRUE
            AND books.deleted_at IS NULL
        )
    );

CREATE POLICY "Público: leer books_authors de libros publicados"
    ON books_authors FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = books_authors.book_id
            AND books.is_published = TRUE
            AND books.deleted_at IS NULL
        )
    );

CREATE POLICY "Público: leer books_characters de libros publicados"
    ON books_characters FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = books_characters.book_id
            AND books.is_published = TRUE
            AND books.deleted_at IS NULL
        )
    );

CREATE POLICY "Público: leer books_categories de libros publicados"
    ON books_categories FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = books_categories.book_id
            AND books.is_published = TRUE
            AND books.deleted_at IS NULL
        )
    );

CREATE POLICY "Público: leer books_values de libros publicados"
    ON books_values FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = books_values.book_id
            AND books.is_published = TRUE
            AND books.deleted_at IS NULL
        )
    );

CREATE POLICY "Público: leer books_genres de libros publicados"
    ON books_genres FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = books_genres.book_id
            AND books.is_published = TRUE
            AND books.deleted_at IS NULL
        )
    );

CREATE POLICY "Público: leer books_languages de libros publicados"
    ON books_languages FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = books_languages.book_id
            AND books.is_published = TRUE
            AND books.deleted_at IS NULL
        )
    );

CREATE POLICY "Público: leer books_tags de libros publicados"
    ON books_tags FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = books_tags.book_id
            AND books.is_published = TRUE
            AND books.deleted_at IS NULL
        )
    );

-- ======================================================
-- POLÍTICAS PARA USUARIOS AUTENTICADOS (sus propios libros)
-- ======================================================

-- Políticas de books
CREATE POLICY "Usuarios: leer libros propios"
    ON books FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Usuarios: crear libros propios"
    ON books FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuarios: actualizar libros propios"
    ON books FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuarios: eliminar libros propios"
    ON books FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- Políticas de book_pages
CREATE POLICY "Usuarios: leer book_pages de libros propios"
    ON book_pages FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = book_pages.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios: crear book_pages en libros propios"
    ON book_pages FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = book_pages.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios: actualizar book_pages de libros propios"
    ON book_pages FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = book_pages.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios: eliminar book_pages de libros propios"
    ON book_pages FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = book_pages.book_id
            AND books.user_id = auth.uid()
        )
    );

-- Políticas de relaciones
CREATE POLICY "Usuarios: gestionar books_authors de libros propios"
    ON books_authors FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = books_authors.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios: gestionar books_characters de libros propios"
    ON books_characters FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = books_characters.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios: gestionar books_categories de libros propios"
    ON books_categories FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = books_categories.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios: gestionar books_values de libros propios"
    ON books_values FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = books_values.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios: gestionar books_genres de libros propios"
    ON books_genres FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = books_genres.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios: gestionar books_languages de libros propios"
    ON books_languages FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = books_languages.book_id
            AND books.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios: gestionar books_tags de libros propios"
    ON books_tags FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM books
            WHERE books.id = books_tags.book_id
            AND books.user_id = auth.uid()
        )
    );

-- ======================================================
-- POLÍTICAS DE LECTURA PÚBLICA PARA CATÁLOGOS
-- ======================================================

CREATE POLICY "Público: leer tipos de libros"
    ON book_types FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Público: leer niveles de lectura"
    ON book_levels FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Público: leer categorías"
    ON book_categories FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Público: leer valores"
    ON book_values FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Público: leer géneros"
    ON book_genres FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Público: leer idiomas activos"
    ON book_languages FOR SELECT TO anon, authenticated
    USING (is_active = TRUE);

CREATE POLICY "Público: leer etiquetas"
    ON book_tags FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Público: leer autores"
    ON book_authors FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Público: leer personajes"
    ON book_characters FOR SELECT TO anon, authenticated
    USING (true);

-- ======================================================
-- POLÍTICAS PARA AUDITORÍA Y VISTAS
-- ======================================================

CREATE POLICY "Usuarios: ver sus propios registros de auditoría"
    ON book_audit_logs FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Cualquiera: insertar vistas de libros"
    ON book_views FOR INSERT TO anon, authenticated
    WITH CHECK (true);
