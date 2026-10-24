-- Sakros Go: evaluación FMS por video.
-- La app extrae cuadros (JPEG) de cada video en el teléfono y los guarda en
-- el bucket privado go-fms, en la carpeta del atleta. El Coach analiza esos
-- cuadros en el servidor (/api/go/fms), con su propio límite diario.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('go-fms', 'go-fms', false, 1048576, array['image/jpeg'])
on conflict (id) do update set public = false, file_size_limit = 1048576, allowed_mime_types = array['image/jpeg'];

-- Cada cliente ve y sube solo lo de su carpeta ({atleta}/...); el coach, todo.
create policy go_fms_leer on storage.objects for select to authenticated
  using (bucket_id = 'go-fms' and ((storage.foldername(name))[1] = (select public.go_mi_atleta()) or (select public.go_es_coach())));
create policy go_fms_subir on storage.objects for insert to authenticated
  with check (bucket_id = 'go-fms' and ((storage.foldername(name))[1] = (select public.go_mi_atleta()) or (select public.go_es_coach())));
create policy go_fms_editar on storage.objects for update to authenticated
  using (bucket_id = 'go-fms' and ((storage.foldername(name))[1] = (select public.go_mi_atleta()) or (select public.go_es_coach())));
create policy go_fms_borrar on storage.objects for delete to authenticated
  using (bucket_id = 'go-fms' and ((storage.foldername(name))[1] = (select public.go_mi_atleta()) or (select public.go_es_coach())));

-- Límite diario de análisis de video (aparte de los mensajes al Coach).
create table if not exists go_uso_fms (
  user_id uuid not null,
  dia date not null,
  n int not null default 0,
  primary key (user_id, dia)
);
alter table go_uso_fms enable row level security;
revoke all on go_uso_fms from anon, authenticated;

create or replace function go_usar_fms(p_user uuid, p_max int) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  total int;
begin
  insert into go_uso_fms (user_id, dia, n) values (p_user, (now() at time zone 'America/Santiago')::date, 1)
  on conflict (user_id, dia) do update set n = go_uso_fms.n + 1
  returning n into total;
  return total <= p_max;
end;
$$;
revoke all on function go_usar_fms(uuid, int) from public, anon, authenticated;
