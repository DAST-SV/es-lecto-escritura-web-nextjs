-- supabase/schemas/books/rls/reading_policies.sql
-- ============================================================================
-- RLS: reading_progress, reading_sessions, favorites, reading_lists
-- DESCRIPCIÓN: Políticas de seguridad para progreso de lectura
-- ============================================================================

SET search_path TO books, app, public;

-- ============================================
-- READING_PROGRESS
-- ============================================
ALTER TABLE books.reading_progress ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver su propio progreso
CREATE POLICY "reading_progress_owner_read" ON books.reading_progress
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Usuarios pueden crear su propio progreso
CREATE POLICY "reading_progress_owner_insert" ON books.reading_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Usuarios pueden actualizar su propio progreso
CREATE POLICY "reading_progress_owner_update" ON books.reading_progress
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- READING_SESSIONS
-- ============================================
ALTER TABLE books.reading_sessions ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver sus propias sesiones (incluye sesiones anónimas)
CREATE POLICY "reading_sessions_owner_read" ON books.reading_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Cualquiera puede crear sesiones (autenticados y anónimos)
CREATE POLICY "reading_sessions_insert" ON books.reading_sessions
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Usuarios pueden actualizar sus propias sesiones
CREATE POLICY "reading_sessions_owner_update" ON books.reading_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- FAVORITES
-- ============================================
ALTER TABLE books.favorites ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver sus propios favoritos
CREATE POLICY "favorites_owner_read" ON books.favorites
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Usuarios pueden agregar a favoritos
CREATE POLICY "favorites_owner_insert" ON books.favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Usuarios pueden quitar de favoritos
CREATE POLICY "favorites_owner_delete" ON books.favorites
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- READING_LISTS
-- ============================================
ALTER TABLE books.reading_lists ENABLE ROW LEVEL SECURITY;

-- Lectura pública de listas públicas
CREATE POLICY "reading_lists_public_read" ON books.reading_lists
  FOR SELECT
  USING (is_public = true AND deleted_at IS NULL);

-- Usuarios pueden ver sus propias listas
CREATE POLICY "reading_lists_owner_read" ON books.reading_lists
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

-- Usuarios pueden crear sus propias listas
CREATE POLICY "reading_lists_owner_insert" ON books.reading_lists
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Usuarios pueden actualizar sus propias listas
CREATE POLICY "reading_lists_owner_update" ON books.reading_lists
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (user_id = auth.uid());

-- Usuarios pueden eliminar sus propias listas
CREATE POLICY "reading_lists_owner_delete" ON books.reading_lists
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- READING_LIST_BOOKS
-- ============================================
ALTER TABLE books.reading_list_books ENABLE ROW LEVEL SECURITY;

-- Lectura pública de libros en listas públicas
CREATE POLICY "reading_list_books_public_read" ON books.reading_list_books
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM books.reading_lists rl
      WHERE rl.id = reading_list_id
        AND rl.is_public = true
        AND rl.deleted_at IS NULL
    )
  );

-- Usuarios pueden ver libros en sus propias listas
CREATE POLICY "reading_list_books_owner_read" ON books.reading_list_books
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM books.reading_lists rl
      WHERE rl.id = reading_list_id
        AND rl.user_id = auth.uid()
    )
  );

-- Usuarios pueden agregar libros a sus listas
CREATE POLICY "reading_list_books_owner_insert" ON books.reading_list_books
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM books.reading_lists rl
      WHERE rl.id = reading_list_id
        AND rl.user_id = auth.uid()
    )
  );

-- Usuarios pueden actualizar libros en sus listas
CREATE POLICY "reading_list_books_owner_update" ON books.reading_list_books
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM books.reading_lists rl
      WHERE rl.id = reading_list_id
        AND rl.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM books.reading_lists rl
      WHERE rl.id = reading_list_id
        AND rl.user_id = auth.uid()
    )
  );

-- Usuarios pueden eliminar libros de sus listas
CREATE POLICY "reading_list_books_owner_delete" ON books.reading_list_books
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM books.reading_lists rl
      WHERE rl.id = reading_list_id
        AND rl.user_id = auth.uid()
    )
  );

-- ============================================
-- GRANTS
-- ============================================

-- Lectura pública (anon) para listas públicas
GRANT SELECT ON books.reading_lists TO anon;
GRANT SELECT ON books.reading_list_books TO anon;

-- Permisos para usuarios autenticados y anónimos
GRANT SELECT, INSERT, UPDATE ON books.reading_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE ON books.reading_sessions TO authenticated;
GRANT INSERT ON books.reading_sessions TO anon; -- Permitir sesiones anónimas
GRANT SELECT, INSERT, DELETE ON books.favorites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON books.reading_lists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON books.reading_list_books TO authenticated;

SELECT 'BOOKS: RLS policies y GRANTs para reading creados' AS status;
