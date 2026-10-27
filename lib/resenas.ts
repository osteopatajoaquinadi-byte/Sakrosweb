import { Resend } from "resend";
import { getServiceClient } from "@/lib/supabase";
import { calendarNotificationsEnabled, emailFrom } from "@/lib/email";
import { renderBrandedEmail } from "@/lib/email-template";
import { firstNameOf } from "@/lib/booking-emails";
import { siteConfig } from "@/lib/site-config";

// Correo que pide una reseña en Google después de una atención. A cada
// paciente se le pide una sola vez (fichas_patients.resena_pedida_at) y un
// correo compartido por varios pacientes recibe un solo correo. No se envía
// a quienes se dieron de baja en Resend.

export function correoResena(nombre: string, enlace: string) {
  const r = renderBrandedEmail({
    preheader: "¿Nos ayudas con una reseña? Toma menos de un minuto.",
    title: "¿Cómo te fue en Sakros?",
    greeting: `Hola ${nombre},`,
    paragraphs: [
      "Gracias por atenderte con nosotros. Nos encantaría saber cómo te fue.",
      "Si tienes un minuto, ¿nos dejas una reseña en Google? Cuéntanos tu experiencia con sinceridad: nos ayuda a mejorar y a que otras personas con dolor nos encuentren.",
    ],
    cta: { label: "Dejar mi reseña en Google", href: enlace },
    closing: [
      "Y si algo no estuvo a la altura, respóndenos este correo y lo conversamos.",
      "Un abrazo,",
      "Equipo Sakros",
    ],
  });
  return { subject: "¿Cómo te fue en Sakros?", ...r };
}

type Fila = {
  booking_date: string;
  client_name: string | null;
  client_email: string | null;
  fichas_patient_id: string | null;
  fichas_patients: { id: string; name: string; email: string | null; resena_pedida_at: string | null } | null;
};

export type ResultadoResenas = {
  desde: string;
  hasta: string;
  enviar: boolean;
  destinatarios: { nombre: string; correo: string; estado: string }[];
};

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Atenciones entre `desde` y `hasta` (fechas de Chile, inclusive).
export async function pedirResenas(desde: string, hasta: string, enviar: boolean): Promise<ResultadoResenas> {
  const enlace = siteConfig.googleReviewUrl;
  if (enviar && !enlace) throw new Error("Falta el enlace de reseñas de Google (siteConfig.googleReviewUrl).");
  if (enviar && !calendarNotificationsEnabled()) throw new Error("EMAILS_ENABLED no está activo.");

  const db = getServiceClient();
  const { data, error } = await db
    .from("bookings")
    .select("booking_date, client_name, client_email, fichas_patient_id, fichas_patients(id, name, email, resena_pedida_at)")
    .gte("booking_date", desde)
    .lte("booking_date", hasta)
    .in("status", ["confirmed", "completed"]);
  if (error) throw new Error(error.message);

  // Un destinatario por correo; se juntan los pacientes que lo comparten.
  const porCorreo = new Map<string, { nombre: string; pacientes: Set<string>; yaPedida: boolean }>();
  for (const b of (data ?? []) as unknown as Fila[]) {
    const p = b.fichas_patients;
    const correo = (p?.email || b.client_email || "").trim().toLowerCase();
    if (!correo.includes("@")) continue;
    const actual = porCorreo.get(correo) ?? { nombre: firstNameOf(p?.name || b.client_name), pacientes: new Set(), yaPedida: false };
    if (p?.id) actual.pacientes.add(p.id);
    if (p?.resena_pedida_at) actual.yaPedida = true;
    porCorreo.set(correo, actual);
  }

  const resend = enviar ? new Resend(process.env.RESEND_API_KEY) : null;
  const destinatarios: ResultadoResenas["destinatarios"] = [];
  for (const [correo, d] of porCorreo) {
    if (d.yaPedida) {
      destinatarios.push({ nombre: d.nombre, correo, estado: "ya se le pidió antes" });
      continue;
    }
    if (!resend) {
      destinatarios.push({ nombre: d.nombre, correo, estado: "se enviaría" });
      continue;
    }
    // Respeta a quienes se dieron de baja de los correos de Sakros.
    const { data: contacto } = await resend.contacts.get(correo);
    if (contacto?.unsubscribed) {
      destinatarios.push({ nombre: d.nombre, correo, estado: "dado de baja, no se envía" });
      continue;
    }
    const mail = correoResena(d.nombre, enlace);
    const { error: e } = await resend.emails.send({
      from: emailFrom("Sakros"),
      to: correo,
      replyTo: siteConfig.email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
    if (e) {
      destinatarios.push({ nombre: d.nombre, correo, estado: `error: ${e.message}` });
    } else {
      destinatarios.push({ nombre: d.nombre, correo, estado: "enviado" });
      if (d.pacientes.size) {
        await db
          .from("fichas_patients")
          .update({ resena_pedida_at: new Date().toISOString() })
          .in("id", [...d.pacientes]);
      }
    }
    await espera(600); // límite de envíos por segundo de Resend
  }

  return { desde, hasta, enviar, destinatarios };
}
