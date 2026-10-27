-- Fecha en que se le pidió reseña de Google al paciente (una sola vez).
alter table fichas_patients add column if not exists resena_pedida_at timestamptz;
