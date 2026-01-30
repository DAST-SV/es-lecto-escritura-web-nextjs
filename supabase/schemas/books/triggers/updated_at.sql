-- supabase/schemas/books/triggers/updated_at.sql
-- ============================================================================
-- TRIGGERS: updated_at
-- DESCRIPCIÓN: Actualiza automáticamente updated_at en todas las tablas
-- ============================================================================

SET search_path TO books, app, public;

-- Función genérica para updated_at (usa la de app si existe)
CREATE OR REPLACE FUNCTION books.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CATEGORIES
-- ============================================
DROP TRIGGER IF EXISTS set_categories_updated_at ON books.categories;
CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON books.categories
  FOR EACH ROW
  EXECUTE FUNCTION books.set_updated_at();

-- ============================================
-- CATEGORY_TRANSLATIONS
-- ============================================
DROP TRIGGER IF EXISTS set_cat_trans_updated_at ON books.category_translations;
CREATE TRIGGER set_cat_trans_updated_at
  BEFORE UPDATE ON books.category_translations
  FOR EACH ROW
  EXECUTE FUNCTION books.set_updated_at();

-- ============================================
-- AUTHORS
-- ============================================
DROP TRIGGER IF EXISTS set_authors_updated_at ON books.authors;
CREATE TRIGGER set_authors_updated_at
  BEFORE UPDATE ON books.authors
  FOR EACH ROW
  EXECUTE FUNCTION books.set_updated_at();

-- ============================================
-- AUTHOR_TRANSLATIONS
-- ============================================
DROP TRIGGER IF EXISTS set_author_trans_updated_at ON books.author_translations;
CREATE TRIGGER set_author_trans_updated_at
  BEFORE UPDATE ON books.author_translations
  FOR EACH ROW
  EXECUTE FUNCTION books.set_updated_at();

-- ============================================
-- BOOKS
-- ============================================
DROP TRIGGER IF EXISTS set_books_updated_at ON books.books;
CREATE TRIGGER set_books_updated_at
  BEFORE UPDATE ON books.books
  FOR EACH ROW
  EXECUTE FUNCTION books.set_updated_at();

-- ============================================
-- BOOK_TRANSLATIONS
-- ============================================
DROP TRIGGER IF EXISTS set_book_trans_updated_at ON books.book_translations;
CREATE TRIGGER set_book_trans_updated_at
  BEFORE UPDATE ON books.book_translations
  FOR EACH ROW
  EXECUTE FUNCTION books.set_updated_at();

-- ============================================
-- PAGES
-- ============================================
DROP TRIGGER IF EXISTS set_pages_updated_at ON books.pages;
CREATE TRIGGER set_pages_updated_at
  BEFORE UPDATE ON books.pages
  FOR EACH ROW
  EXECUTE FUNCTION books.set_updated_at();

-- ============================================
-- PAGE_TRANSLATIONS
-- ============================================
DROP TRIGGER IF EXISTS set_page_trans_updated_at ON books.page_translations;
CREATE TRIGGER set_page_trans_updated_at
  BEFORE UPDATE ON books.page_translations
  FOR EACH ROW
  EXECUTE FUNCTION books.set_updated_at();

SELECT 'BOOKS: Triggers updated_at creados' AS status;
