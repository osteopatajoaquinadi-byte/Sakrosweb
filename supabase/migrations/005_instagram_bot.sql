-- Bot de Instagram para el Método REST acompañado (palabra clave "sueño").
-- Solo el servidor (service role) accede a estas tablas.

create table if not exists ig_conversations (
  ig_user_id text primary key,
  username text,
  state text not null default 'idle',
  data jsonb not null default '{}'::jsonb,
  offered_slots jsonb not null default '[]'::jsonb,
  booking_id uuid references bookings(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists ig_messages (
  id bigint generated always as identity primary key,
  ig_user_id text not null,
  direction text not null check (direction in ('in', 'out')),
  channel text not null default 'dm' check (channel in ('dm', 'comment')),
  text text,
  created_at timestamptz default now()
);
create index if not exists ig_messages_user_idx on ig_messages (ig_user_id, created_at);

-- Meta reintenta webhooks: se guarda el id de cada evento procesado.
create table if not exists ig_processed_events (
  event_id text primary key,
  created_at timestamptz default now()
);

alter table ig_conversations enable row level security;
alter table ig_messages enable row level security;
alter table ig_processed_events enable row level security;
revoke all on ig_conversations, ig_messages, ig_processed_events from anon, authenticated;

-- Servicio para las sesiones online del programa (no aparece en la reserva
-- pública: active = false). Lo atiende Joaquín.
insert into services (name, slug, duration_minutes, price_clp, description, active)
values ('Método REST acompañado (online)', 'metodo-rest', 60, 97000,
        'Sesión online + seguimiento por WhatsApp 21 días', false)
on conflict do nothing;

insert into professional_services (professional_id, service_id)
select p.id, s.id from professionals p, services s
where p.slug = 'joaquin' and s.slug = 'metodo-rest'
on conflict do nothing;
