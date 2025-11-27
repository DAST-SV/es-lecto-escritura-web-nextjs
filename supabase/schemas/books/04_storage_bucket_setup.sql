-- ======================================================
-- SISTEMA DE GESTIÓN DE LIBROS DIGITALES INTERACTIVOS
-- Archivo: 04_storage_bucket_setup.sql
-- Descripción: Configuración del bucket de almacenamiento
-- ======================================================

-- ======================================================
-- PASO 1: CREAR BUCKET
-- ======================================================

-- Crear bucket para imágenes de libros
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'book-images',
  'book-images',
  true, -- Público para que las imágenes sean accesibles
  5242880, -- 5MB en bytes
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
)
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE storage.buckets IS 'Buckets de almacenamiento para archivos';

-- ======================================================
-- PASO 2: POLÍTICAS DE ACCESO
-- ======================================================

-- Política: Usuarios autenticados pueden subir a sus propias carpetas
CREATE POLICY "Usuarios: subir imágenes propias"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'book-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Usuarios autenticados pueden actualizar sus propias imágenes
CREATE POLICY "Usuarios: actualizar imágenes propias"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'book-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'book-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Usuarios autenticados pueden eliminar sus propias imágenes
CREATE POLICY "Usuarios: eliminar imágenes propias"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'book-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Cualquiera puede leer imágenes (bucket público)
CREATE POLICY "Público: leer todas las imágenes"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'book-images');

-- Política: Service role tiene acceso total
CREATE POLICY "Service role: acceso total a book-images"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'book-images')
WITH CHECK (bucket_id = 'book-images');

-- ======================================================
-- PASO 3: INFORMACIÓN Y VALIDACIÓN
-- ======================================================

-- Verificar que el bucket se creó correctamente
DO $$
DECLARE
  bucket_count INTEGER;
  policy_count INTEGER;
BEGIN
  -- Contar buckets
  SELECT COUNT(*) INTO bucket_count
  FROM storage.buckets
  WHERE id = 'book-images';
  
  -- Contar políticas
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%book-images%';
  
  -- Mostrar resultados
  RAISE NOTICE '✅ Configuración del bucket completada';
  RAISE NOTICE '📦 Buckets creados: %', bucket_count;
  RAISE NOTICE '🔒 Políticas creadas: %', policy_count;
  RAISE NOTICE '';
  RAISE NOTICE '📋 Estructura de carpetas:';
  RAISE NOTICE '   book-images/';
  RAISE NOTICE '     {userId}/';
  RAISE NOTICE '       {bookId}/';
  RAISE NOTICE '         covers/       - Portadas y fondos de ficha';
  RAISE NOTICE '         pages/        - Imágenes de contenido';
  RAISE NOTICE '         backgrounds/  - Fondos de página';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Permisos:';
  RAISE NOTICE '   - Usuarios autenticados: CRUD en sus carpetas';
  RAISE NOTICE '   - Público: Solo lectura';
  RAISE NOTICE '   - Service role: Acceso total';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Límites:';
  RAISE NOTICE '   - Tamaño máximo por archivo: 5MB';
  RAISE NOTICE '   - Tipos permitidos: JPEG, PNG, GIF, WebP';
END $$;

-- ======================================================
-- PASO 4: CONSULTAS ÚTILES
-- ======================================================

-- Ver información del bucket
-- SELECT * FROM storage.buckets WHERE id = 'book-images';

-- Ver políticas del bucket
-- SELECT * FROM pg_policies 
-- WHERE schemaname = 'storage' 
-- AND tablename = 'objects' 
-- AND policyname LIKE '%book-images%';

-- Ver archivos en el bucket (requiere service_role)
-- SELECT * FROM storage.objects 
-- WHERE bucket_id = 'book-images' 
-- ORDER BY created_at DESC 
-- LIMIT 10;