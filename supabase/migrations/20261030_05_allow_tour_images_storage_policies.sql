-- =========================================================================
-- SOLUCIÓN: HABILITAR PERMISOS DE SUBIDA Y LECTURA EN BUCKET 'tour-images'
-- =========================================================================
-- Resuelve el error: "new row violates row-level security policy for table objects"
-- Permite que los recorridos 360°, fotos de ambientes y planos puedan subirse
-- sin bloqueos de RLS desde el navegador al bucket público 'tour-images'.
-- =========================================================================

-- 1. Asegurar que el bucket tour-images exista y sea público
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tour-images',
  'tour-images',
  true,
  52428800, -- 50MB límite por imagen
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- 2. Limpiar políticas previas en storage.objects para tour-images
DROP POLICY IF EXISTS "tour_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "tour_images_public_insert" ON storage.objects;
DROP POLICY IF EXISTS "tour_images_public_update" ON storage.objects;
DROP POLICY IF EXISTS "tour_images_public_delete" ON storage.objects;
DROP POLICY IF EXISTS "Permitir subida en tour-images" ON storage.objects;
DROP POLICY IF EXISTS "Permitir lectura en tour-images" ON storage.objects;

-- 3. Política de lectura pública (Cualquier visitante puede ver las imágenes 360°)
CREATE POLICY "tour_images_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'tour-images');

-- 4. Política de inserción (Permite subir imágenes al bucket tour-images)
CREATE POLICY "tour_images_public_insert"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'tour-images');

-- 5. Política de actualización (Permite sobrescribir imágenes si se actualizan)
CREATE POLICY "tour_images_public_update"
  ON storage.objects FOR UPDATE
  TO public
  USING (bucket_id = 'tour-images');

-- 6. Política de eliminación (Permite borrar planos o fotos eliminadas)
CREATE POLICY "tour_images_public_delete"
  ON storage.objects FOR DELETE
  TO public
  USING (bucket_id = 'tour-images');

