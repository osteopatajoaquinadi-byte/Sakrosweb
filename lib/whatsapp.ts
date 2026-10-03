// Envío por la API de WhatsApp Business (Meta Cloud API). Se activa con:
//   WHATSAPP_TOKEN            token permanente de un usuario del sistema
//   WHATSAPP_PHONE_NUMBER_ID  id del número que envía
//   WHATSAPP_TEMPLATE         plantilla aprobada (por defecto "recordatorio_cita")
// Meta exige plantillas aprobadas para escribir primero a un paciente.

const GRAPH = "https://graph.facebook.com/v21.0";

export function whatsappEnabled(): boolean {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

// Normaliza a formato internacional chileno sin "+": 569XXXXXXXX.
export function normalizeChileanPhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.length === 8) d = "569" + d; // 8 dígitos sin el 9
  if (d.length === 9 && d.startsWith("9")) d = "56" + d;
  return /^569\d{8}$/.test(d) ? d : null;
}

export async function sendWhatsappTemplate(
  to: string,
  params: string[]
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`${GRAPH}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: process.env.WHATSAPP_TEMPLATE || "recordatorio_cita",
        language: { code: "es" },
        components: [
          { type: "body", parameters: params.map((text) => ({ type: "text", text })) },
        ],
      },
    }),
  });
  if (res.ok) return { ok: true };
  return { ok: false, error: `${res.status} ${await res.text()}` };
}
