-- Public read access to capas_archivos bucket
CREATE POLICY "Capas archivos lectura publica"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'capas_archivos');

-- Only admin can upload
CREATE POLICY "Solo admin sube capas archivos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'capas_archivos' AND public.has_role(auth.uid(), 'admin'));

-- Only admin can update
CREATE POLICY "Solo admin actualiza capas archivos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'capas_archivos' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'capas_archivos' AND public.has_role(auth.uid(), 'admin'));

-- Only admin can delete
CREATE POLICY "Solo admin borra capas archivos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'capas_archivos' AND public.has_role(auth.uid(), 'admin'));