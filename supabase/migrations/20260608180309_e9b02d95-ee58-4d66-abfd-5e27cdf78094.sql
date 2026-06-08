-- Lectura pública de objetos del bucket galeria_imagenes (permite generar URLs firmadas)
CREATE POLICY "galeria_imagenes lectura publica"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'galeria_imagenes');

-- Subida solo para usuarios autenticados
CREATE POLICY "galeria_imagenes subir autenticado"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'galeria_imagenes');

-- Actualizar solo para usuarios autenticados
CREATE POLICY "galeria_imagenes actualizar autenticado"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'galeria_imagenes')
  WITH CHECK (bucket_id = 'galeria_imagenes');

-- Borrar solo para usuarios autenticados
CREATE POLICY "galeria_imagenes borrar autenticado"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'galeria_imagenes');