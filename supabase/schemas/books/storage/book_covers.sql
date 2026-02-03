-- supabase/schemas/books/storage/book_covers.sql
-- ============================================
-- STORAGE BUCKET: book-covers
-- Portadas de libros
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
  'book-covers',
  'book-covers',
  true,  -- Public bucket para portadas
  5242880,  -- 5MB limit per file
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ]
);

-- ============================================
-- 2. ACCESS POLICIES
-- ============================================

-- Lectura pública de portadas
CREATE POLICY "book_covers_select_policy"
ON storage.objects
FOR SELECT
USING (bucket_id = 'book-covers');

-- Usuarios autenticados pueden subir portadas
CREATE POLICY "book_covers_insert_policy"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'book-covers');

-- Usuarios autenticados pueden actualizar portadas
CREATE POLICY "book_covers_update_policy"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'book-covers')
WITH CHECK (bucket_id = 'book-covers');

-- Usuarios autenticados pueden eliminar portadas
CREATE POLICY "book_covers_delete_policy"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'book-covers');

SELECT 'STORAGE: Bucket book-covers creado' AS status;
