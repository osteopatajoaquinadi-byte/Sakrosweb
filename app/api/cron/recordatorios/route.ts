import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getServiceClient } from "@/lib/supabase";
import { emailFrom } from "@/lib/email";
import { siteConfig } from "@/lib/site-config";
import { normalizeChileanPhone, sendWhatsappTemplate, whatsappEnabled } from "@/lib/whatsapp";

// Recordatorio del día anterior. Vercel Cron llama esta ruta una vez al día
// (ver vercel.json) con el header Authorization: Bearer CRON_SECRET.
// Envía correo y WhatsApp a cada reserva confirmada de mañana que aún no
// tenga recordatorio, y la marca para no repetir.

export const dynamic = "force-dynamic";

function tomorrowInChile(): string {
  const now = new Date();
  const todayCl = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(now);
  const d = new Date(`${todayCl}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const date = tomorrowInChile();
  const db = getServiceClient();
  const { data: bookings, error } = await db
    .from("bookings")
    .select("id, client_name, client_email, client_phone, booking_date, start_time, services(name), professionals(name)")
    .eq("booking_date", date)
    .eq("status", "confirmed")
    .is("reminder_sent_at", null);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  const fecha = new Date(`${date}T12:00:00`).toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const results: { id: string; channels: string[]; errors: string[] }[] = [];

  for (const b of bookings ?? []) {
    const servicio = (b.services as unknown as { name: string } | null)?.name ?? "tu sesión";
    const profesional = (b.professionals as unknown as { name: string } | null)?.name ?? "";
    const hora = String(b.start_time).slice(0, 5);
    const nombre = String(b.client_name || "").split(" ")[0] || "Hola";
    const channels: string[] = [];
    const errors: string[] = [];

    if (resend && b.client_email) {
      const { error: mailErr } = await resend.emails.send({
        from: emailFrom("Sakros"),
        to: b.client_email,
        replyTo: siteConfig.email,
        subject: `Recordatorio: mañana tienes ${servicio} a las ${hora} en Sakros`,
        text: [
          `Hola ${nombre},`,
          "",
          `Te recordamos tu hora de mañana, ${fecha}:`,
          "",
          `Servicio: ${servicio}`,
          profesional ? `Profesional: ${profesional}` : "",
          `Hora: ${hora}`,
          `Dirección: ${siteConfig.address.street}, ${siteConfig.address.city}`,
          "",
          `Si necesitas cambiar o cancelar, avísanos por WhatsApp al ${siteConfig.phone}.`,
          "",
          "— Equipo Sakros",
        ]
          .filter((l) => l !== "")
          .join("\n"),
      });
      if (mailErr) errors.push(`correo: ${mailErr.message}`);
      else channels.push("email");
    }

    const phone = normalizeChileanPhone(b.client_phone);
    if (whatsappEnabled() && phone) {
      // Plantilla: {{1}} nombre, {{2}} servicio, {{3}} fecha, {{4}} hora.
      const wa = await sendWhatsappTemplate(phone, [nombre, servicio, fecha, hora]);
      if (wa.ok) channels.push("whatsapp");
      else errors.push(`whatsapp: ${wa.error}`);
    }

    // Se marca aunque un canal falle, para no reenviar el que sí llegó.
    if (channels.length > 0) {
      await db
        .from("bookings")
        .update({ reminder_sent_at: new Date().toISOString(), reminder_channels: channels.join(",") })
        .eq("id", b.id);
    }
    if (errors.length) console.error("Recordatorio", b.id, errors.join(" | "));
    results.push({ id: b.id, channels, errors });
  }

  return NextResponse.json({ date, total: results.length, results });
}
