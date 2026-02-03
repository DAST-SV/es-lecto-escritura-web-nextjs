-- supabase/schemas/books/storage/book_audio.sql
-- ============================================
-- STORAGE BUCKET: book-audio
-- Audio de libros (narración multi-idioma)
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
  'book-audio',
  'book-audio',
  false,  -- Private bucket - acceso controlado
  104857600,  -- 100MB limit per file
  ARRAY[
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/webm'
  ]
);

-- ============================================
-- 2. ACCESS POLICIES
-- ============================================

-- Usuarios autenticados pueden escuchar audio
CREATE POLICY "book_audio_select_policy"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'book-audio');

-- Usuarios autenticados pueden subir audio
CREATE POLICY "book_audio_insert_policy"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'book-audio');

-- Usuarios autenticados pueden actualizar audio
CREATE POLICY "book_audio_update_policy"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'book-audio')
WITH CHECK (bucket_id = 'book-audio');

-- Usuarios autenticados pueden eliminar audio
CREATE POLICY "book_audio_delete_policy"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'book-audio');

-- ============================================
-- ESTRUCTURA DE CARPETAS RECOMENDADA
-- ============================================
/*
book-audio/
├── {book_id}/
│   ├── es/
│   │   ├── page_1.mp3
│   │   ├── page_2.mp3
│   │   └── full_book.mp3
│   ├── en/
│   │   ├── page_1.mp3
│   │   └── ...
│   └── fr/
│       └── ...
*/

SELECT 'STORAGE: Bucket book-audio creado' AS status;
