-- Sakros Go: análisis de técnica por video, máximo por semana (lunes a domingo, hora de Chile).
-- La evaluación de movimiento (FMS) no cuenta aquí: sigue con su límite diario (go_uso_fms).
create table if not exists go_uso_tecnica (
  user_id uuid not null,
  semana date not null,
  n int not null default 0,
  primary key (user_id, semana)
);
alter table go_uso_tecnica enable row level security;
revoke all on go_uso_tecnica from anon, authenticated;

-- Lunes de la semana actual en Chile.
create or replace function go_semana_actual() returns date
language sql stable as $$
  select date_trunc('week', (now() at time zone 'America/Santiago'))::date;
$$;

-- Suma un análisis si queda cupo. Devuelve cuántos lleva esta semana, o -1 si ya no queda.
create or replace function go_usar_tecnica(p_user uuid, p_max int) returns int
language plpgsql security definer set search_path = public as $$
declare
  total int;
begin
  insert into go_uso_tecnica (user_id, semana, n) values (p_user, go_semana_actual(), 1)
  on conflict (user_id, semana) do update set n = go_uso_tecnica.n + 1
  returning n into total;
  if total > p_max then
    update go_uso_tecnica set n = n - 1 where user_id = p_user and semana = go_semana_actual();
    return -1;
  end if;
  return total;
end;
$$;

-- Devuelve un análisis cuando el Coach no pudo responder (no se cobra un intento fallido).
create or replace function go_devolver_tecnica(p_user uuid) returns void
language sql security definer set search_path = public as $$
  update go_uso_tecnica set n = greatest(n - 1, 0) where user_id = p_user and semana = go_semana_actual();
$$;

create or replace function go_tecnica_usadas(p_user uuid) returns int
language sql stable security definer set search_path = public as $$
  select coalesce((select n from go_uso_tecnica where user_id = p_user and semana = go_semana_actual()), 0);
$$;

revoke all on function go_usar_tecnica(uuid, int) from public, anon, authenticated;
revoke all on function go_devolver_tecnica(uuid) from public, anon, authenticated;
revoke all on function go_tecnica_usadas(uuid) from public, anon, authenticated;
