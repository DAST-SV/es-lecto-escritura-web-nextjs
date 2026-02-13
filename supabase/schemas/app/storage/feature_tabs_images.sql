-- supabase/schemas/app/storage/feature_tabs_images.sql
-- ============================================
-- Storage: Feature Tab Images
-- Description: Virtual folders in public-images for FeaturesSection tabs
-- ============================================

-- ============================================
-- 1. CREATE VIRTUAL FOLDERS
-- ============================================

INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES (
  'public-images',
  'tabs/difference/.keep',
  (SELECT id FROM auth.users LIMIT 1),
  '{"mimetype": "text/plain"}'::jsonb
)
ON CONFLICT DO NOTHING;

INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES (
  'public-images',
  'tabs/student/.keep',
  (SELECT id FROM auth.users LIMIT 1),
  '{"mimetype": "text/plain"}'::jsonb
)
ON CONFLICT DO NOTHING;

INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES (
  'public-images',
  'tabs/parent/.keep',
  (SELECT id FROM auth.users LIMIT 1),
  '{"mimetype": "text/plain"}'::jsonb
)
ON CONFLICT DO NOTHING;

INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES (
  'public-images',
  'tabs/teacher/.keep',
  (SELECT id FROM auth.users LIMIT 1),
  '{"mimetype": "text/plain"}'::jsonb
)
ON CONFLICT DO NOTHING;

INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES (
  'public-images',
  'tabs/pricing/.keep',
  (SELECT id FROM auth.users LIMIT 1),
  '{"mimetype": "text/plain"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. VERIFICATION
-- ============================================

SELECT name, created_at
FROM storage.objects
WHERE bucket_id = 'public-images'
  AND name LIKE 'tabs/%'
ORDER BY name;
