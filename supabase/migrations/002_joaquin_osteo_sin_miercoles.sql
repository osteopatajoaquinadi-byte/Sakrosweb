-- Joaquín movió su osteopatía del miércoles al martes (el martes ya tenía
-- 08:30-14:30 y 18:00-20:00). Se elimina la ventana del miércoles para que
-- la página de reservas muestre la disponibilidad real.
-- Aplicado en producción el 2026-09-30.
delete from schedule_windows w
using professionals p, services s
where w.professional_id = p.id
  and w.service_id = s.id
  and p.slug = 'joaquin'
  and s.slug = 'osteopatia'
  and w.day_of_week = 3;
