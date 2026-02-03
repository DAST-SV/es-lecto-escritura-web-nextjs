-- supabase/schemas/books/rls/genres_policies.sql
-- ============================================================================
-- RLS: genres, genre_translations, book_genres
-- DESCRIPCIÓN: Políticas de seguridad para géneros
-- ============================================================================

SET search_path TO books, app, public;

-- ============================================
-- GENRES
-- ============================================
ALTER TABLE books.genres ENABLE ROW LEVEL SECURITY;

-- Lectura pública de géneros activos
CREATE POLICY "genres_public_read" ON books.genres
  FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

-- Administradores pueden gestionar géneros
CREATE POLICY "genres_admin_all" ON books.genres
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app.user_roles ur
      JOIN app.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'super_admin'
        AND ur.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app.user_roles ur
      JOIN app.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'super_admin'
        AND ur.is_active = true
    )
  );

-- ============================================
-- GENRE_TRANSLATIONS
-- ============================================
ALTER TABLE books.genre_translations ENABLE ROW LEVEL SECURITY;

-- Lectura pública de traducciones activas
CREATE POLICY "genre_trans_public_read" ON books.genre_translations
  FOR SELECT
  USING (is_active = true);

-- Administradores pueden gestionar traducciones
CREATE POLICY "genre_trans_admin_all" ON books.genre_translations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app.user_roles ur
      JOIN app.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'super_admin'
        AND ur.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app.user_roles ur
      JOIN app.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'super_admin'
        AND ur.is_active = true
    )
  );

-- ============================================
-- BOOK_GENRES
-- ============================================
ALTER TABLE books.book_genres ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "book_genres_public_read" ON books.book_genres
  FOR SELECT
  USING (true);

-- Creadores pueden gestionar géneros de sus libros
CREATE POLICY "book_genres_owner_all" ON books.book_genres
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM books.books b
      WHERE b.id = book_id AND b.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM books.books b
      WHERE b.id = book_id AND b.created_by = auth.uid()
    )
  );

-- ============================================
-- GRANTS
-- ============================================

-- Lectura pública (anon)
GRANT SELECT ON books.genres TO anon;
GRANT SELECT ON books.genre_translations TO anon;
GRANT SELECT ON books.book_genres TO anon;

-- Lectura para usuarios autenticados
GRANT SELECT ON books.genres TO authenticated;
GRANT SELECT ON books.genre_translations TO authenticated;
GRANT SELECT ON books.book_genres TO authenticated;

-- Gestión para usuarios autenticados
GRANT INSERT, UPDATE, DELETE ON books.genres TO authenticated;
GRANT INSERT, UPDATE, DELETE ON books.genre_translations TO authenticated;
GRANT INSERT, UPDATE, DELETE ON books.book_genres TO authenticated;

SELECT 'BOOKS: RLS policies y GRANTs para genres creados' AS status;
