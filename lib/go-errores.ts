import { Resend } from "resend";
import { getServiceClient } from "@/lib/supabase";
import { emailFrom } from "@/lib/email";
import { renderBrandedEmail } from "@/lib/email-template";
import { siteConfig } from "@/lib/site-config";

// Registro de errores de Sakros Go: guarda cada error en go_errores y, como
// máximo una vez por hora, avisa por correo al entrenador con el resumen.
// Nunca lanza: si el registro falla, la app sigue funcionando igual.

export type ErrorGo = {
  origen: "app" | "servidor";
  tipo: string;
  mensaje: string;
  detalle?: string | null;
  url?: string | null;
  ua?: string | null;
  version?: string | null;
  atleta?: string | null;
  userId?: string | null;
  rol?: string | null;
};

const corta = (s: unknown, n: number) => (s == null ? null : String(s).slice(0, n));
const AVISO_CADA_MIN = 60;

export async function registrarError(e: ErrorGo): Promise<void> {
  try {
    const db = getServiceClient();
    const fila = {
      origen: e.origen,
      tipo: corta(e.tipo, 40) || "error",
      mensaje: corta(e.mensaje, 500) || "(sin mensaje)",
      detalle: corta(e.detalle, 4000),
      url: corta(e.url, 300),
      ua: corta(e.ua, 300),
      version: corta(e.version, 40),
      atleta: corta(e.atleta, 60),
      user_id: e.userId || null,
      rol: corta(e.rol, 20),
    };
    const { data: nuevo, error } = await db.from("go_errores").insert(fila).select("id").single();
    if (error || !nuevo) {
      console.error("Sakros Go errores (insert):", error?.message);
      return;
    }
    await avisarSiCorresponde(db, nuevo.id as number);
  } catch (err) {
    console.error("Sakros Go errores:", err);
  }
}

async function avisarSiCorresponde(db: ReturnType<typeof getServiceClient>, id: number) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const desde = new Date(Date.now() - AVISO_CADA_MIN * 60_000).toISOString();
  const { count: avisados } = await db
    .from("go_errores")
    .select("id", { count: "exact", head: true })
    .eq("alertado", true)
    .gte("created_at", desde);
  if ((avisados ?? 0) > 0) return;
  // Marca este error como el del aviso antes de enviar, para no mandar dos correos a la vez.
  await db.from("go_errores").update({ alertado: true }).eq("id", id);
  const { data: recientes } = await db
    .from("go_errores")
    .select("created_at, origen, tipo, mensaje, atleta")
    .gte("created_at", desde)
    .order("created_at", { ascending: false })
    .limit(8);
  const lista = (recientes ?? []).map(
    (r) =>
      `• ${new Date(r.created_at as string).toLocaleString("es-CL", { timeZone: "America/Santiago" })} · ${r.origen}/${r.tipo}` +
      `${r.atleta ? " · atleta " + r.atleta : ""}\n  ${r.mensaje}`,
  );
  const { html, text } = renderBrandedEmail({
    preheader: "Hubo un error en Sakros Go",
    title: "Error en Sakros Go",
    greeting: "Hola:",
    paragraphs: [
      "La app registró un error. Estos son los últimos de la hora:",
      lista.join("\n\n") || "(sin detalle)",
      `Te aviso como máximo una vez por hora. El detalle completo queda guardado en la tabla go_errores de Supabase.`,
    ],
    closing: ["Sakros Go"],
  });
  const to = process.env.GO_ALERTAS_EMAIL || siteConfig.email;
  await new Resend(apiKey).emails
    .send({ from: emailFrom("Sakros Go"), to, subject: "Sakros Go: se registró un error", html, text })
    .catch((err: unknown) => console.error("Sakros Go errores (aviso):", err));
}

// Atajo para las rutas del servidor: registra un error con su lugar de origen.
export async function errorServidor(
  lugar: string,
  e: unknown,
  quien?: { atleta?: string | null; userId?: string | null; rol?: string | null } | null,
): Promise<void> {
  const err = e as { message?: unknown; stack?: unknown; status?: unknown } | null;
  const msg = err && typeof err === "object" && err.message ? String(err.message) : String(e);
  await registrarError({
    origen: "servidor",
    tipo: "api",
    mensaje: `${lugar}: ${msg}`,
    detalle: err && typeof err === "object" ? [err.status ? "status " + String(err.status) : "", err.stack ? String(err.stack) : ""].filter(Boolean).join("\n") : null,
    atleta: quien?.atleta ?? null,
    userId: quien?.userId ?? null,
    rol: quien?.rol ?? null,
  });
}
