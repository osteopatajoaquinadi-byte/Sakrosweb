// Correo al paciente cuando se recibe el pago de su hora: "reserva
// confirmada y pago recibido". Lo envían el aviso de Mercado Pago y el panel
// al marcar una cita como pagada. Nunca lanza error.
import { Resend } from "resend";
import { getServiceClient } from "@/lib/supabase";
import { calendarNotificationsEnabled, emailFrom } from "@/lib/email";
import { siteConfig } from "@/lib/site-config";

type Db = ReturnType<typeof getServiceClient>;

export function formatBookingDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Primer nombre con mayúscula inicial: "joaquin adi" → "Joaquin".
export function firstNameOf(fullName: string | null | undefined): string {
  const first = String(fullName ?? "").trim().split(/\s+/)[0] ?? "";
  return first ? first.charAt(0).toLocaleUpperCase("es-CL") + first.slice(1).toLocaleLowerCase("es-CL") : "";
}

export const clp = (n: number) => `$${Math.round(n).toLocaleString("es-CL")}`;

export async function sendPaymentReceivedEmail(
  db: Db,
  bookingId: string,
  payment: { amount?: number | null; method: string; reference?: string | null }
): Promise<boolean> {
  if (!calendarNotificationsEnabled()) return false;
  try {
    const { data: b } = await db
      .from("bookings")
      .select("booking_date, start_time, end_time, client_name, client_email, services(name, price_clp), professionals(name)")
      .eq("id", bookingId)
      .single();
    if (!b?.client_email) return false;
    const service = b.services as unknown as { name: string; price_clp: number } | null;
    const pro = b.professionals as unknown as { name: string } | null;
    const amount = payment.amount ?? service?.price_clp ?? null;
    const fecha = formatBookingDate(b.booking_date);
    const firstName = firstNameOf(b.client_name);

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: emailFrom("Sakros"),
      to: b.client_email,
      replyTo: siteConfig.email,
      subject: `Reserva confirmada y pago recibido — ${service?.name ?? "tu sesión"}, ${fecha}`,
      text: [
        `Hola ${firstName},`,
        "",
        "¡Muchas gracias! Recibimos tu pago y tu hora quedó confirmada.",
        "",
        `Servicio: ${service?.name ?? ""}`,
        `Profesional: ${pro?.name ?? ""}`,
        `Fecha: ${fecha}`,
        `Hora: ${String(b.start_time).slice(0, 5)} - ${String(b.end_time).slice(0, 5)}`,
        amount ? `Pago recibido: ${clp(amount)} (${payment.method}${payment.reference ? `, ${payment.reference}` : ""})` : `Pago recibido (${payment.method})`,
        "",
        `Dirección: ${siteConfig.address.street}, ${siteConfig.address.city}`,
        "",
        "Para tu sesión:",
        "- Llega 5 a 10 minutos antes.",
        "- Usa ropa cómoda que permita moverte.",
        "- Si tienes exámenes, imágenes o informes médicos relacionados, tráelos.",
        "",
        `Si necesitas cambiar o cancelar tu hora, avísanos con al menos 24 horas de anticipación por WhatsApp al ${siteConfig.phone}.`,
        "",
        "Te esperamos.",
        "",
        "Un abrazo,",
        "Equipo Sakros",
      ].join("\n"),
    });
    if (error) {
      console.error("Correo pago recibido:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Correo pago recibido:", e);
    return false;
  }
}
