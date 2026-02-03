-- supabase/schemas/books/rls/tags_policies.sql
-- ============================================================================
-- RLS: tags, tag_translations, book_tags
-- DESCRIPCIÓN: Políticas de seguridad para etiquetas
-- ============================================================================

SET search_path TO books, app, public;

-- ============================================
-- TAGS
-- ============================================
ALTER TABLE books.tags ENABLE ROW LEVEL SECURITY;

-- Lectura pública de tags activos
CREATE POLICY "tags_public_read" ON books.tags
  FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

-- Administradores pueden gestionar tags
CREATE POLICY "tags_admin_all" ON books.tags
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
-- TAG_TRANSLATIONS
-- ============================================
ALTER TABLE books.tag_translations ENABLE ROW LEVEL SECURITY;

-- Lectura pública de traducciones activas
CREATE POLICY "tag_trans_public_read" ON books.tag_translations
  FOR SELECT
  USING (is_active = true);

-- Administradores pueden gestionar traducciones
CREATE POLICY "tag_trans_admin_all" ON books.tag_translations
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
-- BOOK_TAGS
-- ============================================
ALTER TABLE books.book_tags ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "book_tags_public_read" ON books.book_tags
  FOR SELECT
  USING (true);

-- Creadores pueden gestionar tags de sus libros
CREATE POLICY "book_tags_owner_all" ON books.book_tags
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
GRANT SELECT ON books.tags TO anon;
GRANT SELECT ON books.tag_translations TO anon;
GRANT SELECT ON books.book_tags TO anon;

-- Lectura para usuarios autenticados
GRANT SELECT ON books.tags TO authenticated;
GRANT SELECT ON books.tag_translations TO authenticated;
GRANT SELECT ON books.book_tags TO authenticated;

-- Gestión para usuarios autenticados
GRANT INSERT, UPDATE, DELETE ON books.tags TO authenticated;
GRANT INSERT, UPDATE, DELETE ON books.tag_translations TO authenticated;
GRANT INSERT, UPDATE, DELETE ON books.book_tags TO authenticated;

SELECT 'BOOKS: RLS policies y GRANTs para tags creados' AS status;
