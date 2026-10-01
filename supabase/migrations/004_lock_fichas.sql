-- Cierra el acceso público a las fichas clínicas y pagos. Hasta ahora la
-- clave anon (pública, incluida en el sitio) podía leer y modificar todos
-- los datos de pacientes. Desde esta versión el panel accede solo por el
-- servidor con la service role, previa sesión con usuario + PIN.
--
-- Aplicado en producción el 2026-10-01. Se revocan los privilegios de las
-- tablas: sin ellos, las políticas RLS "true" que siguen definidas no dan
-- acceso a anon ni a authenticated. (Borrar esas políticas es opcional;
-- se puede hacer desde el editor SQL de Supabase.)

revoke all on fichas_patients, fichas_payments, fichas_sessions, fichas_session_balance
  from anon, authenticated;

-- La vista corría con permisos de su dueño y saltaba RLS: se cierra también.
revoke all on fichas_patient_balance from anon, authenticated;
alter view fichas_patient_balance set (security_invoker = true);
