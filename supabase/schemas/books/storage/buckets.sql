-- ======================================================
-- CONFIGURACIÓN DE STORAGE BUCKETS
-- Archivo: storage/buckets.sql
-- ======================================================

-- Asegurar que el esquema de storage existe
CREATE SCHEMA IF NOT EXISTS storage;

-- ======================================================
-- CREAR BUCKETS
-- ======================================================

-- Crear bucket 'book-images'
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('book-images', 'book-images', true)
    ON CONFLICT (id) DO NOTHING;
EXCEPTION WHEN OTHERS THEN
    PERFORM storage.create_bucket('book-images');
    UPDATE storage.buckets SET public = true WHERE id = 'book-images';
END $$;

-- Configurar límites para imágenes
UPDATE storage.buckets
SET file_size_limit = 5242880, -- 5MB
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
WHERE id = 'book-images';

-- Crear bucket 'book-pdfs'
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('book-pdfs', 'book-pdfs', true)
    ON CONFLICT (id) DO NOTHING;
EXCEPTION WHEN OTHERS THEN
    PERFORM storage.create_bucket('book-pdfs');
    UPDATE storage.buckets SET public = true WHERE id = 'book-pdfs';
END $$;

-- Configurar límites para PDFs
UPDATE storage.buckets
SET file_size_limit = 52428800, -- 50MB
    allowed_mime_types = ARRAY['application/pdf']
WHERE id = 'book-pdfs';

-- ======================================================
-- POLÍTICAS DE ACCESO A STORAGE
-- ======================================================

-- Limpiar políticas antiguas
DROP POLICY IF EXISTS "Usuarios: subir imágenes propias" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios: actualizar imágenes propias" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios: eliminar imágenes propias" ON storage.objects;
DROP POLICY IF EXISTS "Público: leer todas las imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios: subir PDFs propios" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios: actualizar PDFs propios" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios: eliminar PDFs propios" ON storage.objects;
DROP POLICY IF EXISTS "Público: leer todos los PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Acceso total: service role" ON storage.objects;

-- Políticas para imágenes
CREATE POLICY "Usuarios: subir imágenes propias" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'book-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Usuarios: actualizar imágenes propias" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'book-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Usuarios: eliminar imágenes propias" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'book-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Público: leer todas las imágenes" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'book-images');

-- Políticas para PDFs
CREATE POLICY "Usuarios: subir PDFs propios" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'book-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Usuarios: actualizar PDFs propios" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'book-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Usuarios: eliminar PDFs propios" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'book-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Público: leer todos los PDFs" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'book-pdfs');

-- Política global para service role
CREATE POLICY "Acceso total: service role" ON storage.objects
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ======================================================
-- VERIFICACIÓN
-- ======================================================
DO $$
BEGIN
    RAISE NOTICE '✅ CONFIGURACIÓN DE STORAGE COMPLETADA';
    RAISE NOTICE '📦 Buckets creados: book-images, book-pdfs';
    RAISE NOTICE '🔒 Políticas de seguridad aplicadas por UID del usuario';
END $$;
