-- supabase/schemas/books/storage/user_avatars.sql
-- ============================================
-- STORAGE BUCKET: user-avatars
-- Avatares de usuarios
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
  'user-avatars',
  'user-avatars',
  true,  -- Public bucket para avatares
  2097152,  -- 2MB limit per file
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
);

-- ============================================
-- 2. ACCESS POLICIES
-- ============================================

-- Lectura pública de avatares
CREATE POLICY "user_avatars_select_policy"
ON storage.objects
FOR SELECT
USING (bucket_id = 'user-avatars');

-- Usuarios pueden subir su avatar
CREATE POLICY "user_avatars_insert_policy"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Usuarios pueden actualizar su avatar
CREATE POLICY "user_avatars_update_policy"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'user-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Usuarios pueden eliminar su avatar
CREATE POLICY "user_avatars_delete_policy"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- ESTRUCTURA DE CARPETAS RECOMENDADA
-- ============================================
/*
user-avatars/
├── {user_id}/
│   └── avatar.webp
*/

SELECT 'STORAGE: Bucket user-avatars creado' AS status;
