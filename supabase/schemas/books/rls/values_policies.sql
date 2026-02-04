-- supabase/schemas/books/rls/values_policies.sql
-- ============================================================================
-- RLS POLICIES: Valores educativos
-- ============================================================================

SET search_path TO books, app, public;

-- Habilitar RLS
ALTER TABLE books.values ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.value_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE books.book_values ENABLE ROW LEVEL SECURITY;

-- VALUES: Lectura pública para valores activos
CREATE POLICY "values_select_public" ON books.values
  FOR SELECT USING (is_active = true AND deleted_at IS NULL);

-- VALUES: Solo admins pueden modificar
CREATE POLICY "values_admin_all" ON books.values
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM app.user_profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- VALUE_TRANSLATIONS: Lectura pública
CREATE POLICY "value_translations_select_public" ON books.value_translations
  FOR SELECT USING (true);

-- VALUE_TRANSLATIONS: Solo admins pueden modificar
CREATE POLICY "value_translations_admin_all" ON books.value_translations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM app.user_profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- BOOK_VALUES: Lectura pública
CREATE POLICY "book_values_select_public" ON books.book_values
  FOR SELECT USING (true);

-- BOOK_VALUES: Autores pueden modificar sus libros
CREATE POLICY "book_values_author_modify" ON books.book_values
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM books.books b
      WHERE b.id = book_id AND b.created_by = auth.uid()
    )
  );

SELECT 'BOOKS: Políticas RLS de values creadas' AS status;
