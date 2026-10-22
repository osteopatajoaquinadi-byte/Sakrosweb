-- Sakros Go: suscripción mensual.
-- Cada cobro aprobado de Mercado Pago (o un acceso que da el coach) deja el
-- acceso activo hasta "hasta". El mes corre igual aunque la persona no
-- complete sus entrenamientos. Sin acceso activo, el cliente solo puede
-- registrar la semana 1 (prueba gratis).

create table if not exists go_accesos (
  atleta text primary key,
  hasta timestamptz,
  origen text check (origen in ('mercadopago', 'coach')),
  mp_preapproval_id text,
  mp_estado text,
  precio int,
  nota text,
  updated_at timestamptz not null default now()
);
alter table go_accesos enable row level security;
revoke all on go_accesos from anon;

create policy go_accesos_coach on go_accesos
  for all to authenticated
  using ((select go_es_coach())) with check ((select go_es_coach()));
create policy go_accesos_cliente_leer on go_accesos
  for select to authenticated
  using (atleta = (select go_mi_atleta()));

create or replace function go_acceso_activo() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from go_accesos a
    where a.atleta = (select atleta from go_miembros where user_id = auth.uid() and rol = 'cliente')
      and a.hasta > now()
  );
$$;
revoke all on function go_acceso_activo() from public, anon;
grant execute on function go_acceso_activo() to authenticated;

-- Sin acceso activo, el cliente puede escribir su perfil, tests y chat, pero
-- registros y sesiones solo de la semana 1.
create or replace function go_puede_escribir(p text, d jsonb) returns boolean
language sql stable security definer set search_path = public as $$
  select (select go_acceso_activo())
    or p !~ '/(registro|sesiones|ajustes)$'
    or (case when d ->> 'semana' ~ '^[0-9]+$' then (d ->> 'semana')::int else 1 end) <= 1;
$$;
revoke all on function go_puede_escribir(text, jsonb) from public, anon;
grant execute on function go_puede_escribir(text, jsonb) to authenticated;

alter policy go_docs_cliente_insertar on go_docs
  with check (atleta = (select go_mi_atleta()) and go_puede_escribir(path, data));
alter policy go_docs_cliente_editar on go_docs
  using (atleta = (select go_mi_atleta()))
  with check (atleta = (select go_mi_atleta()) and go_puede_escribir(path, data));
