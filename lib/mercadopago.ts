// Pago online automático con Mercado Pago (Checkout Pro). Se activa con:
//   MP_ACCESS_TOKEN     credencial de producción ("Access Token") de la cuenta
//   MP_WEBHOOK_SECRET   clave secreta de las notificaciones (Webhooks), opcional
//                       pero recomendada: valida que el aviso viene de Mercado Pago
// Cada reserva genera su propio cobro con external_reference = id de la reserva.
import { createHmac, timingSafeEqual } from "node:crypto";

const API = "https://api.mercadopago.com";

// Plazo para pagar antes de que la hora se libere.
export const PAYMENT_HOLD_MINUTES = 120;

export function mercadoPagoEnabled(): boolean {
  return Boolean(process.env.MP_ACCESS_TOKEN);
}

async function mp<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Mercado Pago ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export async function createCheckout(p: {
  bookingId: string;
  title: string;
  amount: number;
  payerEmail: string;
  payerName: string;
  siteUrl: string;
  expiresAt: Date;
}): Promise<{ id: string; url: string }> {
  const pref = await mp<{ id: string; init_point: string }>("/checkout/preferences", {
    method: "POST",
    headers: { "X-Idempotency-Key": `booking-${p.bookingId}` },
    body: JSON.stringify({
      items: [{ id: p.bookingId, title: p.title, quantity: 1, unit_price: p.amount, currency_id: "CLP" }],
      payer: { email: p.payerEmail, name: p.payerName },
      external_reference: p.bookingId,
      notification_url: `${p.siteUrl}/api/pagos/mercadopago`,
      back_urls: {
        success: `${p.siteUrl}/reserva?pago=ok`,
        pending: `${p.siteUrl}/reserva?pago=pendiente`,
        failure: `${p.siteUrl}/reserva?pago=error`,
      },
      auto_return: "approved",
      statement_descriptor: "SAKROS",
      // Solo medios de pago inmediatos: sin cupones de pago en efectivo,
      // que quedarían pendientes después de liberar la hora.
      payment_methods: { excluded_payment_types: [{ id: "ticket" }, { id: "atm" }] },
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: p.expiresAt.toISOString(),
    }),
  });
  return { id: pref.id, url: pref.init_point };
}

export type MpPayment = {
  id: number;
  status: string; // approved, pending, in_process, rejected, refunded, cancelled, charged_back
  transaction_amount: number;
  external_reference: string | null;
  description: string | null;
  payer?: { email?: string | null };
  date_approved?: string | null;
};

export function getPayment(id: string): Promise<MpPayment> {
  return mp<MpPayment>(`/v1/payments/${encodeURIComponent(id)}`);
}

// Valida la firma x-signature de la notificación. Sin MP_WEBHOOK_SECRET se
// acepta: igual se consulta el pago a la API, así que un aviso falso no
// puede marcar nada como pagado.
export function validSignature(headers: Headers, dataId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true;
  const signature = headers.get("x-signature") ?? "";
  const requestId = headers.get("x-request-id") ?? "";
  const parts = Object.fromEntries(
    signature.split(",").map((kv) => kv.split("=").map((s) => s.trim()) as [string, string])
  );
  if (!parts.ts || !parts.v1) return false;
  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${parts.ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(parts.v1);
  return a.length === b.length && timingSafeEqual(a, b);
}
