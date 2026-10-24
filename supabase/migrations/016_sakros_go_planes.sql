-- Sakros Go: dos planes de suscripción. Prep (preparación de 10 min) y
-- Entrenamiento (programas completos; incluye Prep). Los accesos dados por el
-- coach y las suscripciones anteriores quedan como Entrenamiento.
alter table go_accesos add column if not exists plan text not null default 'entrenamiento';
alter table go_accesos drop constraint if exists go_accesos_plan_check;
alter table go_accesos add constraint go_accesos_plan_check check (plan in ('prep', 'entrenamiento'));
