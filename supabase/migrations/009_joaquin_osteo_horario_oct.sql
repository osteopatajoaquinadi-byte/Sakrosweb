-- Horario de osteopatía de Joaquín desde octubre 2026. Aplicado en producción el 2026-10-14.
-- Lunes 12:00-15:00 · Martes 08:30-14:30 · Miércoles 08:30-12:30 y 18:00-20:00
-- Jueves 08:30-13:30 · Viernes 13:00-15:00
delete from schedule_windows w
using professionals p, services s
where w.professional_id = p.id and w.service_id = s.id
  and p.slug = 'joaquin' and s.slug = 'osteopatia';

insert into schedule_windows (professional_id, service_id, day_of_week, start_time, end_time)
select p.id, s.id, v.dow, v.start_time::time, v.end_time::time
from professionals p, services s,
  (values (1, '12:00', '15:00'),
          (2, '08:30', '14:30'),
          (3, '08:30', '12:30'),
          (3, '18:00', '20:00'),
          (4, '08:30', '13:30'),
          (5, '13:00', '15:00')) as v(dow, start_time, end_time)
where p.slug = 'joaquin' and s.slug = 'osteopatia';
