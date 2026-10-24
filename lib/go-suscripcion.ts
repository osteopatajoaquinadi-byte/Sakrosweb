// Sakros Go: suscripción mensual con Mercado Pago (suscripciones sin plan,
// "preapproval"). Cada cobro aprobado deja el acceso activo un mes desde la
// fecha del cobro; el mes corre igual aunque no se completen los
// entrenamientos. Usa la misma cuenta que los pagos de reservas
// (MP_ACCESS_TOKEN).
import { getServiceClient } from "@/lib/supabase";

const API = "https://api.mercadopago.com";

// Versión vigente de los términos (public/go/terminos.html). Si cambian,
// súbela: se pedirá aceptarlos de nuevo antes de pagar.
export const TERMINOS_V = "2026-10";
type Db = ReturnType<typeof getServiceClient>;

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

export type Preapproval = {
  id: string;
  status: string; // pending, authorized, paused, cancelled
  external_reference?: string | null;
  payer_email?: string | null;
  init_point?: string;
  next_payment_date?: string | null;
  auto_recurring?: { transaction_amount?: number };
  summarized?: { last_charged_date?: string | null; charged_quantity?: number | null } | null;
};

// Dos planes: Prep (10 min de preparación) y Entrenamiento (programas
// completos; incluye Prep).
export type Plan = "prep" | "entrenamiento";
export const esPlan = (v: unknown): v is Plan => v === "prep" || v === "entrenamiento";
export type Venta = { precio: number; precioPrep: number; activo: boolean };

// Precios y estado de la venta: los define el coach en la app (config/venta).
// precio = Entrenamiento; precioPrep = Prep.
export async function leerVenta(db: Db): Promise<Venta> {
  const { data } = await db.from("go_docs").select("data").eq("path", "config").eq("id", "venta").maybeSingle();
  const v = (data?.data ?? {}) as { precio?: unknown; precioPrep?: unknown; activo?: unknown };
  const precio = Math.round(Number(v.precio) || 0);
  const precioPrep = Math.round(Number(v.precioPrep) || 0);
  return { precio, precioPrep, activo: v.activo === true && precio >= 1000 };
}

export function precioDe(venta: Venta, plan: Plan): number {
  return plan === "prep" ? venta.precioPrep : venta.precio;
}

// external_reference: "go:{atleta}" (Entrenamiento, también las antiguas) o "go:{atleta}|prep".
function leerReferencia(ref: string): { atleta: string; plan: Plan } | null {
  if (!ref.startsWith("go:")) return null;
  const [atleta, plan] = ref.slice(3).split("|");
  if (!atleta) return null;
  return { atleta, plan: plan === "prep" ? "prep" : "entrenamiento" };
}

export function crearSuscripcion(p: {
  atleta: string;
  email: string;
  plan: Plan;
  precio: number;
  backUrl: string;
}): Promise<Preapproval> {
  return mp<Preapproval>("/preapproval", {
    method: "POST",
    body: JSON.stringify({
      reason: p.plan === "prep" ? "Sakros Go Prep · suscripción mensual" : "Sakros Go Entrenamiento · suscripción mensual",
      external_reference: p.plan === "prep" ? `go:${p.atleta}|prep` : `go:${p.atleta}`,
      payer_email: p.email,
      back_url: p.backUrl,
      status: "pending",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: p.precio,
        currency_id: "CLP",
      },
    }),
  });
}

export function leerSuscripcion(id: string): Promise<Preapproval> {
  return mp<Preapproval>(`/preapproval/${encodeURIComponent(id)}`);
}

export function cancelarSuscripcion(id: string): Promise<Preapproval> {
  return mp<Preapproval>(`/preapproval/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({ status: "cancelled" }),
  });
}

export async function preapprovalDeCobro(authorizedPaymentId: string): Promise<string | null> {
  const ap = await mp<{ preapproval_id?: string }>(`/authorized_payments/${encodeURIComponent(authorizedPaymentId)}`);
  return ap.preapproval_id ?? null;
}

function sumarMes(fecha: Date): Date {
  const d = new Date(fecha);
  d.setMonth(d.getMonth() + 1);
  return d;
}

// Consulta la suscripción en Mercado Pago y actualiza go_accesos. Es
// idempotente: el acceso dura hasta un mes después del último cobro.
export async function sincronizarSuscripcion(db: Db, preapprovalId: string) {
  const pre = await leerSuscripcion(preapprovalId);
  const r = leerReferencia(pre.external_reference ?? "");
  if (!r) return null;
  const { atleta, plan } = r;

  const { data: actual } = await db.from("go_accesos").select("hasta, origen").eq("atleta", atleta).maybeSingle();
  let hasta = actual?.hasta ? new Date(actual.hasta) : null;

  const ultimo = pre.summarized?.last_charged_date ? new Date(pre.summarized.last_charged_date) : null;
  if (ultimo && !isNaN(+ultimo)) {
    const nuevo = sumarMes(ultimo);
    nuevo.setDate(nuevo.getDate() + 1); // un día de margen para el siguiente cobro
    if (!hasta || nuevo > hasta) hasta = nuevo;
  } else if (pre.status === "authorized") {
    // Autorizada pero el primer cobro aún no se procesa: acceso provisorio.
    const prov = new Date(Date.now() + 3 * 86400000);
    if (!hasta || prov > hasta) hasta = prov;
  }

  await db.from("go_accesos").upsert({
    atleta,
    hasta: hasta ? hasta.toISOString() : null,
    origen: ultimo || !actual?.origen ? "mercadopago" : actual.origen,
    mp_preapproval_id: pre.id,
    mp_estado: pre.status,
    plan,
    precio: pre.auto_recurring?.transaction_amount ? Math.round(pre.auto_recurring.transaction_amount) : null,
    updated_at: new Date().toISOString(),
  });
  return { atleta, hasta, estado: pre.status, plan };
}

export async function accesoActivo(db: Db, atleta: string | null): Promise<boolean> {
  if (!atleta) return false;
  const { data } = await db.from("go_accesos").select("hasta").eq("atleta", atleta).maybeSingle();
  return !!data?.hasta && new Date(data.hasta) > new Date();
}
