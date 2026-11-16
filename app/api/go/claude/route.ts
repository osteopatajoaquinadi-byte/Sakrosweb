import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { goMiembro } from "@/lib/go-auth";
import { TOPE_USUARIO_USD, bloqueoPorGasto, gastoActual, registrarGasto } from "@/lib/go-gasto";
import { accesoActivo } from "@/lib/go-suscripcion";
import { errorServidor } from "@/lib/go-errores";

// Coach de Sakros Go. La página arma la conversación y ejecuta sus propias
// herramientas (ajustar la prescripción); aquí solo se valida la sesión, se
// aplica el límite diario y se llama a Claude sin exponer la API key.

export const maxDuration = 60;

const MODEL = process.env.GO_MODEL || process.env.ANTHROPIC_MODEL || "claude-opus-5-5";
const TOOLS_PERMITIDAS = new Set(["ajustar_prescripcion", "quitar_ajuste"]);
// Llamadas a Claude por día y por persona (cada vuelta con herramientas
// cuenta una): así el costo del Coach queda acotado.
const LIMITE = { coach: 400, suscriptor: 40, prueba: 5 };

// El primer mensaje lleva las reglas y los datos del atleta, iguales en toda la conversación: se marca para caché.
function conCache(msgs: Anthropic.Beta.BetaMessageParam[]): Anthropic.Beta.BetaMessageParam[] {
  const [primero, ...resto] = msgs;
  if (!primero || primero.role !== "user" || typeof primero.content !== "string") return msgs;
  return [{ role: "user", content: [{ type: "text", text: primero.content, cache_control: { type: "ephemeral" } }] }, ...resto];
}

// Uso de la IA este mes y límites, para mostrarlos en la app.
export async function GET(request: NextRequest) {
  const m = await goMiembro(request);
  if (!m) return NextResponse.json({ error: "Inicia sesión de nuevo.", code: "not_granted" }, { status: 401 });
  const db = getServiceClient();
  const c = await gastoActual(db, m);
  const tipo = m.rol === "coach" ? "coach" : (await accesoActivo(db, m.atleta)) ? "suscriptor" : "prueba";
  return NextResponse.json({
    ilimitado: c.ilimitado,
    mensajesDia: LIMITE[tipo],
    usoMes: c.ilimitado ? null : Math.min(100, Math.round((c.usuario / TOPE_USUARIO_USD) * 100)),
  });
}

export async function POST(request: NextRequest) {
  const m = await goMiembro(request);
  if (!m) return NextResponse.json({ error: "Inicia sesión de nuevo.", code: "not_granted" }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Falta ANTHROPIC_API_KEY.", code: "sampling_disabled" }, { status: 503 });
  }

  const raw = await request.text();
  if (raw.length > 400_000) {
    return NextResponse.json({ error: "Conversación demasiado larga.", code: "prompt_too_large" }, { status: 413 });
  }
  let body: { messages?: unknown; tools?: unknown; json?: boolean };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 80) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const tools = (Array.isArray(body.tools) ? body.tools : [])
    .filter((t): t is { name: string; description: string; input_schema: Record<string, unknown> } =>
      !!t && typeof t === "object" && TOOLS_PERMITIDAS.has((t as { name?: string }).name ?? ""))
    .map((t) => ({ name: t.name, description: String(t.description || ""), input_schema: t.input_schema }));

  const db = getServiceClient();
  const pausa = await bloqueoPorGasto(db, m);
  if (pausa) return NextResponse.json({ error: pausa, code: "limite_mensual" }, { status: 429 });
  const tipo = m.rol === "coach" ? "coach" : (await accesoActivo(db, m.atleta)) ? "suscriptor" : "prueba";
  const { data: permitido } = await db.rpc("go_usar", { p_user: m.userId, p_max: LIMITE[tipo] });
  if (permitido === false) {
    return NextResponse.json(
      {
        error: tipo === "prueba" ? "En la prueba gratis el Coach tiene 5 mensajes al día." : "Llegaste al límite de mensajes de hoy.",
        code: tipo === "prueba" ? "limite_prueba" : "limite_diario",
      },
      { status: 429 },
    );
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    defaultHeaders: process.env.ANTHROPIC_WORKSPACE_ID
      ? { "anthropic-workspace-id": process.env.ANTHROPIC_WORKSPACE_ID }
      : undefined,
  });

  try {
    const res = await anthropic.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: body.json ? "medium" : "low" },
      // Reutiliza el contexto entre mensajes: el primero (reglas + datos del atleta) queda en caché, y la caché
      // automática guarda además la conversación hasta el último mensaje.
      cache_control: { type: "ephemeral" },
      messages: conCache(body.messages as Anthropic.Beta.BetaMessageParam[]),
      ...(tools.length ? { tools: tools as Anthropic.Beta.BetaTool[] } : {}),
    });
    await registrarGasto(db, m, res.usage);
    return NextResponse.json({ content: res.content, stop_reason: res.stop_reason });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Demasiadas consultas seguidas.", code: "rate_limited" }, { status: 429 });
    }
    if (e instanceof Anthropic.APIError) {
      console.error("Sakros Go Claude:", e.status, e.message);
      await errorServidor("Coach IA", e, m);
      return NextResponse.json({ error: "No se pudo completar la respuesta." }, { status: 502 });
    }
    console.error("Sakros Go Claude:", e);
    await errorServidor("Coach IA", e, m);
    return NextResponse.json({ error: "No se pudo completar la respuesta." }, { status: 500 });
  }
}
