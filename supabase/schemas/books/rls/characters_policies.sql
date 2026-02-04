-- supabase/schemas/books/rls/characters_policies.sql
-- ============================================================================
-- RLS: book_characters
-- DESCRIPCIÓN: Políticas de seguridad para personajes de libros
-- ============================================================================

SET search_path TO books, app, public;

-- ============================================
-- BOOK_CHARACTERS
-- ============================================
ALTER TABLE books.book_characters ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "book_characters_public_read" ON books.book_characters
  FOR SELECT
  USING (true);

-- Creadores pueden gestionar personajes de sus libros
CREATE POLICY "book_characters_owner_all" ON books.book_characters
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
GRANT SELECT ON books.book_characters TO anon;

-- Lectura para usuarios autenticados
GRANT SELECT ON books.book_characters TO authenticated;

-- Gestión para usuarios autenticados
GRANT INSERT, UPDATE, DELETE ON books.book_characters TO authenticated;

SELECT 'BOOKS: RLS policies y GRANTs para book_characters creados' AS status;
