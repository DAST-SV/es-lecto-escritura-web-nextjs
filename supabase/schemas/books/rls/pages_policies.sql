-- supabase/schemas/books/rls/pages_policies.sql
-- ============================================================================
-- RLS: pages y page_translations
-- DESCRIPCIÓN: Políticas de seguridad para páginas de libros
-- ============================================================================

SET search_path TO books, app, public;

-- ============================================
-- PAGES
-- ============================================
ALTER TABLE books.pages ENABLE ROW LEVEL SECURITY;

-- Lectura pública de páginas de libros publicados
CREATE POLICY "pages_public_read" ON books.pages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM books.books b
      WHERE b.id = book_id
        AND (b.status = 'published' OR b.created_by = auth.uid())
        AND b.deleted_at IS NULL
    )
  );

-- Creadores pueden gestionar páginas de sus libros
CREATE POLICY "pages_owner_all" ON books.pages
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

-- Administradores pueden gestionar todas las páginas
CREATE POLICY "pages_admin_all" ON books.pages
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
-- PAGE_TRANSLATIONS
-- ============================================
ALTER TABLE books.page_translations ENABLE ROW LEVEL SECURITY;

-- Lectura pública de traducciones
CREATE POLICY "page_trans_public_read" ON books.page_translations
  FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM books.pages p
      JOIN books.books b ON b.id = p.book_id
      WHERE p.id = page_id
        AND (b.status = 'published' OR b.created_by = auth.uid())
        AND b.deleted_at IS NULL
    )
  );

-- Creadores pueden gestionar traducciones de páginas de sus libros
CREATE POLICY "page_trans_owner_all" ON books.page_translations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM books.pages p
      JOIN books.books b ON b.id = p.book_id
      WHERE p.id = page_id AND b.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM books.pages p
      JOIN books.books b ON b.id = p.book_id
      WHERE p.id = page_id AND b.created_by = auth.uid()
    )
  );

-- Administradores pueden gestionar todas las traducciones
CREATE POLICY "page_trans_admin_all" ON books.page_translations
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

SELECT 'BOOKS: RLS policies para pages creadas' AS status;
