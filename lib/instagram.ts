import { createHmac, timingSafeEqual } from "node:crypto";

// Cliente mínimo de la API de mensajería de Instagram (Meta Graph API).
// Variables de entorno (Vercel):
//   IG_ACCESS_TOKEN  token de la cuenta de Instagram profesional
//   IG_APP_SECRET    secreto de la app de Meta (verifica la firma del webhook)
//   IG_VERIFY_TOKEN  texto libre que se ingresa al registrar el webhook en Meta
//   IG_ACCOUNT_ID    id de la cuenta de Instagram (opcional, por defecto "me")
//   IG_GRAPH_BASE    opcional, por defecto https://graph.instagram.com/v21.0

const base = () => process.env.IG_GRAPH_BASE || "https://graph.instagram.com/v21.0";
const account = () => process.env.IG_ACCOUNT_ID || "me";

export function instagramConfigured(): boolean {
  return Boolean(process.env.IG_ACCESS_TOKEN && process.env.IG_APP_SECRET);
}

// Verifica X-Hub-Signature-256 (HMAC SHA-256 del cuerpo con el app secret).
export function verifySignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.IG_APP_SECRET;
  if (!secret || !header?.startsWith("sha256=")) return false;
  const expected = Buffer.from(
    "sha256=" + createHmac("sha256", secret).update(rawBody).digest("hex")
  );
  const given = Buffer.from(header);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

async function post(path: string, body: unknown): Promise<void> {
  const res = await fetch(`${base()}/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.IG_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Instagram API ${res.status}: ${await res.text()}`);
  }
}

// Instagram corta los mensajes de más de 1000 caracteres.
function chunks(text: string, size = 990): string[] {
  const out: string[] = [];
  let rest = text;
  while (rest.length > size) {
    const cut = rest.lastIndexOf("\n", size) > 200 ? rest.lastIndexOf("\n", size) : size;
    out.push(rest.slice(0, cut));
    rest = rest.slice(cut).trimStart();
  }
  out.push(rest);
  return out;
}

export async function sendDirectMessage(recipientId: string, text: string): Promise<void> {
  for (const part of chunks(text)) {
    await post(`${account()}/messages`, {
      recipient: { id: recipientId },
      message: { text: part },
    });
  }
}

// Respuesta privada a un comentario (abre la conversación por DM).
export async function sendPrivateReply(commentId: string, text: string): Promise<void> {
  await post(`${account()}/messages`, {
    recipient: { comment_id: commentId },
    message: { text: text.slice(0, 990) },
  });
}

export async function replyToComment(commentId: string, text: string): Promise<void> {
  await post(`${commentId}/replies`, { message: text });
}
