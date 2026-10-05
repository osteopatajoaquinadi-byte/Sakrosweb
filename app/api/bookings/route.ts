import { calendarNotificationsEnabled, emailFrom } from "@/lib/email";
import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { Resend } from "resend";
import { paymentLinks, paymentProvider, siteConfig } from "@/lib/site-config";
import { PAYMENT_HOLD_MINUTES, createCheckout, mercadoPagoEnabled } from "@/lib/mercadopago";
import { releaseExpiredHolds } from "@/lib/payment-holds";
import { sendProfessionalInvites } from "@/lib/calendar-invite";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      service_id,
      professional_id,
      booking_date,
      start_time,
      client_name,
      client_email,
      client_phone,
      payment_method,
      notes,
    } = body;

    // Validación básica
    if (
      !service_id ||
      !professional_id ||
      !booking_date ||
      !start_time ||
      !client_name ||
      !client_email
    ) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios." },
        { status: 400 }
      );
    }

    const db = getServiceClient();
    await releaseExpiredHolds(db);

    // Obtener servicio para calcular end_time
    const { data: service } = await db
      .from("services")
      .select("id, name, slug, duration_minutes, price_clp")
      .eq("id", service_id)
      .single();

    if (!service) {
      return NextResponse.json(
        { error: "Servicio no encontrado." },
        { status: 404 }
      );
    }

    // Calcular end_time
    const [h, m] = start_time.split(":").map(Number);
    const endMinutes = h * 60 + m + service.duration_minutes;
    const end_time = `${Math.floor(endMinutes / 60)
      .toString()
      .padStart(2, "0")}:${(endMinutes % 60).toString().padStart(2, "0")}`;

    // Verificar que el slot no esté ya tomado (race condition guard)
    const { data: existing } = await db
      .from("bookings")
      .select("id")
      .eq("professional_id", professional_id)
      .eq("booking_date", booking_date)
      .eq("start_time", start_time)
      .eq("status", "confirmed")
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Esa hora ya fue reservada. Elige otra." },
        { status: 409 }
      );
    }

    // Obtener nombre del profesional
    const { data: professional } = await db
      .from("professionals")
      .select("name")
      .eq("id", professional_id)
      .single();

    // Crear la reserva
    const { data: booking, error: bookingErr } = await db
      .from("bookings")
      .insert({
        service_id,
        professional_id,
        booking_date,
        start_time,
        end_time,
        client_name,
        client_email,
        client_phone: client_phone || null,
        payment_method: payment_method || "in_clinic",
        payment_status: "pending",
        notes: notes || null,
      })
      .select()
      .single();

    if (bookingErr) {
      console.error("Error creando reserva:", bookingErr);
      return NextResponse.json(
        { error: "No pudimos crear tu reserva. Intenta de nuevo." },
        { status: 500 }
      );
    }

    // Pago online con Mercado Pago: cobro propio de esta reserva, que se marca
    // pagada sola al recibir el aviso. Si no se paga en el plazo, la hora se
    // libera. Los programas y los servicios con link de Tuu siguen con link fijo.
    let paymentUrl: string | null = null;
    const fixedLink = paymentLinks[service.slug];
    const isProgram = typeof notes === "string" && notes.startsWith("[Programa");
    if (
      payment_method === "online_webpay" &&
      !isProgram &&
      fixedLink &&
      paymentProvider(fixedLink) === "Mercado Pago" &&
      mercadoPagoEnabled()
    ) {
      try {
        const expiresAt = new Date(Date.now() + PAYMENT_HOLD_MINUTES * 60_000);
        const checkout = await createCheckout({
          bookingId: booking.id,
          title: `${service.name} — Sakros`,
          amount: service.price_clp,
          payerEmail: client_email,
          payerName: client_name,
          siteUrl: new URL(request.url).origin,
          expiresAt,
        });
        paymentUrl = checkout.url;
        await db
          .from("bookings")
          .update({ payment_provider_ref: checkout.id, payment_expires_at: expiresAt.toISOString() })
          .eq("id", booking.id);
      } catch (e) {
        // Sin cobro propio se ofrece el link fijo, como antes.
        console.error("Mercado Pago:", e);
      }
    }

    // Enviar email de confirmación al cliente
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey && calendarNotificationsEnabled()) {
      const resend = new Resend(apiKey);
      const dateFormatted = new Date(booking_date + "T12:00:00").toLocaleDateString(
        "es-CL",
        { weekday: "long", year: "numeric", month: "long", day: "numeric" }
      );

      await resend.emails.send({
        from: emailFrom("Sakros"),
        to: client_email,
        replyTo: siteConfig.email,
        subject: `Tu reserva en Sakros — ${service.name} el ${dateFormatted}`,
        text: [
          `Hola ${client_name},`,
          "",
          `Tu reserva ha sido registrada:`,
          "",
          `Servicio: ${service.name}`,
          `Profesional: ${professional?.name ?? ""}`,
          `Fecha: ${dateFormatted}`,
          `Hora: ${start_time} - ${end_time}`,
          `Valor: $${service.price_clp.toLocaleString("es-CL")} CLP`,
          "",
          paymentUrl
            ? `Pago online: ${paymentUrl}\nTienes ${PAYMENT_HOLD_MINUTES / 60} horas para pagar; si no, la hora se libera.`
            : payment_method === "online_webpay" && paymentLinks[service.slug]
            ? `Pago online: ${paymentLinks[service.slug]}`
            : payment_method === "online_webpay"
            ? `Pago: online con tarjeta (link en la pantalla de confirmación). Si no alcanzaste a pagar, escríbenos al WhatsApp ${siteConfig.phone}.`
            : payment_method === "online_transfer"
            ? `Pago: transferencia online. Envía tu comprobante al WhatsApp ${siteConfig.phone} para confirmar.`
            : `Pago: en la clínica.`,
          "",
          `Dirección: ${siteConfig.address.street}, ${siteConfig.address.city}`,
          "",
          `Política de cancelación: puedes cancelar o reprogramar hasta 24 horas antes sin costo.`,
          "",
          `¿Necesitas cambiar la hora? Escríbenos al WhatsApp ${siteConfig.phone}.`,
          "",
          "— Equipo Sakros",
        ].join("\n"),
      });

      // Notificación interna a Sakros
      await resend.emails.send({
        from: emailFrom("Sakros Web"),
        to: siteConfig.email,
        subject: `Nueva reserva — ${client_name} / ${service.name}`,
        text: [
          `Nueva reserva desde sakros.cl:`,
          "",
          `Cliente: ${client_name}`,
          `Email: ${client_email}`,
          `Teléfono: ${client_phone || "No indicado"}`,
          `Servicio: ${service.name}`,
          `Profesional: ${professional?.name ?? ""}`,
          `Fecha: ${dateFormatted}`,
          `Hora: ${start_time} - ${end_time}`,
          `Pago: ${payment_method === "online_webpay" ? "Online con tarjeta (verificar pago)" : payment_method === "online_transfer" ? "Transferencia (pendiente comprobante)" : "En clínica"}`,
          notes ? `Notas: ${notes}` : "",
        ].join("\n"),
      });
    }

    // La hora llega como invitación al calendario del profesional.
    await sendProfessionalInvites(db, [booking.id], "new");

    return NextResponse.json({ booking, payment_url: paymentUrl });
  } catch (error) {
    console.error("Error en /api/bookings:", error);
    return NextResponse.json(
      { error: "Error interno. Intenta por WhatsApp." },
      { status: 500 }
    );
  }
}
