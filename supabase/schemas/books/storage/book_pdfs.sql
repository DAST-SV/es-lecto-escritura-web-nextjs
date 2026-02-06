-- supabase/schemas/books/storage/book_pdfs.sql
-- ============================================
-- STORAGE BUCKET: book-pdfs
-- PDFs de libros (multi-idioma, bucket PRIVADO)
-- Requiere signed URLs para acceso de lectura
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
  false,  -- PRIVADO: requiere signed URLs (createSignedUrl)
  52428800,  -- 50MB limit per file
  ARRAY[
    'application/pdf'
  ]
);

-- ============================================
-- 2. ACCESS POLICIES
-- ============================================

-- Usuarios autenticados pueden leer PDFs (via signed URLs)
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
-- ESTRUCTURA DE CARPETAS
-- ============================================
/*
book-pdfs/
  {userId}/
    {bookId}/
      es.pdf        -- PDF en espanol
      en.pdf        -- PDF en ingles
      fr.pdf        -- PDF en frances

Referencia en book_translations.pdf_url:
  storage://book-pdfs/{userId}/{bookId}/{lang}.pdf

La app usa BookPDFService.getSignedUrl() para generar
signed URLs temporales al momento de leer el PDF.
*/

SELECT 'STORAGE: Bucket book-pdfs creado' AS status;
