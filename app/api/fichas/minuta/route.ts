import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/equipo-auth";

// Genera UN día de la minuta (el cliente pide los 10 días en secuencia y
// muestra el progreso). La llamada a la IA va por el servidor para no
// exponer la API key en el navegador.

export const maxDuration = 60;

type Config = {
  peso: number;
  tdee: number;
  prot: number;
  carb: number;
  fat: number;
  lbl: string;
  restr: string;
};

function buildPrompt(dayNum: number, tema: string, c: Config) {
  return (
    "Nutricionista low carb psiconeuroinmunologia. " +
    `1 dia de comidas (dia ${dayNum}/10, tema: ${tema}). ` +
    `Paciente ${c.peso}kg ${c.lbl} ${c.tdee}kcal. ` +
    `MACROS: prot ${c.prot}g, hidratos MAX ${c.carb}g (LOW CARB), grasas ${c.fat}g. ` +
    (c.restr ? `Restricciones: ${c.restr}. ` : "") +
    "REGLAS DESAYUNO (contexto Chile): NUNCA salmon ni pescado en desayuno. " +
    "Desayuno proteico con: huevos (2-4 unidades, revueltos/cocidos/omelette), queso de cabra o queso de oveja, " +
    "palta, tomate, espinaca salteada. Si se necesita base: pan de almendras o tortilla de coco (low carb). " +
    "Mantener proteina del desayuno con huevos+queso, no con pescado. " +
    "ALMUERZO y CENA: salmon, atun, sardina, pollo, pavo, carne magra son bienvenidos. " +
    "PROHIBIDO siempre: azucar, pan trigo, arroz, pasta, papa, harinas, jugos, ultraprocesados. " +
    "BASE: verduras no almidonadas. GRASAS: oliva, palta, frutos secos. " +
    `Aplica tema: ${tema}. ` +
    "Si una restriccion choca con una regla (ej. sin huevo o vegano en el desayuno), la restriccion manda. " +
    "Ingredientes max 4 por comida, breves. " +
    "Responde solo JSON, sin texto adicional: " +
    `{"i":${dayNum},"t":"${tema.split(" — ")[0]}",` +
    '"b":{"n":"nombre","v":["ing1","ing2","ing3"],"p":0,"h":0,"g":0,"k":0},' +
    '"a":{"n":"nombre","v":["ing1","ing2","ing3"],"p":0,"h":0,"g":0,"k":0},' +
    '"c":{"n":"nombre","v":["ing1","ing2","ing3"],"p":0,"h":0,"g":0,"k":0},' +
    '"s":{"n":"nombre","v":["ing1"],"p":0,"h":0,"g":0,"k":0}}'
  );
}

function parseDay(text: string) {
  const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
  const s = clean.indexOf("{");
  const e = clean.lastIndexOf("}");
  if (s === -1 || e === -1) throw new Error("La respuesta no trajo JSON.");
  const json = clean.slice(s, e + 1);
  try {
    return JSON.parse(json);
  } catch {
    // Reparar saltos de línea dentro de strings
    let out = "";
    let inStr = false;
    let esc = false;
    for (const ch of json) {
      if (esc) { out += ch; esc = false; continue; }
      if (ch === "\\") { out += ch; esc = true; continue; }
      if (ch === '"') { out += ch; inStr = !inStr; continue; }
      if (inStr && (ch === "\n" || ch === "\r" || ch === "\t")) { out += " "; continue; }
      out += ch;
    }
    return JSON.parse(out);
  }
}

export async function POST(request: NextRequest) {
  const { denied } = requireStaff(request, "clinico");
  if (denied) return denied;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Falta configurar ANTHROPIC_API_KEY en Vercel para generar minutas." },
      { status: 503 }
    );
  }

  const { dayNum, tema, config } = await request.json();
  const n = parseInt(dayNum);
  if (!n || n < 1 || n > 10 || typeof tema !== "string" || !config?.peso) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
        max_tokens: 800,
        messages: [{ role: "user", content: buildPrompt(n, tema, config as Config) }],
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("Error Anthropic minuta:", data);
      return NextResponse.json({ error: "El servicio de IA no respondió bien." }, { status: 502 });
    }
    const text = (data.content || []).map((b: { text?: string }) => b.text || "").join("");
    return NextResponse.json({ day: parseDay(text) });
  } catch (err) {
    console.error("Error generando minuta:", err);
    return NextResponse.json({ error: `No se pudo generar el día ${n}.` }, { status: 500 });
  }
}
