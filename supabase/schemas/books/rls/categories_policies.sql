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
CREATE POLICY "categories_public_read" ON books.categories
  FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

-- Administradores pueden gestionar categorías
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
CREATE POLICY "cat_trans_public_read" ON books.category_translations
  FOR SELECT
  USING (is_active = true);

-- Administradores pueden gestionar traducciones
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

-- ============================================
-- GRANTS
-- ============================================

-- Lectura pública (anon)
GRANT SELECT ON books.categories TO anon;
GRANT SELECT ON books.category_translations TO anon;

-- Lectura para usuarios autenticados
GRANT SELECT ON books.categories TO authenticated;
GRANT SELECT ON books.category_translations TO authenticated;

-- Gestión para usuarios autenticados
GRANT INSERT, UPDATE, DELETE ON books.categories TO authenticated;
GRANT INSERT, UPDATE, DELETE ON books.category_translations TO authenticated;

SELECT 'BOOKS: RLS policies y GRANTs para categories creados' AS status;
