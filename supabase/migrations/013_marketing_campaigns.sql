-- Campañas de correo enviadas desde el panel (Resend Broadcasts).
create table if not exists marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  asunto text not null,
  segmento text not null,
  contenido jsonb not null,
  resend_broadcast_id text,
  estado text not null default 'enviada',
  programada_para timestamptz,
  creado_por text,
  created_at timestamptz not null default now()
);
alter table marketing_campaigns enable row level security;
revoke all on marketing_campaigns from anon, authenticated;
