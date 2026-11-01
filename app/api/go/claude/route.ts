import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { goMiembro } from "@/lib/go-auth";
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
      messages: body.messages as Anthropic.Beta.BetaMessageParam[],
      ...(tools.length ? { tools: tools as Anthropic.Beta.BetaTool[] } : {}),
    });
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
