// Aviso de Mercado Pago (Webhooks). Consulta el pago a la API, lo registra
// en online_payments y, si corresponde a una reserva, la marca pagada y
// registra el pago en la ficha del paciente.
import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { getPayment, mercadoPagoEnabled, validSignature } from "@/lib/mercadopago";
import { sendProfessionalInvites } from "@/lib/calendar-invite";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  if (!mercadoPagoEnabled()) return NextResponse.json({ ok: true });

  const url = new URL(request.url);
  const body = await request.json().catch(() => ({}));
  const type = body.type ?? body.topic ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const paymentId = String(body.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "");

  // Solo interesan los pagos; el resto de los avisos se confirma y se ignora.
  if (type !== "payment" || !paymentId) return NextResponse.json({ ok: true });
  if (!validSignature(request.headers, paymentId)) {
    return NextResponse.json({ error: "Firma inválida." }, { status: 401 });
  }

  let payment;
  try {
    payment = await getPayment(paymentId);
  } catch (e) {
    console.error("Mercado Pago, consultar pago:", e);
    // 500 para que Mercado Pago reintente más tarde.
    return NextResponse.json({ error: "No se pudo consultar el pago." }, { status: 500 });
  }

  const db = getServiceClient();
  const ref = payment.external_reference ?? "";
  const bookingId = UUID.test(ref) ? ref : null;

  const { data: booking } = bookingId
    ? await db
        .from("bookings")
        .select("id, status, payment_status, booking_date, start_time, professional_id, fichas_patient_id, notes, services(name)")
        .eq("id", bookingId)
        .maybeSingle()
    : { data: null };

  await db.from("online_payments").upsert(
    {
      provider: "mercadopago",
      provider_payment_id: String(payment.id),
      status: payment.status,
      amount: Math.round(payment.transaction_amount),
      payer_email: payment.payer?.email ?? null,
      description: payment.description,
      external_reference: ref || null,
      booking_id: booking?.id ?? null,
      raw: payment,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "provider,provider_payment_id" }
  );

  if (!booking) return NextResponse.json({ ok: true });

  if (payment.status === "approved" && booking.payment_status !== "paid") {
    const update: Record<string, unknown> = {
      payment_status: "paid",
      paid_at: payment.date_approved ?? new Date().toISOString(),
      payment_expires_at: null,
    };

    // Si la hora se liberó justo antes de que llegara el aviso, se recupera
    // cuando sigue libre; si otra persona la tomó, queda anotado para el equipo.
    let reactivated = false;
    if (booking.status === "cancelled") {
      const { data: clash } = await db
        .from("bookings")
        .select("id")
        .eq("professional_id", booking.professional_id)
        .eq("booking_date", booking.booking_date)
        .eq("start_time", booking.start_time)
        .eq("status", "confirmed")
        .neq("id", booking.id)
        .limit(1);
      if (!clash || clash.length === 0) {
        Object.assign(update, { status: "confirmed", cancelled_at: null });
        reactivated = true;
      } else {
        update.notes = [booking.notes, "PAGO RECIBIDO pero la hora ya estaba tomada: contactar al paciente"]
          .filter(Boolean)
          .join(" · ");
      }
    }

    await db.from("bookings").update(update).eq("id", booking.id);
    if (reactivated) await sendProfessionalInvites(db, [booking.id], "new");

    // El pago queda en la ficha del paciente (suma la sesión pagada).
    if (booking.fichas_patient_id) {
      const service = (booking.services as unknown as { name: string } | null)?.name ?? null;
      const { error } = await db.from("fichas_payments").insert({
        patient_id: booking.fichas_patient_id,
        amount: Math.round(payment.transaction_amount),
        method: "webpay",
        payment_type: "sesion",
        sessions_purchased: 1,
        service_type: service,
        reference: `Mercado Pago #${payment.id}`,
        notes: "Pago online automático al reservar",
        registered_by: "Mercado Pago",
      });
      if (error) console.error("Registrar pago en ficha:", error.message);
    }
  } else if (["refunded", "charged_back"].includes(payment.status) && booking.payment_status === "paid") {
    await db.from("bookings").update({ payment_status: "refunded" }).eq("id", booking.id);
  }

  return NextResponse.json({ ok: true });
}
