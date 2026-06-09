-- Enum de roles
create type public.app_role as enum ('admin', 'user');

-- Tabla de roles (separada de cualquier perfil)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create policy "Los usuarios pueden ver sus propios roles"
  on public.user_roles
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Función security-definer para comprobar roles sin recursión
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- El primer usuario registrado se convierte en admin
create or replace function public.handle_first_user_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin');
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created_assign_admin
  after insert on auth.users
  for each row
  execute function public.handle_first_user_admin();

-- Reescribir políticas de escritura de galeria: solo admin
drop policy if exists "Usuarios autenticados pueden insertar en galeria" on public.galeria;
drop policy if exists "Usuarios autenticados pueden actualizar galeria" on public.galeria;
drop policy if exists "Usuarios autenticados pueden borrar galeria" on public.galeria;

create policy "Solo admin puede insertar en galeria"
  on public.galeria for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Solo admin puede actualizar galeria"
  on public.galeria for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Solo admin puede borrar galeria"
  on public.galeria for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Reescribir políticas de escritura de capas: solo admin
drop policy if exists "Usuarios autenticados pueden insertar en capas" on public.capas;
drop policy if exists "Usuarios autenticados pueden actualizar capas" on public.capas;
drop policy if exists "Usuarios autenticados pueden borrar capas" on public.capas;

create policy "Solo admin puede insertar en capas"
  on public.capas for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Solo admin puede actualizar capas"
  on public.capas for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Solo admin puede borrar capas"
  on public.capas for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Almacenamiento: solo admin escribe en el bucket de la galería
drop policy if exists "Authenticated can insert galeria_imagenes" on storage.objects;
drop policy if exists "Authenticated can update galeria_imagenes" on storage.objects;
drop policy if exists "Authenticated can delete galeria_imagenes" on storage.objects;

create policy "Solo admin sube a galeria_imagenes"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'galeria_imagenes' and public.has_role(auth.uid(), 'admin'));

create policy "Solo admin actualiza galeria_imagenes"
  on storage.objects for update to authenticated
  using (bucket_id = 'galeria_imagenes' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'galeria_imagenes' and public.has_role(auth.uid(), 'admin'));

create policy "Solo admin borra galeria_imagenes"
  on storage.objects for delete to authenticated
  using (bucket_id = 'galeria_imagenes' and public.has_role(auth.uid(), 'admin'));