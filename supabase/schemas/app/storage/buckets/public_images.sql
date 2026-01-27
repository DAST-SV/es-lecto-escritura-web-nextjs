-- ============================================
-- Bucket: public-images
-- File: storage/buckets/public_images.sql
-- Description: Public images for site assets (dashboard, categories, etc.)
-- ============================================

-- ============================================
-- 1. CREATE BUCKET
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'public-images',
  'public-images',
  true,
  5242880, -- 5MB max file size
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- 2. RLS POLICIES
-- ============================================

-- Policy: Public read access (anyone can view)
DROP POLICY IF EXISTS "public_images_select_policy" ON storage.objects;
CREATE POLICY "public_images_select_policy" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'public-images');

-- Policy: Only admins can upload
DROP POLICY IF EXISTS "public_images_insert_policy" ON storage.objects;
CREATE POLICY "public_images_insert_policy" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'public-images'
    AND EXISTS (
      SELECT 1 FROM app.user_roles ur
      JOIN app.roles r ON r.name = ur.role_name
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('super_admin', 'admin')
    )
  );

-- Policy: Only admins can update
DROP POLICY IF EXISTS "public_images_update_policy" ON storage.objects;
CREATE POLICY "public_images_update_policy" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'public-images'
    AND EXISTS (
      SELECT 1 FROM app.user_roles ur
      JOIN app.roles r ON r.name = ur.role_name
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('super_admin', 'admin')
    )
  );

-- Policy: Only admins can delete
DROP POLICY IF EXISTS "public_images_delete_policy" ON storage.objects;
CREATE POLICY "public_images_delete_policy" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'public-images'
    AND EXISTS (
      SELECT 1 FROM app.user_roles ur
      JOIN app.roles r ON r.name = ur.role_name
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('super_admin', 'admin')
    )
  );

-- ============================================
-- 3. VERIFICATION
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Bucket public-images created successfully';
  RAISE NOTICE '   - Public: true';
  RAISE NOTICE '   - Max size: 5MB';
  RAISE NOTICE '   - Allowed: jpeg, png, webp, gif, svg';
END $$;
