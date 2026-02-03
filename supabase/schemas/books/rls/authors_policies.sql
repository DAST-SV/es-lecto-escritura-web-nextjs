-- supabase/schemas/books/rls/authors_policies.sql
-- ============================================================================
-- RLS: authors y author_translations
-- DESCRIPCIÓN: Políticas de seguridad para autores
-- ============================================================================

SET search_path TO books, app, public;

-- ============================================
-- AUTHORS
-- ============================================
ALTER TABLE books.authors ENABLE ROW LEVEL SECURITY;

-- Lectura pública de autores activos
CREATE POLICY "authors_public_read" ON books.authors
  FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

-- Administradores pueden gestionar autores
CREATE POLICY "authors_admin_all" ON books.authors
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
-- AUTHOR_TRANSLATIONS
-- ============================================
ALTER TABLE books.author_translations ENABLE ROW LEVEL SECURITY;

-- Lectura pública de traducciones activas
CREATE POLICY "author_trans_public_read" ON books.author_translations
  FOR SELECT
  USING (is_active = true);

-- Administradores pueden gestionar traducciones
CREATE POLICY "author_trans_admin_all" ON books.author_translations
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
-- BOOK_AUTHORS
-- ============================================
ALTER TABLE books.book_authors ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "book_authors_public_read" ON books.book_authors
  FOR SELECT
  USING (true);

-- Creadores pueden gestionar autores de sus libros
CREATE POLICY "book_authors_owner_all" ON books.book_authors
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

SELECT 'BOOKS: RLS policies para authors creadas' AS status;
