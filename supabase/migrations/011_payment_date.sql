-- Fecha real del pago (puede ser anterior al registro, para pacientes que
-- venían del sistema antiguo). El vencimiento del pack se cuenta desde ella.
alter table fichas_payments
  add column if not exists paid_on date not null
  default ((now() at time zone 'America/Santiago')::date);

update fichas_payments
  set paid_on = (created_at at time zone 'America/Santiago')::date;

create or replace function public.fichas_credit_sessions()
 returns trigger
 language plpgsql
as $function$
begin
  insert into fichas_session_balance (
    patient_id, payment_id, service_type,
    sessions_total, expires_at
  ) values (
    new.patient_id,
    new.id,
    new.service_type,
    new.sessions_purchased,
    case
      when new.payment_type = 'pack' then new.paid_on + interval '6 months'
      else null
    end
  );
  return new;
end;
$function$;
