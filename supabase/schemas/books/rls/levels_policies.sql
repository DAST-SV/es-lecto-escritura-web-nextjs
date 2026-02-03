-- supabase/schemas/books/rls/levels_policies.sql
-- ============================================================================
-- RLS: levels, level_translations
-- DESCRIPCIÓN: Políticas de seguridad para niveles de lectura
-- ============================================================================

SET search_path TO books, app, public;

-- ============================================
-- LEVELS
-- ============================================
ALTER TABLE books.levels ENABLE ROW LEVEL SECURITY;

-- Lectura pública de niveles activos
CREATE POLICY "levels_public_read" ON books.levels
  FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

-- Administradores pueden gestionar niveles
CREATE POLICY "levels_admin_all" ON books.levels
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
-- LEVEL_TRANSLATIONS
-- ============================================
ALTER TABLE books.level_translations ENABLE ROW LEVEL SECURITY;

-- Lectura pública de traducciones activas
CREATE POLICY "level_trans_public_read" ON books.level_translations
  FOR SELECT
  USING (is_active = true);

-- Administradores pueden gestionar traducciones
CREATE POLICY "level_trans_admin_all" ON books.level_translations
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
GRANT SELECT ON books.levels TO anon;
GRANT SELECT ON books.level_translations TO anon;

-- Lectura para usuarios autenticados
GRANT SELECT ON books.levels TO authenticated;
GRANT SELECT ON books.level_translations TO authenticated;

-- Gestión para usuarios autenticados
GRANT INSERT, UPDATE, DELETE ON books.levels TO authenticated;
GRANT INSERT, UPDATE, DELETE ON books.level_translations TO authenticated;

SELECT 'BOOKS: RLS policies y GRANTs para levels creados' AS status;
