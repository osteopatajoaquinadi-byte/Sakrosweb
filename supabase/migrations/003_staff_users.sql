-- Usuarios del panel del equipo, con PIN individual (guardado como hash
-- bcrypt) y rol:
--   admin       → todo (Joaquín, Anikken)
--   profesional → calendario, agendar y fichas clínicas (Camilo, Edison)
--   secretaria  → calendario, agendar, datos de contacto y pagos (sin
--                 información clínica)
-- La tabla no tiene políticas RLS: solo el servidor (service role) la lee,
-- a través de las funciones de abajo.

create table if not exists staff_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  display_name text not null,
  role text not null check (role in ('admin', 'profesional', 'secretaria')),
  professional_slug text,
  pin_hash text not null,
  active boolean not null default true,
  failed_attempts int not null default 0,
  locked_until timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table staff_users enable row level security;
revoke all on staff_users from anon, authenticated;

-- Verifica usuario + PIN. Tras 5 intentos fallidos bloquea 15 minutos.
create or replace function staff_login(p_username text, p_pin text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  u staff_users;
begin
  select * into u from staff_users
  where username = lower(trim(p_username)) and active;

  if not found then
    return null;
  end if;

  if u.locked_until is not null and u.locked_until > now() then
    return jsonb_build_object('locked', true);
  end if;

  if crypt(p_pin, u.pin_hash) = u.pin_hash then
    update staff_users set failed_attempts = 0, locked_until = null where id = u.id;
    return jsonb_build_object(
      'username', u.username,
      'display_name', u.display_name,
      'role', u.role,
      'professional_slug', u.professional_slug
    );
  end if;

  update staff_users
  set failed_attempts = case when failed_attempts + 1 >= 5 then 0 else failed_attempts + 1 end,
      locked_until = case when failed_attempts + 1 >= 5 then now() + interval '15 minutes' else locked_until end
  where id = u.id;
  return null;
end;
$$;

-- Cambio de PIN por el propio usuario (requiere el PIN actual).
create or replace function staff_change_pin(p_username text, p_current text, p_new text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  u staff_users;
begin
  if p_new !~ '^[0-9]{6,8}$' then
    return false;
  end if;
  select * into u from staff_users where username = lower(trim(p_username)) and active;
  if not found or crypt(p_current, u.pin_hash) <> u.pin_hash then
    return false;
  end if;
  update staff_users
  set pin_hash = crypt(p_new, gen_salt('bf')), updated_at = now()
  where id = u.id;
  return true;
end;
$$;

revoke all on function staff_login(text, text) from public, anon, authenticated;
revoke all on function staff_change_pin(text, text, text) from public, anon, authenticated;
grant execute on function staff_login(text, text) to service_role;
grant execute on function staff_change_pin(text, text, text) to service_role;
