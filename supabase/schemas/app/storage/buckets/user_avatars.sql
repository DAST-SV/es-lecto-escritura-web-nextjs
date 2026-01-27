-- ============================================
-- Bucket: user-avatars
-- File: storage/buckets/user_avatars.sql
-- Description: User profile avatars
-- ============================================

-- ============================================
-- 1. CREATE BUCKET
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-avatars',
  'user-avatars',
  true,
  2097152, -- 2MB max file size
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- 2. RLS POLICIES
-- ============================================

-- Policy: Public read access
DROP POLICY IF EXISTS "user_avatars_select_policy" ON storage.objects;
CREATE POLICY "user_avatars_select_policy" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'user-avatars');

-- Policy: Users can upload their own avatar
DROP POLICY IF EXISTS "user_avatars_insert_policy" ON storage.objects;
CREATE POLICY "user_avatars_insert_policy" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can update their own avatar
DROP POLICY IF EXISTS "user_avatars_update_policy" ON storage.objects;
CREATE POLICY "user_avatars_update_policy" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'user-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can delete their own avatar
DROP POLICY IF EXISTS "user_avatars_delete_policy" ON storage.objects;
CREATE POLICY "user_avatars_delete_policy" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'user-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- 3. VERIFICATION
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Bucket user-avatars created successfully';
  RAISE NOTICE '   - Public: true';
  RAISE NOTICE '   - Max size: 2MB';
  RAISE NOTICE '   - Allowed: jpeg, png, webp';
END $$;
