// Correos al paciente que dependen de lo que pasa con su cita después de
// reservar: pago recibido, cancelación, cambio de hora y no asistió.
import { Resend } from "resend";
import { getServiceClient } from "@/lib/supabase";
import { calendarNotificationsEnabled, emailFrom } from "@/lib/email";
import { programaRehab, siteConfig } from "@/lib/site-config";
import {
  cancelledEmail,
  noShowEmail,
  paymentReceivedEmail,
  rescheduledEmail,
  type BookingInfo,
} from "@/lib/patient-emails";

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

// Carga la reserva con lo que necesitan los correos al paciente.
async function loadBooking(db: Db, bookingId: string) {
  const { data: b } = await db
    .from("bookings")
    .select("booking_date, start_time, end_time, client_name, client_email, notes, services(name, price_clp), professionals(name)")
    .eq("id", bookingId)
    .single();
  if (!b?.client_email) return null;
  const service = b.services as unknown as { name: string; price_clp: number } | null;
  const pro = b.professionals as unknown as { name: string } | null;
  const notes = String(b.notes ?? "");
  const program = notes.startsWith("[Programa")
    ? programaRehab[notes.includes("ISAPRE") ? "isapre" : "fonasa"]
    : null;
  const info: BookingInfo = {
    firstName: firstNameOf(b.client_name),
    service: service?.name ?? "tu sesión",
    professional: pro?.name ?? "",
    dateLabel: formatBookingDate(b.booking_date),
    start: String(b.start_time).slice(0, 5),
    end: String(b.end_time).slice(0, 5),
    priceClp: service?.price_clp ?? 0,
    program: program ? { label: program.label, price: program.price } : undefined,
  };
  return { to: b.client_email as string, info };
}

async function send(to: string, mail: { subject: string; html: string; text: string }, label: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: emailFrom("Sakros"),
    to,
    replyTo: siteConfig.email,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
  });
  if (error) {
    console.error(`Correo ${label}:`, error.message);
    return false;
  }
  return true;
}

export async function sendPaymentReceivedEmail(
  db: Db,
  bookingId: string,
  payment: { amount?: number | null; method: string; reference?: string | null }
): Promise<boolean> {
  if (!calendarNotificationsEnabled()) return false;
  try {
    const b = await loadBooking(db, bookingId);
    if (!b) return false;
    return await send(b.to, paymentReceivedEmail(b.info, payment), "pago recibido");
  } catch (e) {
    console.error("Correo pago recibido:", e);
    return false;
  }
}

// Avisos de cambios en la cita: cancelada por la clínica, liberada por falta
// de pago, cambio de fecha u hora, o no asistió. Nunca lanza error.
export type BookingNotice =
  | { kind: "cancelled" }
  | { kind: "unpaid" }
  | { kind: "rescheduled"; before: { booking_date: string; start_time: string } }
  | { kind: "no_show" };

export async function sendBookingNotice(db: Db, bookingId: string, notice: BookingNotice): Promise<boolean> {
  if (!calendarNotificationsEnabled()) return false;
  try {
    const b = await loadBooking(db, bookingId);
    if (!b) return false;
    const mail =
      notice.kind === "cancelled"
        ? cancelledEmail(b.info, "team")
        : notice.kind === "unpaid"
          ? cancelledEmail(b.info, "unpaid")
          : notice.kind === "no_show"
            ? noShowEmail(b.info)
            : rescheduledEmail(b.info, {
                dateLabel: formatBookingDate(notice.before.booking_date),
                start: String(notice.before.start_time).slice(0, 5),
              });
    return await send(b.to, mail, notice.kind);
  } catch (e) {
    console.error(`Correo ${notice.kind}:`, e);
    return false;
  }
}
