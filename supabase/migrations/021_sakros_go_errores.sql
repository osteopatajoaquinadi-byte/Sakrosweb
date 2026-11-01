-- Sakros Go: registro de errores de la app y del servidor.
-- Solo el servidor (service role) lee y escribe: RLS activo y sin políticas.
create table if not exists go_errores (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  origen text not null default 'app',          -- 'app' (navegador) o 'servidor'
  tipo text not null default 'error',          -- error, promesa, sincronizacion, api…
  mensaje text not null,
  detalle text,                                -- pila del error o contexto
  url text,
  ua text,
  version text,
  atleta text,
  user_id uuid,
  rol text,
  alertado boolean not null default false      -- ya se avisó por correo
);
create index if not exists go_errores_fecha on go_errores (created_at desc);
alter table go_errores enable row level security;
revoke all on go_errores from anon, authenticated;
