-- Índice de las fichas antiguas en Google Drive (una planilla por paciente).
-- Se cargó una vez desde la carpeta "fichas pacientes SaKros". Cuando una
-- ficha se enlaza a un paciente, también queda como adjunto (origen 'drive').

create or replace function public.fichas_norm(t text) returns text language sql immutable as $$
  select trim(regexp_replace(regexp_replace(regexp_replace(
    translate(lower(coalesce(t,'')), 'áéíóúàèìòùäëïöüâêîôûñç', 'aeiouaeiouaeiouaeiounc'),
    '^(copia de )+|^ficha ', ''), '[^a-z0-9 ]', ' ', 'g'), '\s+', ' ', 'g'))
$$;
revoke all on function public.fichas_norm(text) from anon, authenticated;

create table if not exists fichas_drive (
  drive_id text primary key,
  titulo text not null,
  modificado date,
  patient_id uuid references fichas_patients(id) on delete set null,
  created_at timestamptz not null default now(),
  titulo_norm text generated always as (fichas_norm(titulo)) stored
);
create index if not exists fichas_drive_patient_idx on fichas_drive (patient_id);
alter table fichas_drive enable row level security;
revoke all on fichas_drive from anon, authenticated;
