-- supabase/schemas/books/rls/books_policies.sql
-- ============================================================================
-- RLS: books y book_translations
-- DESCRIPCIÓN: Políticas de seguridad para libros
-- ============================================================================

SET search_path TO books, app, public;

-- ============================================
-- BOOKS
-- ============================================
ALTER TABLE books.books ENABLE ROW LEVEL SECURITY;

-- Lectura pública de libros publicados
CREATE POLICY "books_public_read" ON books.books
  FOR SELECT
  USING (status = 'published' AND deleted_at IS NULL);

-- Usuarios autenticados ven sus propios borradores
CREATE POLICY "books_owner_read" ON books.books
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid() AND deleted_at IS NULL);

-- Creadores pueden actualizar sus libros
CREATE POLICY "books_owner_update" ON books.books
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (created_by = auth.uid());

-- Usuarios autenticados pueden crear libros
CREATE POLICY "books_auth_insert" ON books.books
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Administradores pueden gestionar todos los libros
CREATE POLICY "books_admin_all" ON books.books
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app.user_roles ur
      JOIN app.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('super_admin', 'school')
        AND ur.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app.user_roles ur
      JOIN app.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('super_admin', 'school')
        AND ur.is_active = true
    )
  );

-- ============================================
-- BOOK_TRANSLATIONS
-- ============================================
ALTER TABLE books.book_translations ENABLE ROW LEVEL SECURITY;

-- Lectura pública de traducciones de libros publicados
CREATE POLICY "book_trans_public_read" ON books.book_translations
  FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM books.books b
      WHERE b.id = book_id
        AND (b.status = 'published' OR b.created_by = auth.uid())
        AND b.deleted_at IS NULL
    )
  );

-- Creadores pueden gestionar traducciones de sus libros
CREATE POLICY "book_trans_owner_all" ON books.book_translations
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

-- Administradores pueden gestionar todas las traducciones
CREATE POLICY "book_trans_admin_all" ON books.book_translations
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

SELECT 'BOOKS: RLS policies para books creadas' AS status;
