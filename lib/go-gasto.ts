// Sakros Go: gasto en IA (Coach Osteojuaco IA, análisis de técnica y evaluación de movimiento).
// Cada llamada al modelo suma su costo en dólares a go_gasto (por usuario y mes, hora de Chile).
// - Tope por usuario (GO_TOPE_USUARIO_USD, US$2 por defecto): al llegar, la IA se pausa hasta el mes siguiente.
//   No aplica al entrenador ni a los atletas piloto.
// - Tope total de la app (GO_TOPE_TOTAL_USD, US$20 por defecto): al llegar, la IA se pausa para todos menos
//   el entrenador. Al pasar el 80 % llega un correo de aviso (una vez por mes).
import { Resend } from "resend";
import { getServiceClient } from "@/lib/supabase";
import { emailFrom } from "@/lib/email";
import { renderBrandedEmail } from "@/lib/email-template";
import { siteConfig } from "@/lib/site-config";
import type { GoMiembro } from "@/lib/go-auth";

type Db = ReturnType<typeof getServiceClient>;

const num = (v: string | undefined, d: number) => (Number(v) > 0 ? Number(v) : d);
export const TOPE_USUARIO_USD = num(process.env.GO_TOPE_USUARIO_USD, 2);
export const TOPE_TOTAL_USD = num(process.env.GO_TOPE_TOTAL_USD, 20);

// Dólares por millón de tokens del modelo de Sakros Go (Claude Opus 5.5). Escribir en caché cuesta 1,25 veces la
// entrada; leer de la caché, US$0,20.
const PRECIO = { entrada: 4, salida: 20, cacheEscribe: 5, cacheLee: 0.2 };

type Uso = {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
};

export function costoUsd(u: Uso | null | undefined): number {
  if (!u) return 0;
  const n = (x: number | null | undefined) => (typeof x === "number" && x > 0 ? x : 0);
  return (
    (n(u.input_tokens) * PRECIO.entrada +
      n(u.output_tokens) * PRECIO.salida +
      n(u.cache_creation_input_tokens) * PRECIO.cacheEscribe +
      n(u.cache_read_input_tokens) * PRECIO.cacheLee) /
    1_000_000
  );
}

export type Cupo = { ilimitado: boolean; usuario: number; total: number };

async function esPiloto(db: Db, m: GoMiembro): Promise<boolean> {
  if (!m.atleta) return false;
  const { data } = await db.from("go_docs").select("data").eq("path", "atletas").eq("id", m.atleta).maybeSingle();
  return !!(data?.data as { piloto?: boolean } | undefined)?.piloto;
}

export async function gastoActual(db: Db, m: GoMiembro): Promise<Cupo> {
  const [{ data }, piloto] = await Promise.all([db.rpc("go_gasto_actual", { p_user: m.userId }), esPiloto(db, m)]);
  const fila = (Array.isArray(data) ? data[0] : data) as { usuario?: number | string; total?: number | string } | null;
  return { ilimitado: m.rol === "coach" || piloto, usuario: Number(fila?.usuario) || 0, total: Number(fila?.total) || 0 };
}

// null si puede usar la IA; si no, el mensaje para la persona.
export async function bloqueoPorGasto(db: Db, m: GoMiembro): Promise<string | null> {
  if (m.rol === "coach") return null;
  const c = await gastoActual(db, m);
  if (c.total >= TOPE_TOTAL_USD) {
    return "El Coach Osteojuaco IA y los análisis por video están en pausa hasta el próximo mes por el límite de uso de la app. Tu plan sigue funcionando.";
  }
  if (!c.ilimitado && c.usuario >= TOPE_USUARIO_USD) {
    return "Llegaste al límite de uso mensual del Coach Osteojuaco IA y de los análisis por video. Se renueva el día 1 del próximo mes. Tu plan sigue funcionando.";
  }
  return null;
}

// Suma el costo de una llamada y avisa por correo al pasar el 80 % (y el 100 %) del tope total.
export async function registrarGasto(db: Db, m: GoMiembro, uso: Uso | null | undefined): Promise<void> {
  const usd = costoUsd(uso);
  if (!(usd > 0)) return;
  try {
    const { data } = await db.rpc("go_sumar_gasto", { p_user: m.userId, p_usd: usd });
    const fila = (Array.isArray(data) ? data[0] : data) as { total?: number | string } | null;
    const total = Number(fila?.total) || 0;
    for (const umbral of [100, 80]) {
      if (total >= (TOPE_TOTAL_USD * umbral) / 100) {
        const { data: primera } = await db.rpc("go_marcar_aviso_gasto", { p_umbral: umbral });
        if (primera === true) await avisar(umbral, total);
        break;
      }
    }
  } catch (e) {
    console.error("Sakros Go gasto:", e);
  }
}

async function avisar(umbral: number, total: number) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const titulo = umbral >= 100 ? "La IA de Sakros Go llegó al tope del mes" : "La IA de Sakros Go va en el 80 % del tope del mes";
  const { html, text } = renderBrandedEmail({
    preheader: titulo,
    title: titulo,
    greeting: "Hola:",
    paragraphs: [
      `Este mes la IA de Sakros Go (Coach Osteojuaco IA, análisis de técnica y evaluaciones) lleva US$${total.toFixed(2)} de un tope de US$${TOPE_TOTAL_USD}.`,
      umbral >= 100
        ? "Quedó en pausa para los clientes hasta el día 1. Para subir el tope, cambia GO_TOPE_TOTAL_USD en Vercel y revisa el límite de gasto en la consola de Anthropic."
        : "Si sigue así, llegará al tope antes de fin de mes. Para subirlo, cambia GO_TOPE_TOTAL_USD en Vercel y el límite de gasto en la consola de Anthropic.",
    ],
    closing: ["Sakros Go"],
  });
  try {
    await new Resend(apiKey).emails.send({
      from: emailFrom("Sakros Go"),
      to: process.env.GO_ALERTAS_EMAIL || siteConfig.email,
      subject: `Sakros Go: ${titulo}`,
      html,
      text,
    });
  } catch (e) {
    console.error("Sakros Go aviso de gasto:", e);
  }
}
