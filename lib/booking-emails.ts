// Correo al paciente cuando se recibe el pago de su hora: "reserva
// confirmada y pago recibido". Lo envían el aviso de Mercado Pago y el panel
// al marcar una cita como pagada. Nunca lanza error.
import { Resend } from "resend";
import { getServiceClient } from "@/lib/supabase";
import { calendarNotificationsEnabled, emailFrom } from "@/lib/email";
import { programaRehab, siteConfig } from "@/lib/site-config";
import { paymentReceivedEmail } from "@/lib/patient-emails";

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
      .select("booking_date, start_time, end_time, client_name, client_email, notes, services(name, price_clp), professionals(name)")
      .eq("id", bookingId)
      .single();
    if (!b?.client_email) return false;
    const service = b.services as unknown as { name: string; price_clp: number } | null;
    const pro = b.professionals as unknown as { name: string } | null;
    const notes = String(b.notes ?? "");
    const program = notes.startsWith("[Programa")
      ? programaRehab[notes.includes("ISAPRE") ? "isapre" : "fonasa"]
      : null;
    const mail = paymentReceivedEmail(
      {
        firstName: firstNameOf(b.client_name),
        service: service?.name ?? "tu sesión",
        professional: pro?.name ?? "",
        dateLabel: formatBookingDate(b.booking_date),
        start: String(b.start_time).slice(0, 5),
        end: String(b.end_time).slice(0, 5),
        priceClp: service?.price_clp ?? 0,
        program: program ? { label: program.label, price: program.price } : undefined,
      },
      payment
    );

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: emailFrom("Sakros"),
      to: b.client_email,
      replyTo: siteConfig.email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
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
