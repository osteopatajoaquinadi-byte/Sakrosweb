// Invitaciones de calendario (.ics) para los profesionales. Cada reserva
// llega al correo del profesional como invitación: Gmail / Google Calendar
// la agrega sola a su calendario, y las cancelaciones o cambios de hora la
// actualizan (mismo UID, SEQUENCE mayor).
import { Resend } from "resend";
import { getServiceClient } from "@/lib/supabase";
import { calendarNotificationsEnabled, emailFrom } from "@/lib/email";
import { siteConfig } from "@/lib/site-config";

type Db = ReturnType<typeof getServiceClient>;
export type InviteKind = "new" | "update" | "cancel";

const TZ = "America/Santiago";
const FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || "onboarding@resend.dev";

// Hora local de Chile (YYYY-MM-DD + HH:MM) a instante UTC, respetando el
// horario de verano.
function offsetMinutes(at: Date): number {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: TZ, timeZoneName: "longOffset" })
    .formatToParts(at)
    .find((p) => p.type === "timeZoneName")!.value; // "GMT-03:00"
  const m = name.match(/GMT([+-])(\d{2}):(\d{2})/);
  if (!m) return 0;
  const mins = Number(m[2]) * 60 + Number(m[3]);
  return m[1] === "-" ? -mins : mins;
}

export function chileToUtc(date: string, time: string): Date {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.slice(0, 5).split(":").map(Number);
  const asUtc = Date.UTC(y, mo - 1, d, h, mi);
  let utc = asUtc - offsetMinutes(new Date(asUtc)) * 60000;
  utc = asUtc - offsetMinutes(new Date(utc)) * 60000;
  return new Date(utc);
}

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

// Líneas de máximo 75 octetos, como pide el estándar.
function fold(line: string): string {
  const out: string[] = [];
  let cur = "";
  for (const ch of line) {
    if (Buffer.byteLength(cur + ch) > 73) {
      out.push(cur);
      cur = " ";
    }
    cur += ch;
  }
  out.push(cur);
  return out.join("\r\n");
}

export function buildIcs(e: {
  uid: string;
  method: "REQUEST" | "CANCEL";
  sequence: number;
  start: Date;
  end: Date;
  summary: string;
  description: string;
  location: string;
  attendee: string;
}): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "PRODID:-//Sakros//Reservas//ES",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    `METHOD:${e.method}`,
    "BEGIN:VEVENT",
    `UID:${e.uid}`,
    `SEQUENCE:${e.sequence}`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(e.start)}`,
    `DTEND:${stamp(e.end)}`,
    `SUMMARY:${esc(e.summary)}`,
    `DESCRIPTION:${esc(e.description)}`,
    `LOCATION:${esc(e.location)}`,
    `ORGANIZER;CN=Sakros:mailto:${FROM_ADDRESS}`,
    `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=FALSE:mailto:${e.attendee}`,
    `STATUS:${e.method === "CANCEL" ? "CANCELLED" : "CONFIRMED"}`,
    "TRANSP:OPAQUE",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

type BookingRow = {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  client_name: string;
  client_phone: string | null;
  client_email: string | null;
  notes: string | null;
  services: { name: string } | null;
  professionals: { name: string; email: string | null } | null;
};

// Envía la invitación (o su cancelación) al profesional de cada reserva.
// Nunca lanza error: la reserva vale aunque el aviso falle.
export async function sendProfessionalInvites(
  db: Db,
  bookingIds: string[],
  kind: InviteKind,
  // Para avisar a otro profesional (ej. el anterior, al reasignar la hora).
  overrideProfessionalId?: string
): Promise<number> {
  if (!calendarNotificationsEnabled() || bookingIds.length === 0) return 0;
  let sent = 0;
  try {
    const { data } = await db
      .from("bookings")
      .select(
        "id, booking_date, start_time, end_time, client_name, client_phone, client_email, notes, services(name), professionals(name, email)"
      )
      .in("id", bookingIds);
    let rows = (data ?? []) as unknown as BookingRow[];

    if (overrideProfessionalId) {
      const { data: pro } = await db
        .from("professionals")
        .select("name, email")
        .eq("id", overrideProfessionalId)
        .single();
      rows = rows.map((r) => ({ ...r, professionals: pro ?? null }));
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const sequence = Math.floor(Date.now() / 1000);
    for (const b of rows) {
      const to = b.professionals?.email;
      if (!to) continue;
      const service = b.services?.name ?? "Sesión";
      const time = b.start_time.slice(0, 5);
      const dateLabel = new Date(`${b.booking_date}T12:00:00`).toLocaleDateString("es-CL", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      const details = [
        `Paciente: ${b.client_name}`,
        b.client_phone ? `Teléfono: ${b.client_phone}` : "",
        b.client_email ? `Email: ${b.client_email}` : "",
        b.notes ? `Notas: ${b.notes}` : "",
      ]
        .filter(Boolean)
        .join("\n");
      const ics = buildIcs({
        uid: `${b.id}@sakros.cl`,
        method: kind === "cancel" ? "CANCEL" : "REQUEST",
        sequence,
        start: chileToUtc(b.booking_date, b.start_time),
        end: chileToUtc(b.booking_date, b.end_time),
        summary: `${service} — ${b.client_name}`,
        description: details,
        location: `Sakros, ${siteConfig.address.street}, ${siteConfig.address.city}`,
        attendee: to,
      });
      const verb = kind === "cancel" ? "Cancelada" : kind === "update" ? "Cambio de hora" : "Nueva reserva";
      const { error } = await resend.emails.send({
        from: emailFrom("Sakros Reservas"),
        to,
        subject: `${verb}: ${service} — ${b.client_name}, ${dateLabel} ${time}`,
        text: `${verb} en tu agenda de Sakros.\n\n${service}\n${dateLabel} a las ${time}\n${details}\n`,
        attachments: [
          {
            filename: kind === "cancel" ? "cancel.ics" : "invite.ics",
            content: Buffer.from(ics),
            contentType: `text/calendar; charset=utf-8; method=${kind === "cancel" ? "CANCEL" : "REQUEST"}`,
          },
        ],
      });
      if (error) console.error("Invitación profesional:", error.message);
      else sent++;
    }
  } catch (e) {
    console.error("Invitación profesional:", e);
  }
  return sent;
}
