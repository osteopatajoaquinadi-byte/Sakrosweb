import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { readSession } from "@/lib/equipo-auth";
import { enlacesSitio } from "@/lib/campanas-enlaces";

// Redacta una campaña de correo para la lista de pacientes de Sakros a
// partir de una idea breve. Devuelve el borrador; nunca envía nada.

export const maxDuration = 120;
const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";

const SCHEMA = {
  type: "object",
  properties: {
    asunto: { type: "string", description: "Asunto del correo, máximo 60 caracteres, sin emojis exagerados" },
    preheader: { type: "string", description: "Texto de vista previa, máximo 110 caracteres" },
    titulo: { type: "string", description: "Título dentro del correo" },
    cuerpo: { type: "string", description: "3 a 5 párrafos breves separados por una línea en blanco. Sin saludo ni despedida (ya los agrega la plantilla)." },
    ctaTexto: { type: "string", description: "Texto del botón, 2 a 4 palabras" },
    ctaUrl: { type: "string", description: "Una de las URLs permitidas" },
    alternativasAsunto: { type: "array", items: { type: "string" }, description: "2 asuntos alternativos" },
  },
  required: ["asunto", "preheader", "titulo", "cuerpo", "ctaTexto", "ctaUrl", "alternativasAsunto"],
  additionalProperties: false,
};

type Borrador = {
  asunto: string;
  preheader: string;
  titulo: string;
  cuerpo: string;
  ctaTexto: string;
  ctaUrl: string;
  alternativasAsunto: string[];
};

export async function POST(request: NextRequest) {
  const user = readSession(request);
  if (!user) return NextResponse.json({ error: "Sesión expirada." }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Solo administradores." }, { status: 403 });
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "La IA no está configurada." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const idea = String(body?.idea ?? "").trim().slice(0, 1500);
  const tipo = String(body?.tipo ?? "").trim().slice(0, 80);
  const tono = String(body?.tono ?? "cercano").trim().slice(0, 40);
  const audiencia = body?.segmento === "osteopatia" ? "pacientes que se han atendido en Osteopatía" : "todos los pacientes de la clínica (osteopatía, kinesiología, posturología)";
  if (!idea && !tipo) return NextResponse.json({ error: "Cuéntame de qué quieres que trate el correo." }, { status: 400 });

  const enlaces = enlacesSitio();
  const prompt = `Eres el redactor de correos de Sakros, clínica de osteopatía, kinesiología y posturología en Viña del Mar (Chile), dirigida por ${user.display_name}. Escribe un correo de marketing para ${audiencia}.

Tipo de correo: ${tipo || "libre"}
Idea o indicaciones: ${idea || "(sin indicaciones adicionales)"}
Tono: ${tono}

Reglas:
- Español de Chile, cálido y profesional, tuteo. Frases cortas, fácil de leer en el celular.
- Aporta valor real (un consejo, una explicación, una novedad); nada de promesas de curación ni afirmaciones clínicas exageradas.
- No inventes precios, descuentos, fechas ni datos que no estén en la idea.
- El cuerpo NO lleva saludo ni despedida.
- El botón debe apuntar a una de estas URLs (elige la más pertinente):
${enlaces.map((e) => `  - ${e.url} (${e.titulo})`).join("\n")}`;

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      defaultHeaders: process.env.ANTHROPIC_WORKSPACE_ID
        ? { "anthropic-workspace-id": process.env.ANTHROPIC_WORKSPACE_ID }
        : undefined,
    });
    const res = await anthropic.beta.messages.create({
      model: MODEL,
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA } },
      messages: [{ role: "user", content: prompt }],
    });
    if (res.stop_reason === "refusal") return NextResponse.json({ error: "La IA no pudo redactar este correo." }, { status: 422 });
    const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    const borrador = JSON.parse(text) as Borrador;
    if (!enlaces.some((e) => e.url === borrador.ctaUrl)) borrador.ctaUrl = enlaces[0].url;
    return NextResponse.json({ borrador });
  } catch (err) {
    console.error("IA campaña:", err);
    return NextResponse.json({ error: "No se pudo generar el borrador. Intenta de nuevo." }, { status: 502 });
  }
}
