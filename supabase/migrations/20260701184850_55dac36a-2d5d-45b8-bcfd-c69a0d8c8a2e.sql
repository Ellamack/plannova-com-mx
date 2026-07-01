-- Switch has_role to SECURITY INVOKER: it only checks the caller's own role
-- (has_role(auth.uid(), ...)), which the user_roles SELECT policy already allows,
-- so no elevated privileges are needed and no RLS recursion occurs.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Restore EXECUTE for authenticated (required for RLS policies that reference it).
-- Intentionally NOT granted to anon/public.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;