-- Cierra el acceso público a las fichas clínicas y pagos. Hasta ahora las
-- tablas fichas_* tenían políticas RLS "true" para cualquier rol, y la
-- clave anon (pública, incluida en el sitio) permitía leer y modificar
-- todos los datos de pacientes. Desde esta versión el panel accede solo
-- por el servidor con la service role, previa sesión con usuario + PIN.
--
-- Aplicar DESPUÉS de desplegar el código que usa getServiceClient() en
-- /api/fichas/*, /api/calendar y /api/equipo/*.

drop policy if exists fichas_patients_all on fichas_patients;
drop policy if exists fichas_payments_all on fichas_payments;
drop policy if exists fichas_sessions_all on fichas_sessions;
drop policy if exists fichas_balance_all on fichas_session_balance;

revoke all on fichas_patients, fichas_payments, fichas_sessions, fichas_session_balance
  from anon, authenticated;

-- La vista corre con permisos de su dueño y saltaba RLS: se cierra también.
revoke all on fichas_patient_balance from anon, authenticated;
alter view fichas_patient_balance set (security_invoker = true);
