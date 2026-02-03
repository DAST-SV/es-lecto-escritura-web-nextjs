-- supabase/schemas/books/rls/ratings_policies.sql
-- ============================================================================
-- RLS: book_ratings, book_reviews
-- DESCRIPCIÓN: Políticas de seguridad para calificaciones y reseñas
-- ============================================================================

SET search_path TO books, app, public;

-- ============================================
-- BOOK_RATINGS
-- ============================================
ALTER TABLE books.book_ratings ENABLE ROW LEVEL SECURITY;

-- Lectura pública de calificaciones
CREATE POLICY "book_ratings_public_read" ON books.book_ratings
  FOR SELECT
  USING (true);

-- Usuarios pueden crear sus propias calificaciones
CREATE POLICY "book_ratings_owner_insert" ON books.book_ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Usuarios pueden actualizar sus propias calificaciones
CREATE POLICY "book_ratings_owner_update" ON books.book_ratings
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Usuarios pueden eliminar sus propias calificaciones
CREATE POLICY "book_ratings_owner_delete" ON books.book_ratings
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- BOOK_REVIEWS
-- ============================================
ALTER TABLE books.book_reviews ENABLE ROW LEVEL SECURITY;

-- Lectura pública de reseñas aprobadas
CREATE POLICY "book_reviews_public_read" ON books.book_reviews
  FOR SELECT
  USING (is_approved = true AND deleted_at IS NULL);

-- Usuarios pueden ver sus propias reseñas (incluso no aprobadas)
CREATE POLICY "book_reviews_owner_read" ON books.book_reviews
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

-- Usuarios pueden crear sus propias reseñas
CREATE POLICY "book_reviews_owner_insert" ON books.book_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Usuarios pueden actualizar sus propias reseñas
CREATE POLICY "book_reviews_owner_update" ON books.book_reviews
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (user_id = auth.uid());

-- Administradores pueden gestionar todas las reseñas
CREATE POLICY "book_reviews_admin_all" ON books.book_reviews
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
-- GRANTS
-- ============================================

-- Lectura pública (anon)
GRANT SELECT ON books.book_ratings TO anon;
GRANT SELECT ON books.book_reviews TO anon;

-- Lectura para usuarios autenticados
GRANT SELECT ON books.book_ratings TO authenticated;
GRANT SELECT ON books.book_reviews TO authenticated;

-- Gestión para usuarios autenticados
GRANT INSERT, UPDATE, DELETE ON books.book_ratings TO authenticated;
GRANT INSERT, UPDATE, DELETE ON books.book_reviews TO authenticated;

SELECT 'BOOKS: RLS policies y GRANTs para ratings/reviews creados' AS status;
