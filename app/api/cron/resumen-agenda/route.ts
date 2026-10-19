import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getServiceClient } from "@/lib/supabase";
import { calendarNotificationsEnabled, emailFrom } from "@/lib/email";
import { buildIcsBundle, chileToUtc } from "@/lib/calendar-invite";
import { renderBrandedEmail } from "@/lib/email-template";
import { siteConfig } from "@/lib/site-config";

// Envío único: a cada profesional le llega UN correo con cuántas citas tiene
// agendadas desde mañana, la lista y un archivo .ics para cargarlas todas en
// Google Calendar. Las citas nuevas siguen llegando como invitación aparte.
// Protegido con CRON_SECRET (header Bearer o ?key=). ?dry=1 solo muestra.

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  client_name: string;
  client_phone: string | null;
  notes: string | null;
  services: { name: string } | null;
  professionals: { slug: string; name: string; email: string | null } | null;
};

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const url = new URL(request.url);
  const given = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? url.searchParams.get("key");
  if (!secret || given !== secret) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const dry = url.searchParams.get("dry") === "1";
  const only = url.searchParams.get("pro"); // opcional: un solo profesional

  const tomorrow = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(
    new Date(Date.now() + 24 * 3600 * 1000)
  );
  const db = getServiceClient();
  const { data, error } = await db
    .from("bookings")
    .select("id, booking_date, start_time, end_time, client_name, client_phone, notes, services(name), professionals(slug, name, email)")
    .eq("status", "confirmed")
    .gte("booking_date", tomorrow)
    .order("booking_date")
    .order("start_time");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const byPro = new Map<string, Row[]>();
  for (const r of (data ?? []) as unknown as Row[]) {
    const p = r.professionals;
    if (!p?.email || (only && p.slug !== only)) continue;
    byPro.set(p.slug, [...(byPro.get(p.slug) ?? []), r]);
  }

  const location = `Sakros, ${siteConfig.address.street}, ${siteConfig.address.city}`;
  const resend = !dry && calendarNotificationsEnabled() ? new Resend(process.env.RESEND_API_KEY) : null;
  const result: { pro: string; to: string; citas: number; enviado: boolean; error?: string }[] = [];

  for (const [, rows] of byPro) {
    const pro = rows[0].professionals!;
    const firstName = pro.name.split(" ")[0];
    const n = rows.length;
    const items = rows.map((r) => {
      const d = new Date(`${r.booking_date}T12:00:00`).toLocaleDateString("es-CL", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
      return `${d} · ${r.start_time.slice(0, 5)} — ${r.client_name} (${r.services?.name ?? "Sesión"})`;
    });
    const mail = renderBrandedEmail({
      preheader: `${firstName}, tienes ${n} citas agendadas en Sakros.`,
      badge: { text: "Tu agenda", tone: "info" },
      title: `${firstName}, tienes ${n} citas agendadas`,
      greeting: `Hola ${firstName},`,
      paragraphs: [
        `Estas son tus ${n} citas desde mañana en la agenda nueva de Sakros. Adjuntamos un archivo para cargarlas todas de una vez en tu Google Calendar.`,
      ],
      list: { title: "Tus citas", items },
      box: {
        tone: "info",
        title: "Cómo cargarlas en Google Calendar (una sola vez, desde el computador)",
        lines: [
          "1. Descarga el archivo adjunto agenda-sakros.ics.",
          "2. Abre calendar.google.com → ⚙ Configuración → Importar y exportar.",
          "3. Elige el archivo, selecciona tu calendario y presiona Importar.",
          "Desde ahora, cada cita nueva, cambio o cancelación te llegará como invitación aparte. Para que se agreguen solas: Configuración → Eventos de Gmail / Invitaciones → \"Agregar invitaciones a mi calendario: De todos\".",
        ],
      },
      closing: ["Cualquier duda, escríbenos.", "Equipo Sakros"],
    });
    const ics = buildIcsBundle(
      rows.map((r) => ({
        uid: `${r.id}@sakros.cl`,
        start: chileToUtc(r.booking_date, r.start_time),
        end: chileToUtc(r.booking_date, r.end_time),
        summary: `${r.services?.name ?? "Sesión"} — ${r.client_name}`,
        description: [`Paciente: ${r.client_name}`, r.client_phone ? `Teléfono: ${r.client_phone}` : "", r.notes ? `Notas: ${r.notes}` : ""]
          .filter(Boolean)
          .join("\n"),
        location,
      }))
    );

    const entry = { pro: pro.slug, to: pro.email!, citas: n, enviado: false } as (typeof result)[number];
    if (resend) {
      const { error: sendErr } = await resend.emails.send({
        from: emailFrom("Sakros Reservas"),
        to: pro.email!,
        subject: `${firstName}, tienes ${n} citas agendadas en Sakros`,
        html: mail.html,
        text: mail.text,
        attachments: [{ filename: "agenda-sakros.ics", content: Buffer.from(ics), contentType: "text/calendar; charset=utf-8" }],
      });
      if (sendErr) entry.error = sendErr.message;
      else entry.enviado = true;
    }
    result.push(entry);
  }
  return NextResponse.json({ desde: tomorrow, dry, result });
}
