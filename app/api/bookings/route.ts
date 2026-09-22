import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { Resend } from "resend";
import { siteConfig } from "@/lib/site-config";

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

    // Obtener servicio para calcular end_time
    const { data: service } = await db
      .from("services")
      .select("id, name, duration_minutes, price_clp")
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

    // Enviar email de confirmación al cliente
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);
      const dateFormatted = new Date(booking_date + "T12:00:00").toLocaleDateString(
        "es-CL",
        { weekday: "long", year: "numeric", month: "long", day: "numeric" }
      );

      await resend.emails.send({
        from: "Sakros <onboarding@resend.dev>",
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
          payment_method === "online_transfer"
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
        from: "Sakros Web <onboarding@resend.dev>",
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
          `Pago: ${payment_method === "online_transfer" ? "Transferencia (pendiente comprobante)" : "En clínica"}`,
          notes ? `Notas: ${notes}` : "",
        ].join("\n"),
      });
    }

    // TODO: crear evento en Google Calendar del profesional
    // TODO: enviar mensaje de confirmación por WhatsApp (API de WhatsApp Business)

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Error en /api/bookings:", error);
    return NextResponse.json(
      { error: "Error interno. Intenta por WhatsApp." },
      { status: 500 }
    );
  }
}
