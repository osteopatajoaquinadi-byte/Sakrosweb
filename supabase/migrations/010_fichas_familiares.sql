-- Familiares con el mismo email o teléfono (ej. padre que reserva para su
-- hijo) tienen fichas distintas. Una reserva se vincula a una ficha existente
-- solo si coincide el email o teléfono Y el primer nombre; si no, se crea una
-- ficha nueva con el nombre de la reserva (manteniendo el email de contacto).

create or replace function public.sakros_first_name(n text)
returns text language sql immutable as $$
  select split_part(
    lower(translate(trim(coalesce(n, '')), 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun')),
    ' ', 1)
$$;

create or replace function public.sakros_find_patient(p_name text, p_email text, p_phone text)
returns uuid language sql stable as $$
  select id from fichas_patients
  where (
      (p_email is not null and p_email <> '' and lower(email) = lower(p_email))
      or (p_phone is not null and p_phone <> '' and phone = p_phone)
    )
    and sakros_first_name(name) = sakros_first_name(p_name)
  order by created_at
  limit 1
$$;

create or replace function public.booking_auto_create_ficha()
returns trigger language plpgsql as $function$
declare
  existing_id uuid;
  new_id uuid;
  prof_user text;
begin
  existing_id := sakros_find_patient(NEW.client_name, NEW.client_email, NEW.client_phone);
  if existing_id is not null then
    NEW.ficha_patient_id := existing_id;
  else
    select case
      when p.name ilike '%joaqu%' then 'joaquin'
      when p.name ilike '%anikken%' then 'anikken'
      when p.name ilike '%camilo%' then 'camilo'
      when p.name ilike '%edison%' then 'edison'
      else 'joaquin' end
    into prof_user from professionals p where p.id = NEW.professional_id;
    insert into fichas_patients (name, email, phone, reason, created_by)
    values (NEW.client_name, NEW.client_email, NEW.client_phone,
            (select s.name from services s where s.id = NEW.service_id),
            coalesce(prof_user, 'joaquin'))
    returning id into new_id;
    NEW.ficha_patient_id := new_id;
  end if;
  return NEW;
end;
$function$;

create or replace function public.booking_create_patient()
returns trigger language plpgsql as $function$
declare
  existing_id uuid;
  new_id uuid;
  pro_name text;
begin
  existing_id := sakros_find_patient(NEW.client_name, NEW.client_email, NEW.client_phone);
  if existing_id is not null then
    NEW.fichas_patient_id := existing_id;
  else
    select slug into pro_name from professionals where id = NEW.professional_id;
    insert into fichas_patients (name, phone, email, created_by, notes)
    values (NEW.client_name, NEW.client_phone, NEW.client_email,
            coalesce(pro_name, 'web'), 'Creado automáticamente desde reserva online')
    returning id into new_id;
    NEW.fichas_patient_id := new_id;
  end if;
  return NEW;
end;
$function$;
