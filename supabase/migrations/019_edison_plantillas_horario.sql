-- Horario de Edison para plantillas (estudio biomecánico) desde el 27 de octubre de 2026.
-- Miércoles 08:30-14:30 · Jueves 15:00-20:00
delete from schedule_windows w
using professionals p, services s
where w.professional_id = p.id and w.service_id = s.id
  and p.slug = 'edison' and s.slug = 'estudio-biomecanico';

insert into schedule_windows (professional_id, service_id, day_of_week, start_time, end_time)
select p.id, s.id, v.dow, v.start_time::time, v.end_time::time
from professionals p, services s,
  (values (3, '08:30', '14:30'),
          (4, '15:00', '20:00')) as v(dow, start_time, end_time)
where p.slug = 'edison' and s.slug = 'estudio-biomecanico';
