-- Recordatorio del día anterior (correo + WhatsApp). Aplicada el 2026-10-03.
alter table public.bookings add column if not exists reminder_sent_at timestamptz;
alter table public.bookings add column if not exists reminder_channels text;
create index if not exists bookings_reminder_pending_idx
  on public.bookings (booking_date)
  where reminder_sent_at is null and status = 'confirmed';
