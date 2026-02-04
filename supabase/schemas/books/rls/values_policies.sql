-- supabase/schemas/books/rls/values_policies.sql
-- ============================================================================
-- RLS: values, value_translations, book_values
-- DESCRIPCIÓN: Políticas de seguridad para valores educativos
-- ============================================================================

SET search_path TO books, app, public;

-- ============================================
-- VALUES
-- ============================================
ALTER TABLE books.values ENABLE ROW LEVEL SECURITY;

-- Lectura pública de valores activos
CREATE POLICY "values_public_read" ON books.values
  FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

-- Administradores pueden gestionar valores
CREATE POLICY "values_admin_all" ON books.values
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
-- VALUE_TRANSLATIONS
-- ============================================
ALTER TABLE books.value_translations ENABLE ROW LEVEL SECURITY;

-- Lectura pública de traducciones activas
CREATE POLICY "value_trans_public_read" ON books.value_translations
  FOR SELECT
  USING (is_active = true);

-- Administradores pueden gestionar traducciones
CREATE POLICY "value_trans_admin_all" ON books.value_translations
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
-- BOOK_VALUES
-- ============================================
ALTER TABLE books.book_values ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "book_values_public_read" ON books.book_values
  FOR SELECT
  USING (true);

-- Creadores pueden gestionar valores de sus libros
CREATE POLICY "book_values_owner_all" ON books.book_values
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
GRANT SELECT ON books.values TO anon;
GRANT SELECT ON books.value_translations TO anon;
GRANT SELECT ON books.book_values TO anon;

-- Lectura para usuarios autenticados
GRANT SELECT ON books.values TO authenticated;
GRANT SELECT ON books.value_translations TO authenticated;
GRANT SELECT ON books.book_values TO authenticated;

-- Gestión para usuarios autenticados
GRANT INSERT, UPDATE, DELETE ON books.values TO authenticated;
GRANT INSERT, UPDATE, DELETE ON books.value_translations TO authenticated;
GRANT INSERT, UPDATE, DELETE ON books.book_values TO authenticated;

SELECT 'BOOKS: RLS policies y GRANTs para values creados' AS status;
