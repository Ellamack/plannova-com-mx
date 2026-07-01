-- 1) Remove overly permissive storage policies on the gallery bucket.
--    These allowed ANY authenticated user to upload/update/delete, overriding
--    the admin-only intent (PERMISSIVE policies combine with OR).
DROP POLICY IF EXISTS "galeria_imagenes subir autenticado" ON storage.objects;
DROP POLICY IF EXISTS "galeria_imagenes actualizar autenticado" ON storage.objects;
DROP POLICY IF EXISTS "galeria_imagenes borrar autenticado" ON storage.objects;

-- 2) Restrict direct EXECUTE on SECURITY DEFINER functions so they are not
--    callable through the Data API by anonymous or signed-in users.
--    has_role remains usable inside RLS policies; handle_first_user_admin
--    remains usable as an auth trigger.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_first_user_admin() FROM anon, authenticated, public;