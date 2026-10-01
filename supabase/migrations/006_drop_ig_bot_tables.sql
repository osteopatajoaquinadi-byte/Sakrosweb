-- El bot de Instagram vive en el proyecto OsteoJuaco (ya conectado a Meta),
-- que registra sus reservas en este calendario vía la API de Supabase.
-- Se eliminan las tablas del bot duplicado; se mantiene el servicio
-- "metodo-rest" (Método R.E.S.T. acompañado) creado en 005.
drop table if exists ig_conversations;
drop table if exists ig_messages;
drop table if exists ig_processed_events;
