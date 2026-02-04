-- supabase/schemas/books/rls/characters_policies.sql
-- ============================================================================
-- RLS POLICIES: Personajes de libros
-- ============================================================================

SET search_path TO books, app, public;

-- Habilitar RLS
ALTER TABLE books.book_characters ENABLE ROW LEVEL SECURITY;

-- BOOK_CHARACTERS: Lectura pública
CREATE POLICY "book_characters_select_public" ON books.book_characters
  FOR SELECT USING (true);

-- BOOK_CHARACTERS: Autores pueden modificar personajes de sus libros
CREATE POLICY "book_characters_author_insert" ON books.book_characters
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM books.books b
      WHERE b.id = book_id AND b.created_by = auth.uid()
    )
  );

CREATE POLICY "book_characters_author_update" ON books.book_characters
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM books.books b
      WHERE b.id = book_id AND b.created_by = auth.uid()
    )
  );

CREATE POLICY "book_characters_author_delete" ON books.book_characters
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM books.books b
      WHERE b.id = book_id AND b.created_by = auth.uid()
    )
  );

SELECT 'BOOKS: Políticas RLS de book_characters creadas' AS status;
