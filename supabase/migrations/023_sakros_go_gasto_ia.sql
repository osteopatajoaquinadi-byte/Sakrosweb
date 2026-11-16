-- Sakros Go: gasto en IA (Coach, análisis de técnica y evaluación) por usuario y mes, en dólares.
-- Sirve para el tope mensual por usuario, el tope total de la app y el aviso al 80 %.
create table if not exists go_gasto (
  user_id uuid not null,
  mes date not null,
  usd numeric(12, 6) not null default 0,
  primary key (user_id, mes)
);
alter table go_gasto enable row level security;
revoke all on go_gasto from anon, authenticated;

-- Avisos ya enviados (uno por mes y umbral), para no repetir el correo.
create table if not exists go_gasto_avisos (
  mes date not null,
  umbral int not null,
  enviado timestamptz not null default now(),
  primary key (mes, umbral)
);
alter table go_gasto_avisos enable row level security;
revoke all on go_gasto_avisos from anon, authenticated;

create or replace function go_mes_actual() returns date
language sql stable as $$
  select date_trunc('month', (now() at time zone 'America/Santiago'))::date;
$$;

-- Suma un gasto y devuelve el total del mes de ese usuario y el de toda la app.
create or replace function go_sumar_gasto(p_user uuid, p_usd numeric)
returns table (usuario numeric, total numeric)
language plpgsql security definer set search_path = public as $$
begin
  insert into go_gasto (user_id, mes, usd) values (p_user, go_mes_actual(), greatest(p_usd, 0))
  on conflict (user_id, mes) do update set usd = go_gasto.usd + greatest(p_usd, 0);
  return query select
    (select g.usd from go_gasto g where g.user_id = p_user and g.mes = go_mes_actual()),
    (select coalesce(sum(g.usd), 0) from go_gasto g where g.mes = go_mes_actual());
end;
$$;

create or replace function go_gasto_actual(p_user uuid)
returns table (usuario numeric, total numeric)
language sql stable security definer set search_path = public as $$
  select
    coalesce((select g.usd from go_gasto g where g.user_id = p_user and g.mes = go_mes_actual()), 0),
    (select coalesce(sum(g.usd), 0) from go_gasto g where g.mes = go_mes_actual());
$$;

-- Marca un aviso como enviado; devuelve true solo la primera vez en el mes.
create or replace function go_marcar_aviso_gasto(p_umbral int) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  insert into go_gasto_avisos (mes, umbral) values (go_mes_actual(), p_umbral);
  return true;
exception when unique_violation then
  return false;
end;
$$;

revoke all on function go_sumar_gasto(uuid, numeric) from public, anon, authenticated;
revoke all on function go_gasto_actual(uuid) from public, anon, authenticated;
revoke all on function go_marcar_aviso_gasto(int) from public, anon, authenticated;
