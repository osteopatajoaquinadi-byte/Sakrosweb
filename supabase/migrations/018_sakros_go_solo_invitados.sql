-- Sakros Go en construcción: solo entran las personas que autoriza el coach.
-- Un correo está autorizado si es de un coach, si ya tiene cuenta vinculada,
-- o si el coach lo escribió en el perfil de un cliente («Correo del cliente»).

create or replace function go_email_autorizado(p_email text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from go_coaches where lower(email) = lower(trim(p_email)))
      or exists (select 1 from go_miembros where lower(email) = lower(trim(p_email)))
      or exists (select 1 from go_docs where path = 'atletas' and lower(data ->> 'email') = lower(trim(p_email)));
$$;
revoke all on function go_email_autorizado(text) from public, anon, authenticated;

-- Igual que antes, pero ya no crea un perfil nuevo para correos sin invitación.
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
    raise exception 'no_autorizado';
  end if;

  insert into go_miembros (user_id, email, rol, atleta) values (uid, em, 'cliente', aid);
  return jsonb_build_object('rol', 'cliente', 'atleta', aid, 'email', em);
end;
$$;
