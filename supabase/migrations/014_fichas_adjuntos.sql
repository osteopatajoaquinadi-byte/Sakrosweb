-- Archivos adjuntos de la ficha (subidos al bucket privado o enlaces a Drive).
insert into storage.buckets (id, name, public, file_size_limit)
values ('fichas-adjuntos', 'fichas-adjuntos', false, 52428800)
on conflict (id) do nothing;

create table if not exists fichas_adjuntos (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references fichas_patients(id) on delete cascade,
  nombre text not null,
  path text,
  url text,
  tipo text,
  tamano bigint,
  origen text not null default 'subido' check (origen in ('subido', 'drive')),
  subido_por text,
  created_at timestamptz not null default now(),
  check (path is not null or url is not null)
);
create index if not exists fichas_adjuntos_patient on fichas_adjuntos (patient_id, created_at desc);
alter table fichas_adjuntos enable row level security;
revoke all on fichas_adjuntos from anon, authenticated;
