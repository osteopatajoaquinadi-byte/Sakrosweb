// Correos al paciente según cómo pagó o va a pagar su hora. Todos usan la
// plantilla de Sakros (lib/email-template.ts).
import { changePolicy, phoneLabel, renderBrandedEmail, sessionTips } from "@/lib/email-template";
import { siteConfig, transferAccount } from "@/lib/site-config";

export type BookingInfo = {
  firstName: string;
  service: string;
  professional: string;
  dateLabel: string;
  start: string;
  end: string;
  priceClp: number;
  // Programa de Rehabilitación: reemplaza el nombre del servicio y el valor.
  program?: { label: string; price: string };
};

export type PaymentPlan =
  | { method: "online"; provider: string; payUrl?: string; holdHours?: number }
  | { method: "transfer" }
  | { method: "clinic" };

type Mail = { subject: string; html: string; text: string };

const clp = (n: number) => `$${Math.round(n).toLocaleString("es-CL")}`;
const amountOf = (b: BookingInfo) => b.program?.price ?? clp(b.priceClp);
const serviceOf = (b: BookingInfo) =>
  b.program ? `Programa de Rehabilitación Kinésica (${b.program.label})` : b.service;

function details(b: BookingInfo, extra: [string, string][] = []): [string, string][] {
  return [
    ["Servicio", serviceOf(b)],
    ["Profesional", b.professional],
    ["Fecha", b.dateLabel],
    ["Hora", `${b.start} - ${b.end}`],
    [b.program ? "Valor del programa" : "Valor", amountOf(b)],
    ...extra,
  ];
}

const signOff = (warm = false) => [
  changePolicy,
  warm ? "Te esperamos. Un abrazo," : "Un abrazo,",
  "Equipo Sakros",
];

// Correo al reservar desde la web.
export function bookingCreatedEmail(b: BookingInfo, plan: PaymentPlan): Mail {
  const hello = `Hola ${b.firstName},`;

  // Enlace de WhatsApp a la secretaria con el mensaje ya escrito.
  const receiptWa = (what: string) =>
    `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
      `Hola, envío el comprobante de ${what} de mi hora de ${serviceOf(b)} del ${b.dateLabel} a las ${b.start}.`
    )}`;

  // Mercado Pago con preferencia (holdHours): el pago se confirma solo.
  if (plan.method === "online" && plan.holdHours) {
    const r = renderBrandedEmail({
      preheader: `Tu hora del ${b.dateLabel} está reservada. Completa el pago para confirmarla.`,
      badge: { text: "Pendiente de pago", tone: "pending" },
      title: "Reservamos tu hora",
      greeting: hello,
      paragraphs: ["¡Gracias por reservar en Sakros! Tu hora quedó reservada y está pendiente de pago."],
      details: details(b),
      cta: plan.payUrl ? { label: `Pagar ${amountOf(b)} con ${plan.provider}`, href: plan.payUrl } : undefined,
      box: {
        tone: "pending",
        title: "Para confirmar tu hora",
        lines: [
          `Tienes ${plan.holdHours} horas para pagar; si no, la hora se libera automáticamente.`,
          "Apenas recibamos tu pago te enviaremos la confirmación de tu reserva.",
        ],
      },
      closing: signOff(),
    });
    return { subject: `Reservamos tu hora — falta completar el pago (${serviceOf(b)}, ${b.dateLabel})`, ...r };
  }

  // Tuu, programas y enlaces fijos: no sabemos si pagó hasta ver el comprobante.
  if (plan.method === "online") {
    const r = renderBrandedEmail({
      preheader: `Tu hora del ${b.dateLabel} está reservada. Paga y envía el comprobante a nuestra secretaria.`,
      badge: { text: "Pendiente de pago", tone: "pending" },
      title: "Reservamos tu hora",
      greeting: hello,
      paragraphs: [
        "¡Gracias por reservar en Sakros! Tu hora quedó reservada y está pendiente de pago.",
      ],
      details: details(b),
      cta: plan.payUrl ? { label: `Pagar ${amountOf(b)} con ${plan.provider}`, href: plan.payUrl } : undefined,
      box: {
        tone: "pending",
        title: "Para confirmar tu hora",
        lines: [
          ...(plan.payUrl ? [] : ["Completa el pago desde la pantalla de reserva o escríbenos al WhatsApp."]),
          `Una vez pagado, envía el comprobante a nuestra secretaria por WhatsApp al ${phoneLabel}.`,
          "Ella revisará tu pago y te confirmará la reserva.",
        ],
        link: { label: "Enviar comprobante por WhatsApp", href: receiptWa("pago") },
      },
      closing: signOff(),
    });
    return { subject: `Reservamos tu hora — paga y envía tu comprobante (${serviceOf(b)}, ${b.dateLabel})`, ...r };
  }

  if (plan.method === "transfer") {
    const r = renderBrandedEmail({
      preheader: `Tu hora del ${b.dateLabel} está reservada. Transfiere y envía el comprobante a nuestra secretaria.`,
      badge: { text: "Pendiente de pago", tone: "pending" },
      title: "Reservamos tu hora",
      greeting: hello,
      paragraphs: [
        `¡Gracias por reservar en Sakros! Tu hora quedó reservada. Para confirmarla, haz la transferencia y envía el comprobante a nuestra secretaria por WhatsApp al ${phoneLabel}.`,
      ],
      details: details(b),
      box: {
        tone: "info",
        title: "Datos para transferir",
        lines: [
          transferAccount.holder,
          `RUT: ${transferAccount.rut}`,
          transferAccount.bank,
          `N° de cuenta: ${transferAccount.number}`,
          `Monto: ${amountOf(b)}`,
        ],
      },
      cta: { label: "Enviar comprobante a la secretaria", href: receiptWa("transferencia") },
      boxFirst: true,
      closing: ["Nuestra secretaria revisará tu transferencia y te confirmará la reserva.", ...signOff()],
    });
    return { subject: `Reservamos tu hora — falta tu transferencia (${serviceOf(b)}, ${b.dateLabel})`, ...r };
  }

  const r = renderBrandedEmail({
    preheader: `Tu hora del ${b.dateLabel} a las ${b.start} está confirmada.`,
    badge: { text: "Reserva confirmada", tone: "confirmed" },
    title: "Tu hora está confirmada",
    greeting: hello,
    paragraphs: ["¡Gracias por reservar en Sakros! Tu hora quedó confirmada."],
    details: details(b, [["Pago", "En la clínica, el día de tu sesión"]]),
    tips: sessionTips,
    closing: signOff(true),
  });
  return { subject: `Reserva confirmada — ${serviceOf(b)}, ${b.dateLabel}`, ...r };
}

// Segundo correo: se recibió el pago (Mercado Pago o marcado en el panel).
export function paymentReceivedEmail(
  b: BookingInfo,
  payment: { amount?: number | null; method: string; reference?: string | null }
): Mail {
  const paid = payment.amount ? clp(payment.amount) : amountOf(b);
  const r = renderBrandedEmail({
    preheader: `Recibimos tu pago. Tu hora del ${b.dateLabel} a las ${b.start} está confirmada.`,
    badge: { text: "Confirmada · Pago recibido", tone: "confirmed" },
    title: "¡Gracias! Tu hora está confirmada",
    greeting: `Hola ${b.firstName},`,
    paragraphs: ["¡Muchas gracias! Recibimos tu pago y tu hora quedó confirmada."],
    details: [
      ["Servicio", serviceOf(b)],
      ["Profesional", b.professional],
      ["Fecha", b.dateLabel],
      ["Hora", `${b.start} - ${b.end}`],
      ["Pago recibido", `${paid} · ${payment.method}${payment.reference ? ` (${payment.reference})` : ""}`],
    ],
    tips: sessionTips,
    closing: signOff(true),
  });
  return { subject: `Reserva confirmada y pago recibido — ${serviceOf(b)}, ${b.dateLabel}`, ...r };
}

// Reserva agendada por el equipo desde el panel (una hora o un programa).
export function panelBookingEmail(
  b: Omit<BookingInfo, "dateLabel" | "priceClp"> & { dates: string[] }
): Mail {
  const isProgram = b.dates.length > 1;
  const r = renderBrandedEmail({
    preheader: isProgram
      ? `Agendamos tus ${b.dates.length} sesiones en Sakros.`
      : `Tu hora del ${b.dates[0]} a las ${b.start} está agendada.`,
    badge: { text: "Reserva confirmada", tone: "confirmed" },
    title: isProgram ? `Agendamos tu programa de ${b.dates.length} sesiones` : "Tu hora está agendada",
    greeting: `Hola ${b.firstName},`,
    paragraphs: [
      isProgram
        ? "Estas son las fechas de tus sesiones en Sakros:"
        : "Agendamos tu hora en Sakros. Estos son los datos:",
    ],
    details: [
      ["Servicio", b.service],
      ["Profesional", b.professional],
      ["Hora", `${b.start} - ${b.end}`],
      ...(isProgram ? [] : ([["Fecha", b.dates[0]]] as [string, string][])),
    ],
    list: isProgram ? { title: "Fechas", items: b.dates } : undefined,
    tips: sessionTips,
    closing: signOff(true),
  });
  return {
    subject: isProgram
      ? `Tu programa en Sakros — ${b.service}, ${b.dates.length} sesiones`
      : `Tu hora en Sakros — ${b.service}, ${b.dates[0]}`,
    ...r,
  };
}

// Recordatorio del día anterior.
export function reminderEmail(b: Omit<BookingInfo, "priceClp" | "end"> & { end?: string }): Mail {
  const r = renderBrandedEmail({
    preheader: `Mañana a las ${b.start} tienes ${b.service} en Sakros.`,
    badge: { text: "Recordatorio", tone: "info" },
    title: "Te esperamos mañana",
    greeting: `Hola ${b.firstName},`,
    paragraphs: [`Te recordamos tu hora de mañana, ${b.dateLabel}.`],
    details: [
      ["Servicio", b.service],
      ...(b.professional ? ([["Profesional", b.professional]] as [string, string][]) : []),
      ["Hora", b.end ? `${b.start} - ${b.end}` : b.start],
      ["Dirección", `${siteConfig.address.street}, ${siteConfig.address.city}`],
    ],
    tips: sessionTips,
    closing: signOff(true),
  });
  return { subject: `Recordatorio: mañana tienes ${b.service} a las ${b.start} en Sakros`, ...r };
}
