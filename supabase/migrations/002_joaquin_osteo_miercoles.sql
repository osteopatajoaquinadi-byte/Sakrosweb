-- Osteopatía de Joaquín los miércoles: mismo horario que el martes
-- (08:30-14:30 y 18:00-20:00), reemplazando la ventana 08:30-13:30.
-- Aplicado en producción el 2026-09-30.
delete from schedule_windows w
using professionals p, services s
where w.professional_id = p.id
  and w.service_id = s.id
  and p.slug = 'joaquin'
  and s.slug = 'osteopatia'
  and w.day_of_week = 3;

insert into schedule_windows (professional_id, service_id, day_of_week, start_time, end_time)
select p.id, s.id, 3, v.start_time::time, v.end_time::time
from professionals p, services s,
  (values ('08:30', '14:30'), ('18:00', '20:00')) as v(start_time, end_time)
where p.slug = 'joaquin' and s.slug = 'osteopatia';
