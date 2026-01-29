-- ============================================
-- SUPABASE STORAGE BUCKETS CONFIGURATION
-- Configuración de Buckets de Storage en Supabase
-- ============================================
-- This script:
-- 1. Deletes existing public-images bucket (if exists)
-- 2. Creates new public-images bucket with proper configuration
-- 3. Sets up access policies
-- 4. Creates the folder structure (English names, no redundancy)
-- ============================================

-- ============================================
-- 1. DELETE EXISTING BUCKET
-- Eliminar bucket existente
-- ============================================

-- Delete all objects in public-images bucket first
-- Primero eliminar todos los objetos del bucket public-images
DELETE FROM storage.objects WHERE bucket_id = 'public-images';

-- Delete the bucket
-- Eliminar el bucket
DELETE FROM storage.buckets WHERE id = 'public-images';

-- ============================================
-- 2. CREATE PUBLIC-IMAGES BUCKET
-- Crear bucket para imágenes públicas
-- ============================================

INSERT INTO storage.buckets (
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types
)
VALUES (
  'public-images',
  'public-images',
  true,  -- Public bucket
  10485760,  -- 10MB limit per file
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml'
  ]
);

-- ============================================
-- 3. ACCESS POLICIES FOR PUBLIC-IMAGES
-- Políticas de acceso para public-images
-- ============================================

-- Policy: Anyone can view public images (SELECT)
-- Política: Cualquiera puede ver las imágenes públicas
CREATE POLICY "public_images_select_policy"
ON storage.objects
FOR SELECT
USING (bucket_id = 'public-images');

-- Policy: Only authenticated users can upload images (INSERT)
-- Política: Solo usuarios autenticados pueden subir imágenes
CREATE POLICY "public_images_insert_policy"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'public-images');

-- Policy: Only authenticated users can update images (UPDATE)
-- Política: Solo usuarios autenticados pueden actualizar imágenes
CREATE POLICY "public_images_update_policy"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'public-images')
WITH CHECK (bucket_id = 'public-images');

-- Policy: Only authenticated users can delete images (DELETE)
-- Política: Solo usuarios autenticados pueden eliminar imágenes
CREATE POLICY "public_images_delete_policy"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'public-images');

-- ============================================
-- 4. CREATE FOLDER STRUCTURE
-- Crear estructura de carpetas
-- ============================================

-- Note: In Supabase Storage, folders are virtual and created by uploading files with paths
-- Nota: En Supabase Storage, las carpetas son virtuales y se crean al subir archivos con rutas
-- We create empty .keep files to establish the folder structure
-- Creamos archivos .keep vacíos para establecer la estructura de carpetas

-- Create dashboard folder
-- Crear carpeta dashboard
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES (
  'public-images',
  'dashboard/.keep',
  (SELECT id FROM auth.users LIMIT 1),
  '{"mimetype": "text/plain"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Create stories folder
-- Crear carpeta stories
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES (
  'public-images',
  'stories/.keep',
  (SELECT id FROM auth.users LIMIT 1),
  '{"mimetype": "text/plain"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Create poems folder
-- Crear carpeta poems
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES (
  'public-images',
  'poems/.keep',
  (SELECT id FROM auth.users LIMIT 1),
  '{"mimetype": "text/plain"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Create tongue-twisters folder
-- Crear carpeta tongue-twisters
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES (
  'public-images',
  'tongue-twisters/.keep',
  (SELECT id FROM auth.users LIMIT 1),
  '{"mimetype": "text/plain"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Create fables folder
-- Crear carpeta fables
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES (
  'public-images',
  'fables/.keep',
  (SELECT id FROM auth.users LIMIT 1),
  '{"mimetype": "text/plain"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Create comics folder
-- Crear carpeta comics
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES (
  'public-images',
  'comics/.keep',
  (SELECT id FROM auth.users LIMIT 1),
  '{"mimetype": "text/plain"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Create legends folder
-- Crear carpeta legends
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES (
  'public-images',
  'legends/.keep',
  (SELECT id FROM auth.users LIMIT 1),
  '{"mimetype": "text/plain"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Create rhymes folder
-- Crear carpeta rhymes
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES (
  'public-images',
  'rhymes/.keep',
  (SELECT id FROM auth.users LIMIT 1),
  '{"mimetype": "text/plain"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Create literacy folder
-- Crear carpeta literacy
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES (
  'public-images',
  'literacy/.keep',
  (SELECT id FROM auth.users LIMIT 1),
  '{"mimetype": "text/plain"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Create placeholders folder
-- Crear carpeta placeholders
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES (
  'public-images',
  'placeholders/.keep',
  (SELECT id FROM auth.users LIMIT 1),
  '{"mimetype": "text/plain"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. VERIFICATION QUERIES
-- Consultas de verificación
-- ============================================

-- View all created buckets
-- Ver todos los buckets creados
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
ORDER BY created_at DESC;

-- View folder structure in public-images
-- Ver estructura de carpetas en public-images
SELECT 
  name,
  created_at
FROM storage.objects
WHERE bucket_id = 'public-images'
  AND name LIKE '%.keep'
ORDER BY name;

-- View all policies for storage.objects
-- Ver todas las políticas para storage.objects
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%public_images%'
ORDER BY cmd;

-- Count folders created
-- Contar carpetas creadas
SELECT 
  COUNT(*) as total_folders,
  'Folders created successfully' as status
FROM storage.objects
WHERE bucket_id = 'public-images'
  AND name LIKE '%.keep';

-- ============================================
-- FINAL STRUCTURE
-- Estructura final
-- ============================================

/*
Expected folder structure:
Estructura de carpetas esperada:

public-images/
├── dashboard/          ← riddlesV1, riddlesV2, backgroundV1
├── stories/            ← v1, v2
├── poems/              ← v1, v2
├── tongue-twisters/    ← v1, v2
├── fables/             ← v1
├── comics/             ← v1
├── legends/            ← v1
├── rhymes/             ← v1
├── literacy/           ← v1
└── placeholders/       ← book.webp, avatar.webp

Total folders: 10
Total carpetas: 10
*/

-- ============================================
-- NEXT STEPS
-- Próximos pasos
-- ============================================

/*
1. Upload images to their respective folders
   Subir imágenes a sus respectivas carpetas

2. Required images (16 total):
   Imágenes requeridas (16 en total):
   
   📁 dashboard/ (3 images)
   - 35d1669e562decf73035b54a0aa5a104d1a6c2c2cee4e704c992cdf8a86427fc.webp
   - 2286cc1e0edf819ce4256e498dec352e8b6fc05f32263d41104dacaaa3737991.webp
   - a076a7e2c35970e29ff54ba0759f8ae275ffd8fda1fa6a500879f473aef9896b.webp
   
   📁 stories/ (2 images)
   - f6fc6f1376e16f01a5c0b713a78a83964301e575238444e395cad7f7f1fe8b03.webp
   - fe5be596ef78279cf4a2b738c9f96c2b879a635b66a4ccf54e65d41ab31b1b67.webp
   
   📁 poems/ (2 images)
   - bddc57c5182caeca5e41c22e495c42415a1dd669bf69a45edd0ee63bf1b65c47.webp
   - 3b0e0d6c60b06ed3d2e0d142f52476920c53d29721cc430c7d9a6be1a76be5ad.webp
   
   📁 tongue-twisters/ (2 images)
   - f707ecd7d109d1f3bd931e31c1edbd28ea019c445f73d860f536bbb99b9b3c39.webp
   - 7e078a9edc6c04ebd981318790088d3e630a32adbc7867ad4fbde28257f61415.webp
   
   📁 fables/ (1 image)
   - 30df9a0ed349680e986156d21bd9af865758d0e2651010071b137e4cbbd1d372.webp
   
   📁 comics/ (1 image)
   - 95068469bf257cf15b4f94e7cc87f75f28d5fdc4dd1519de50e74d79972058b3.webp
   
   📁 legends/ (1 image)
   - c66d1de2c1220876dd325b71100c150f00af5ff7aed20e428201d3960a6a36db.webp
   
   📁 rhymes/ (1 image)
   - 25595838e1a75687bee294ea26bcb40d320c5a822be0fe460a04f3e91cd0afaa.webp
   
   📁 literacy/ (1 image)
   - 6ec1cacc28b2f6e869123d93a0cdb67bae367231608d5c14e782357b9d51e616.webp
   
   📁 placeholders/ (2 images)
   - book.webp
   - avatar.webp

3. Verify all images are accessible
   Verificar que todas las imágenes sean accesibles
   
4. Test the image URLs in your application
   Probar las URLs de las imágenes en tu aplicación
*/