-- Sakros Go: app de entrenamiento en /go.
--
-- Los datos se guardan como documentos (ruta + id + JSON), igual que en la
-- versión anterior de la app, para no reescribir su lógica:
--   atletas/{id}                 perfil de cada atleta
--   registro|sesiones|ajustes|chat|tests|perfil/{id}   datos del entrenador ("Mi perfil")
--   a/{atleta}/registro|...      datos de cada atleta
--   config/protocolo             protocolo de medición (común)
--
-- Acceso (RLS):
--   coach   → todo (los correos de go_coaches)
--   cliente → solo los documentos de su atleta y la configuración común
-- El vínculo usuario ↔ atleta lo crea go_vincular() en el primer ingreso.

create table if not exists go_coaches (
  email text primary key
);
alter table go_coaches enable row level security;
revoke all on go_coaches from anon, authenticated;

insert into go_coaches (email) values ('osteopatajoaquinadi@gmail.com')
on conflict do nothing;

create table if not exists go_miembros (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  rol text not null check (rol in ('coach', 'cliente')),
  atleta text,
  created_at timestamptz not null default now()
);
alter table go_miembros enable row level security;
revoke all on go_miembros from anon;
create policy go_miembros_propio on go_miembros
  for select to authenticated using (user_id = (select auth.uid()));

create table if not exists go_docs (
  path text not null,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  atleta text generated always as (
    case
      when path = 'atletas' then id
      when path like 'a/%' then split_part(path, '/', 2)
    end
  ) stored,
  updated_at timestamptz not null default now(),
  primary key (path, id)
);
create index if not exists go_docs_atleta_idx on go_docs (atleta);
alter table go_docs enable row level security;
revoke all on go_docs from anon;

create or replace function go_es_coach() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from go_miembros where user_id = auth.uid() and rol = 'coach');
$$;

create or replace function go_mi_atleta() returns text
language sql stable security definer set search_path = public as $$
  select atleta from go_miembros where user_id = auth.uid() and rol = 'cliente';
$$;

revoke all on function go_es_coach() from public, anon;
revoke all on function go_mi_atleta() from public, anon;
grant execute on function go_es_coach() to authenticated;
grant execute on function go_mi_atleta() to authenticated;

create policy go_docs_coach on go_docs
  for all to authenticated
  using ((select go_es_coach())) with check ((select go_es_coach()));

create policy go_docs_cliente_leer on go_docs
  for select to authenticated
  using (atleta = (select go_mi_atleta()) or path = 'config');

create policy go_docs_cliente_insertar on go_docs
  for insert to authenticated
  with check (atleta = (select go_mi_atleta()));

create policy go_docs_cliente_editar on go_docs
  for update to authenticated
  using (atleta = (select go_mi_atleta())) with check (atleta = (select go_mi_atleta()));

create policy go_docs_cliente_borrar on go_docs
  for delete to authenticated
  using (atleta = (select go_mi_atleta()));

-- Vincula al usuario con su rol y su atleta. Orden:
-- 1) ya vinculado → lo devuelve; 2) correo de coach → coach;
-- 3) un atleta con ese correo en su perfil → ese atleta;
-- 4) si no, crea un atleta nuevo (cliente que llega solo).
create or replace function go_vincular() returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  em text;
  m go_miembros;
  aid text;
begin
  if uid is null then
    raise exception 'Sin sesión';
  end if;
  select lower(email) into em from auth.users where id = uid;

  select * into m from go_miembros where user_id = uid;
  if found then
    return jsonb_build_object('rol', m.rol, 'atleta', m.atleta, 'email', m.email);
  end if;

  if exists (select 1 from go_coaches where lower(email) = em) then
    insert into go_miembros (user_id, email, rol) values (uid, em, 'coach');
    return jsonb_build_object('rol', 'coach', 'atleta', null, 'email', em);
  end if;

  select d.id into aid from go_docs d
  where d.path = 'atletas' and lower(d.data ->> 'email') = em
    and not exists (select 1 from go_miembros x where x.atleta = d.id)
  limit 1;

  if aid is null then
    aid := 'u' || substr(replace(uid::text, '-', ''), 1, 10);
    insert into go_docs (path, id, data)
    values ('atletas', aid, jsonb_build_object('email', em, 't', (extract(epoch from now()) * 1000)::bigint))
    on conflict do nothing;
  end if;

  insert into go_miembros (user_id, email, rol, atleta) values (uid, em, 'cliente', aid);
  return jsonb_build_object('rol', 'cliente', 'atleta', aid, 'email', em);
end;
$$;
revoke all on function go_vincular() from public, anon;
grant execute on function go_vincular() to authenticated;

-- Límite diario de mensajes al Coach (lo usa solo el servidor).
create table if not exists go_uso (
  user_id uuid not null,
  dia date not null,
  n int not null default 0,
  primary key (user_id, dia)
);
alter table go_uso enable row level security;
revoke all on go_uso from anon, authenticated;

create or replace function go_usar(p_user uuid, p_max int) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  total int;
begin
  insert into go_uso (user_id, dia, n) values (p_user, (now() at time zone 'America/Santiago')::date, 1)
  on conflict (user_id, dia) do update set n = go_uso.n + 1
  returning n into total;
  return total <= p_max;
end;
$$;
revoke all on function go_usar(uuid, int) from public, anon, authenticated;

-- Tiempo real: la app escucha los cambios de go_docs.
alter publication supabase_realtime add table go_docs;
