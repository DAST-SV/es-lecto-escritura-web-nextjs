-- ============================================
-- Bucket: public-images
-- File: storage/buckets/public_images.sql
-- Description: Public images - SOLO LECTURA para todos
-- ============================================

-- 1. CREAR BUCKET
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'public-images',
  'public-images',
  true,
  5242880, -- 5MB max
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

-- 2. POLÍTICA: Solo lectura pública
DROP POLICY IF EXISTS "public_images_read_only" ON storage.objects;
CREATE POLICY "public_images_read_only" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'public-images');

-- ¡Eso es todo! Sin políticas de INSERT/UPDATE/DELETE
-- Tú subes las imágenes manualmente desde el dashboard de Supabase