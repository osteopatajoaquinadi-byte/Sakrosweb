-- ============================================================
-- Sakros Booking System — Schema + Seed
-- Ejecutar en Supabase SQL Editor en una sola pasada.
-- ============================================================

-- 1. TABLAS ===================================================

create table professionals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  role text not null,
  email text,
  phone text,
  created_at timestamptz default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  duration_minutes int not null default 60,
  price_clp int not null,
  description text,
  active boolean not null default true,
  created_at timestamptz default now()
);

create table professional_services (
  professional_id uuid references professionals(id) on delete cascade,
  service_id uuid references services(id) on delete cascade,
  primary key (professional_id, service_id)
);

-- Ventanas de disponibilidad semanal recurrente.
-- day_of_week: 1=lunes … 7=domingo (ISO).
-- last_booking_time: hora del último ingreso (si difiere de end_time - duración).
create table schedule_windows (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references professionals(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  day_of_week int not null check (day_of_week between 1 and 7),
  start_time time not null,
  end_time time not null,
  last_booking_time time,
  constraint valid_window check (start_time < end_time)
);

create index idx_schedule_windows_lookup
  on schedule_windows (service_id, day_of_week);

-- Bloqueos puntuales (feriados, vacaciones, emergencias).
create table schedule_blocks (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references professionals(id) on delete cascade,
  block_date date not null,
  start_time time, -- null = día completo bloqueado
  end_time time,
  reason text,
  created_at timestamptz default now()
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references professionals(id),
  service_id uuid not null references services(id),
  client_name text not null,
  client_email text not null,
  client_phone text,
  client_rut text,
  booking_date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'confirmed'
    check (status in ('confirmed','cancelled','completed','no_show')),
  payment_method text
    check (payment_method in ('online_transfer','online_webpay','in_clinic')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending','paid','refunded')),
  payment_reference text,
  google_event_id text,
  notes text,
  created_at timestamptz default now(),
  cancelled_at timestamptz
);

create index idx_bookings_date on bookings (booking_date, professional_id);
create index idx_bookings_status on bookings (status) where status = 'confirmed';

-- 2. RLS (Row Level Security) =================================
-- Público puede leer servicios, profesionales y horarios.
-- Solo el backend (service_role) puede escribir reservas.

alter table professionals enable row level security;
alter table services enable row level security;
alter table professional_services enable row level security;
alter table schedule_windows enable row level security;
alter table schedule_blocks enable row level security;
alter table bookings enable row level security;

create policy "Public read professionals" on professionals for select using (true);
create policy "Public read services" on services for select using (true);
create policy "Public read professional_services" on professional_services for select using (true);
create policy "Public read schedule_windows" on schedule_windows for select using (true);
create policy "Public read schedule_blocks" on schedule_blocks for select using (true);
-- Bookings: solo lectura por service_role (API routes del backend).
-- No hay policy de select público — el anon key no puede leer reservas.

-- 3. SEED DATA ================================================

-- Profesionales
insert into professionals (name, slug, role) values
  ('Joaquín Adi A.', 'joaquin', 'Osteópata y Kinesiólogo'),
  ('Anikken Arentsen', 'anikken', 'Kinesióloga y Posturóloga'),
  ('Camilo Zamora', 'camilo', 'Kinesiólogo'),
  ('Edison', 'edison', 'Actividad Física y Estudio Biomecánico');

-- Servicios
insert into services (name, slug, duration_minutes, price_clp) values
  ('Osteopatía', 'osteopatia', 60, 40000),
  ('Kinesiología', 'kinesiologia', 60, 25000),
  ('Posturología Clínica', 'posturologia', 60, 30000),
  ('Estudio Biomecánico', 'estudio-biomecanico', 60, 40000),
  ('Actividad Física Dirigida', 'actividad-fisica-dirigida', 60, 12000);

-- Profesional ↔ Servicio
insert into professional_services (professional_id, service_id)
select p.id, s.id from professionals p, services s
where (p.slug = 'joaquin'  and s.slug in ('osteopatia','kinesiologia'))
   or (p.slug = 'anikken'  and s.slug in ('kinesiologia','posturologia'))
   or (p.slug = 'camilo'   and s.slug = 'kinesiologia')
   or (p.slug = 'edison'   and s.slug in ('estudio-biomecanico','actividad-fisica-dirigida'));

-- Horarios semanales (day_of_week: 1=Lun … 5=Vie)
-- Función auxiliar para insertar ventanas por slug
do $$
declare
  v_joaquin uuid; v_anikken uuid; v_camilo uuid; v_edison uuid;
  v_osteo uuid; v_kine uuid; v_posturo uuid; v_biomec uuid; v_af uuid;
begin
  select id into v_joaquin from professionals where slug='joaquin';
  select id into v_anikken from professionals where slug='anikken';
  select id into v_camilo  from professionals where slug='camilo';
  select id into v_edison  from professionals where slug='edison';
  select id into v_osteo   from services where slug='osteopatia';
  select id into v_kine    from services where slug='kinesiologia';
  select id into v_posturo from services where slug='posturologia';
  select id into v_biomec  from services where slug='estudio-biomecanico';
  select id into v_af      from services where slug='actividad-fisica-dirigida';

  -- JOAQUÍN — Osteopatía
  insert into schedule_windows (professional_id, service_id, day_of_week, start_time, end_time) values
    (v_joaquin, v_osteo, 1, '13:00','15:00'),  -- Lun
    (v_joaquin, v_osteo, 2, '08:30','14:30'),  -- Mar AM
    (v_joaquin, v_osteo, 2, '18:00','20:00'),  -- Mar PM
    (v_joaquin, v_osteo, 3, '08:30','13:30'),  -- Mié
    (v_joaquin, v_osteo, 4, '08:30','13:30'),  -- Jue
    (v_joaquin, v_osteo, 5, '13:00','15:00');  -- Vie

  -- JOAQUÍN — Kinesiología
  insert into schedule_windows (professional_id, service_id, day_of_week, start_time, end_time) values
    (v_joaquin, v_kine, 1, '08:30','12:00'),  -- Lun
    (v_joaquin, v_kine, 5, '08:30','12:00');  -- Vie

  -- ANIKKEN — Kinesiología
  insert into schedule_windows (professional_id, service_id, day_of_week, start_time, end_time, last_booking_time) values
    (v_anikken, v_kine, 1, '08:30','13:00', null),  -- Lun
    (v_anikken, v_kine, 3, '10:00','13:00', '12:00'),  -- Mié (último ingreso 12:00)
    (v_anikken, v_kine, 5, '08:30','13:00', null);  -- Vie

  -- ANIKKEN — Posturología
  insert into schedule_windows (professional_id, service_id, day_of_week, start_time, end_time) values
    (v_anikken, v_posturo, 1, '18:30','20:30'),  -- Lun
    (v_anikken, v_posturo, 4, '15:00','19:00');  -- Jue

  -- CAMILO — Kinesiología (Lun-Vie 18:30-20:30)
  insert into schedule_windows (professional_id, service_id, day_of_week, start_time, end_time) values
    (v_camilo, v_kine, 1, '18:30','20:30'),
    (v_camilo, v_kine, 2, '18:30','20:30'),
    (v_camilo, v_kine, 3, '18:30','20:30'),
    (v_camilo, v_kine, 4, '18:30','20:30'),
    (v_camilo, v_kine, 5, '18:30','20:30');

  -- EDISON — Estudio Biomecánico
  insert into schedule_windows (professional_id, service_id, day_of_week, start_time, end_time) values
    (v_edison, v_biomec, 3, '08:30','13:30'),  -- Mié AM
    (v_edison, v_biomec, 3, '16:00','20:00'),  -- Mié PM
    (v_edison, v_biomec, 4, '15:00','20:00');  -- Jue

  -- EDISON — Actividad Física Dirigida
  insert into schedule_windows (professional_id, service_id, day_of_week, start_time, end_time) values
    (v_edison, v_af, 2, '10:00','13:00'),  -- Mar
    (v_edison, v_af, 4, '10:00','13:00');  -- Jue
end $$;
