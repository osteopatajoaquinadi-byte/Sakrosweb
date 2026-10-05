-- Pago online automático (Mercado Pago). Aplicada el 2026-10-05.
-- Cada reserva con pago online genera su propio cobro; el aviso de Mercado
-- Pago la marca como pagada. Si no se paga a tiempo, la hora se libera.
alter table public.bookings add column if not exists payment_provider_ref text;
alter table public.bookings add column if not exists payment_expires_at timestamptz;
alter table public.bookings add column if not exists paid_at timestamptz;

create index if not exists bookings_payment_hold_idx
  on public.bookings (payment_expires_at)
  where status = 'confirmed' and payment_status = 'pending' and payment_expires_at is not null;

-- Registro de todos los pagos online que avisan los proveedores, incluidos
-- los de links fijos (packs), para poder cuadrarlos.
create table if not exists public.online_payments (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_payment_id text not null,
  status text not null,
  amount integer,
  payer_email text,
  description text,
  external_reference text,
  booking_id uuid references public.bookings(id) on delete set null,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_payment_id)
);

alter table public.online_payments enable row level security;
