// Sakros Go: suscripción mensual o anual con Mercado Pago (suscripciones sin plan,
// "preapproval"). Cada cobro aprobado deja el acceso activo un mes (o 12 meses, si es
// anual) desde la fecha del cobro; el mes corre igual aunque no se completen los
// entrenamientos. Usa la misma cuenta que los pagos de reservas
// (MP_ACCESS_TOKEN).
import { getServiceClient } from "@/lib/supabase";

const API = "https://api.mercadopago.com";

// Versión vigente de los términos (public/go/terminos.html). Si cambian,
// súbela: se pedirá aceptarlos de nuevo antes de pagar.
export const TERMINOS_V = "2026-12";
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
export type Periodo = "mes" | "anual";
export const esPeriodo = (v: unknown): v is Periodo => v === "mes" || v === "anual";
export type Venta = {
  precio: number;
  precioPrep: number;
  precioAnual: number;
  precioPrepAnual: number;
  // Precio beta: la app aún muestra animaciones en algunos ejercicios mientras se graban los videos.
  beta: boolean;
  activo: boolean;
};

// Precios y estado de la venta: los define el coach en la app (config/venta).
// precio = Entrenamiento mensual; precioPrep = Prep mensual; *Anual = pago anual (0 = sin plan anual).
export async function leerVenta(db: Db): Promise<Venta> {
  const { data } = await db.from("go_docs").select("data").eq("path", "config").eq("id", "venta").maybeSingle();
  const v = (data?.data ?? {}) as Record<string, unknown>;
  const n = (x: unknown) => Math.round(Number(x) || 0);
  const precio = n(v.precio);
  return {
    precio,
    precioPrep: n(v.precioPrep),
    precioAnual: n(v.precioAnual),
    precioPrepAnual: n(v.precioPrepAnual),
    beta: v.beta === true,
    activo: v.activo === true && precio >= 1000,
  };
}

export function precioDe(venta: Venta, plan: Plan, periodo: Periodo = "mes"): number {
  if (periodo === "anual") return plan === "prep" ? venta.precioPrepAnual : venta.precioAnual;
  return plan === "prep" ? venta.precioPrep : venta.precio;
}

// external_reference: "go:{atleta}" (Entrenamiento mensual, también las antiguas), con "|prep" para Prep
// y "|anual" para el pago anual (ej. "go:abc|prep|anual").
function leerReferencia(ref: string): { atleta: string; plan: Plan; periodo: Periodo } | null {
  if (!ref.startsWith("go:")) return null;
  const [atleta, ...resto] = ref.slice(3).split("|");
  if (!atleta) return null;
  return { atleta, plan: resto.includes("prep") ? "prep" : "entrenamiento", periodo: resto.includes("anual") ? "anual" : "mes" };
}

export function crearSuscripcion(p: {
  atleta: string;
  email: string;
  plan: Plan;
  periodo?: Periodo;
  precio: number;
  backUrl: string;
}): Promise<Preapproval> {
  const anual = p.periodo === "anual";
  return mp<Preapproval>("/preapproval", {
    method: "POST",
    body: JSON.stringify({
      reason: `Sakros Go ${p.plan === "prep" ? "Prep" : "Entrenamiento"} · suscripción ${anual ? "anual" : "mensual"}`,
      external_reference: `go:${p.atleta}${p.plan === "prep" ? "|prep" : ""}${anual ? "|anual" : ""}`,
      payer_email: p.email,
      back_url: p.backUrl,
      status: "pending",
      auto_recurring: {
        frequency: anual ? 12 : 1,
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

function sumarMeses(fecha: Date, meses: number): Date {
  const d = new Date(fecha);
  d.setMonth(d.getMonth() + meses);
  return d;
}

// Consulta la suscripción en Mercado Pago y actualiza go_accesos. Es
// idempotente: el acceso dura hasta un mes (12 si es anual) después del último cobro.
export async function sincronizarSuscripcion(db: Db, preapprovalId: string) {
  const pre = await leerSuscripcion(preapprovalId);
  const r = leerReferencia(pre.external_reference ?? "");
  if (!r) return null;
  const { atleta, plan, periodo } = r;

  const { data: actual } = await db.from("go_accesos").select("hasta, origen").eq("atleta", atleta).maybeSingle();
  let hasta = actual?.hasta ? new Date(actual.hasta) : null;

  const ultimo = pre.summarized?.last_charged_date ? new Date(pre.summarized.last_charged_date) : null;
  if (ultimo && !isNaN(+ultimo)) {
    const nuevo = sumarMeses(ultimo, periodo === "anual" ? 12 : 1);
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
