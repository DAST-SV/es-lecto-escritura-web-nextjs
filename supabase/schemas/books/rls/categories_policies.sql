-- supabase/schemas/books/rls/categories_policies.sql
-- ============================================================================
-- RLS: categories y category_translations
-- DESCRIPCIÓN: Políticas de seguridad para categorías
-- ============================================================================

SET search_path TO books, app, public;

-- ============================================
-- CATEGORIES
-- ============================================
ALTER TABLE books.categories ENABLE ROW LEVEL SECURITY;

-- Lectura pública de categorías activas
DROP POLICY IF EXISTS "categories_public_read" ON books.categories;
CREATE POLICY "categories_public_read" ON books.categories
  FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

-- Administradores pueden gestionar categorías
DROP POLICY IF EXISTS "categories_admin_all" ON books.categories;
CREATE POLICY "categories_admin_all" ON books.categories
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
-- CATEGORY_TRANSLATIONS
-- ============================================
ALTER TABLE books.category_translations ENABLE ROW LEVEL SECURITY;

-- Lectura pública de traducciones activas
DROP POLICY IF EXISTS "cat_trans_public_read" ON books.category_translations;
CREATE POLICY "cat_trans_public_read" ON books.category_translations
  FOR SELECT
  USING (is_active = true);

-- Administradores pueden gestionar traducciones
DROP POLICY IF EXISTS "cat_trans_admin_all" ON books.category_translations;
CREATE POLICY "cat_trans_admin_all" ON books.category_translations
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

SELECT 'BOOKS: RLS policies para categories creadas' AS status;
