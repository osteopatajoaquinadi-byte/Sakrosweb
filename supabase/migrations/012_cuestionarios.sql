-- Cuestionarios clínicos (por ahora THI, tinnitus). Los completa el
-- profesional en la ficha o el paciente desde un link con token.
create table if not exists fichas_cuestionarios (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references fichas_patients(id) on delete cascade,
  tipo text not null,                       -- 'THI'
  estado text not null default 'respondido' check (estado in ('pendiente', 'respondido')),
  origen text not null check (origen in ('profesional', 'paciente')),
  respuestas jsonb,                          -- { "1": "si" | "a_veces" | "no", ... }
  puntaje integer,
  severidad text,
  subescalas jsonb,                          -- { "F": n, "E": n, "C": n }
  token text unique,                         -- link para el paciente
  expira_at timestamptz,
  creado_por text,
  created_at timestamptz not null default now(),
  respondido_at timestamptz
);

create index if not exists fichas_cuestionarios_patient on fichas_cuestionarios (patient_id, created_at desc);

alter table fichas_cuestionarios enable row level security;
revoke all on fichas_cuestionarios from anon, authenticated;
