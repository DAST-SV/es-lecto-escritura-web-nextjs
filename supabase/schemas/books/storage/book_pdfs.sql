-- supabase/schemas/books/storage/book_pdfs.sql
-- ============================================
-- STORAGE BUCKET: book-pdfs
-- PDFs de libros (multi-idioma)
-- ============================================

-- ============================================
-- 1. CREATE BUCKET
-- ============================================

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'book-pdfs',
  'book-pdfs',
  false,  -- Private bucket - acceso controlado
  52428800,  -- 50MB limit per file
  ARRAY[
    'application/pdf'
  ]
);

-- ============================================
-- 2. ACCESS POLICIES
-- ============================================

-- Usuarios autenticados pueden leer PDFs
CREATE POLICY "book_pdfs_select_policy"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'book-pdfs');

-- Usuarios autenticados pueden subir PDFs
CREATE POLICY "book_pdfs_insert_policy"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'book-pdfs');

-- Usuarios autenticados pueden actualizar PDFs
CREATE POLICY "book_pdfs_update_policy"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'book-pdfs')
WITH CHECK (bucket_id = 'book-pdfs');

-- Usuarios autenticados pueden eliminar PDFs
CREATE POLICY "book_pdfs_delete_policy"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'book-pdfs');

-- ============================================
-- ESTRUCTURA DE CARPETAS RECOMENDADA
-- ============================================
/*
book-pdfs/
├── {book_id}/
│   ├── es/
│   │   └── libro.pdf
│   ├── en/
│   │   └── libro.pdf
│   └── fr/
│       └── libro.pdf
*/

SELECT 'STORAGE: Bucket book-pdfs creado' AS status;
