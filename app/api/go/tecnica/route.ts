import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { goMiembro } from "@/lib/go-auth";
import { errorServidor } from "@/lib/go-errores";
import { bloqueoPorGasto, registrarGasto } from "@/lib/go-gasto";

// Revisión de técnica de cualquier ejercicio de Sakros Go a partir de cuadros
// extraídos de un video casero. El navegador saca los cuadros (no se sube el video)
// y manda el nombre, la prescripción y las instrucciones del ejercicio.
// Comparte el límite diario con el análisis del FMS. Además, un cliente tiene un máximo de
// análisis por semana (TECNICA_SEMANA). Prep no incluye revisión de técnica; los atletas piloto
// (ficha con piloto: true) y el entrenador no tienen límite semanal.

export const maxDuration = 60;

const MODEL = process.env.GO_MODEL || process.env.ANTHROPIC_MODEL || "claude-opus-5-5";
const LIMITE = { coach: 300, cliente: 25 };
const TECNICA_SEMANA = 3;

type Cupo = { ilimitado: boolean; prep: boolean };
async function cupoDe(m: { rol: string; atleta: string | null }): Promise<Cupo> {
  if (m.rol === "coach" || !m.atleta) return { ilimitado: m.rol === "coach", prep: false };
  const { data } = await getServiceClient().from("go_docs").select("data").eq("path", "atletas").eq("id", m.atleta).maybeSingle();
  const a = (data?.data || {}) as { piloto?: boolean; programa?: string };
  return { ilimitado: !!a.piloto, prep: a.programa === "prep" };
}

// Cuántos análisis de técnica le quedan esta semana (para el contador de la app).
export async function GET(request: NextRequest) {
  const m = await goMiembro(request);
  if (!m) return NextResponse.json({ error: "Inicia sesión de nuevo.", code: "not_granted" }, { status: 401 });
  const c = await cupoDe(m);
  if (c.ilimitado) return NextResponse.json({ ilimitado: true });
  const { data: usadas } = await getServiceClient().rpc("go_tecnica_usadas", { p_user: m.userId });
  return NextResponse.json({ max: TECNICA_SEMANA, usadas: Number(usadas) || 0, prep: c.prep });
}
const MAX_CUADROS = 12;
const MAX_CUADRO_B64 = 400_000;

const limpia = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";
const lista = (v: unknown, n: number, max: number) =>
  Array.isArray(v) ? v.map((x) => limpia(x, max)).filter(Boolean).slice(0, n) : [];

export async function POST(request: NextRequest) {
  const m = await goMiembro(request);
  if (!m) return NextResponse.json({ error: "Inicia sesión de nuevo.", code: "not_granted" }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Falta ANTHROPIC_API_KEY.", code: "sampling_disabled" }, { status: 503 });
  }

  const raw = await request.text();
  if (raw.length > 4_000_000) return NextResponse.json({ error: "Los cuadros pesan demasiado." }, { status: 413 });
  let body: { nombre?: unknown; pres?: unknown; pasos?: unknown; clave?: unknown; cuadros?: unknown; sexo?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const nombre = limpia(body.nombre, 120);
  if (!nombre) return NextResponse.json({ error: "Falta el ejercicio." }, { status: 400 });
  const pasos = lista(body.pasos, 10, 400);
  const cuadros = Array.isArray(body.cuadros) ? body.cuadros : [];
  if (!cuadros.length || cuadros.length > MAX_CUADROS || cuadros.some((x) => typeof x !== "string" || x.length > MAX_CUADRO_B64 || !/^[A-Za-z0-9+/=]+$/.test(x))) {
    return NextResponse.json({ error: "Cuadros inválidos." }, { status: 400 });
  }

  const db = getServiceClient();
  const pausa = await bloqueoPorGasto(db, m);
  if (pausa) return NextResponse.json({ error: pausa, code: "limite_mensual" }, { status: 429 });
  const cupo = await cupoDe(m);
  if (cupo.prep) {
    return NextResponse.json({ error: "La revisión de técnica es parte del plan Entrenamiento.", code: "no_incluido" }, { status: 403 });
  }
  let usadas: number | null = null;
  if (!cupo.ilimitado) {
    const { data: n } = await db.rpc("go_usar_tecnica", { p_user: m.userId, p_max: TECNICA_SEMANA });
    if (n === -1) {
      return NextResponse.json({ error: `Ya usaste tus ${TECNICA_SEMANA} análisis de esta semana. Se renuevan el lunes.`, code: "limite_semanal" }, { status: 429 });
    }
    usadas = typeof n === "number" ? n : null;
  }
  const devolver = async () => {
    if (usadas != null) await db.rpc("go_devolver_tecnica", { p_user: m.userId });
  };
  const { data: permitido } = await db.rpc("go_usar_fms", { p_user: m.userId, p_max: LIMITE[m.rol] });
  if (permitido === false) {
    await devolver();
    return NextResponse.json({ error: "Llegaste al límite de análisis de hoy. Sigue mañana.", code: "limite_diario" }, { status: 429 });
  }

  const sexo = body.sexo === "M" ? "mujer" : body.sexo === "H" ? "hombre" : "no declarado";
  const content: Anthropic.Beta.BetaContentBlockParam[] = [
    {
      type: "text",
      text:
        `Eres el kinesiólogo y entrenador de Sakros Go y revisas la técnica de un cliente a partir de cuadros (en orden temporal) de un video casero. ` +
        `Ejercicio: ${nombre}. Prescripción de hoy: ${limpia(body.pres, 160) || "sin dato"}. Sexo: ${sexo}.\n` +
        `Cómo se hace (instrucciones que la persona tiene en la app):\n- ${pasos.join("\n- ") || "sin instrucciones"}\n` +
        (limpia(body.clave, 300) ? `Clave del ejercicio: ${limpia(body.clave, 300)}\n` : "") +
        `Evalúa solo lo que se ve. Prioriza la seguridad (columna, rodillas, hombros) y los puntos de control de las instrucciones. ` +
        `Si los cuadros no permiten evaluar (cámara mal ubicada, cuerpo cortado, poca luz o es otro ejercicio), dilo en «regrabar» y deja las listas vacías. ` +
        `No diagnostiques: si ves algo que sugiere dolor o una lesión, recomienda comentarlo con su kinesiólogo. ` +
        `Escribe en español latinoamericano neutro, con tuteo, frases cortas y simples, dirigidas a la persona.\n` +
        `Responde solo con este JSON: {"bien":["lo que hace bien, máx. 3"],"corregir":["qué corregir y cómo, máx. 3, lo más importante primero"],"clave":"1 indicación para la próxima serie","seguridad":"" ,"confianza":"alta"|"media"|"baja","regrabar":""}`,
    },
    ...cuadros.map((b64) => ({ type: "image" as const, source: { type: "base64" as const, media_type: "image/jpeg" as const, data: b64 as string } })),
  ];

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    defaultHeaders: process.env.ANTHROPIC_WORKSPACE_ID ? { "anthropic-workspace-id": process.env.ANTHROPIC_WORKSPACE_ID } : undefined,
  });

  try {
    const res = await anthropic.beta.messages.create({
      model: MODEL,
      max_tokens: 3000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium" },
      messages: [{ role: "user", content }],
    });
    await registrarGasto(db, m, res.usage);
    const texto = res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    const i = texto.indexOf("{"), j = texto.lastIndexOf("}");
    if (i < 0 || j < i) throw new Error("Respuesta sin JSON");
    const r = JSON.parse(texto.slice(i, j + 1)) as Record<string, unknown>;
    return NextResponse.json({
      bien: lista(r.bien, 3, 300),
      corregir: lista(r.corregir, 3, 300),
      clave: limpia(r.clave, 300),
      seguridad: limpia(r.seguridad, 300),
      confianza: ["alta", "media", "baja"].includes(String(r.confianza)) ? r.confianza : "baja",
      regrabar: limpia(r.regrabar, 400),
      ...(usadas != null ? { cupo: { max: TECNICA_SEMANA, usadas } } : {}),
    });
  } catch (e) {
    await devolver();
    if (e instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Demasiadas consultas seguidas. Inténtalo en un minuto.", code: "rate_limited" }, { status: 429 });
    }
    console.error("Sakros Go técnica:", e);
    await errorServidor("Revisión de técnica", e, m);
    return NextResponse.json({ error: "No se pudo analizar el video. Inténtalo de nuevo." }, { status: 502 });
  }
}
