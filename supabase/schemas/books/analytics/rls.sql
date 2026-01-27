-- ======================================================
-- SISTEMA DE ESTADÍSTICAS DE LECTURA - RLS
-- Archivo: analytics/rls.sql
-- ======================================================

SET search_path TO books, public;

-- ======================================================
-- HABILITAR RLS
-- ======================================================
ALTER TABLE book_reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_book_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_statistics ENABLE ROW LEVEL SECURITY;

-- ======================================================
-- POLÍTICAS DE SEGURIDAD
-- ======================================================

-- Service role: acceso total
CREATE POLICY "Service role: acceso total a book_reading_sessions"
    ON book_reading_sessions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_page_views"
    ON book_page_views
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role: acceso total a user_book_progress"
    ON user_book_progress
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_statistics"
    ON book_statistics
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Usuarios autenticados
CREATE POLICY "Usuarios: insertar sus propias sesiones"
    ON book_reading_sessions
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Usuarios: ver sus propias sesiones"
    ON book_reading_sessions
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Usuarios: insertar vistas de páginas"
    ON book_page_views
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Usuarios: ver vistas de páginas"
    ON book_page_views
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Usuarios: gestionar su propio progreso"
    ON user_book_progress
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Público: ver estadísticas de libros"
    ON book_statistics
    FOR SELECT
    TO authenticated, anon
    USING (true);

-- ======================================================
-- PERMISOS DE TABLAS
-- ======================================================
GRANT SELECT, INSERT, UPDATE ON book_reading_sessions TO authenticated;
GRANT SELECT, INSERT ON book_page_views TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_book_progress TO authenticated;
GRANT SELECT ON book_statistics TO authenticated, anon;
