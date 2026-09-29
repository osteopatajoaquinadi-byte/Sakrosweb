import { NextRequest, NextResponse } from "next/server";
import { verifyPin } from "@/lib/equipo-auth";

export async function POST(request: NextRequest) {
  const denied = verifyPin(request);
  if (denied) return denied;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY no configurada en el servidor." },
      { status: 500 },
    );
  }

  const { dayNum, tema, config } = await request.json();

  if (!dayNum || !tema || !config) {
    return NextResponse.json(
      { error: "Faltan parámetros: dayNum, tema, config." },
      { status: 400 },
    );
  }

  const prompt =
    `Nutricionista low carb psiconeuroinmunologia. ` +
    `1 dia de comidas (dia ${dayNum}/10, tema: ${tema}). ` +
    `Paciente ${config.peso}kg ${config.lbl} ${config.tdee}kcal. ` +
    `MACROS: prot ${config.prot}g, hidratos MAX ${config.carb}g (LOW CARB), grasas ${config.fat}g. ` +
    (config.restr ? `Restricciones:${config.restr}. ` : "") +
    `REGLAS DESAYUNO (contexto Chile): NUNCA salmon ni pescado en desayuno. ` +
    `Desayuno proteico con: huevos (2-4 unidades, revueltos/cocidos/omelette), queso de cabra o queso de oveja, ` +
    `palta, tomate, espinaca salteada. Si se necesita base: pan de almendras o tortilla de coco (low carb). ` +
    `Mantener proteina del desayuno con huevos+queso, no con pescado. ` +
    `ALMUERZO y CENA: salmon, atun, sardina, pollo, pavo, carne magra son bienvenidos. ` +
    `PROHIBIDO siempre: azucar, pan trigo, arroz, pasta, papa, harinas, jugos, ultraprocesados. ` +
    `BASE: verduras no almidonadas. GRASAS: oliva, palta, frutos secos. ` +
    `Aplica tema: ${tema}. ` +
    `Ingredientes max 4 por comida, breves. Sin acentos especiales. ` +
    `Solo JSON: ` +
    `{"i":${dayNum},"t":"${tema.split(" — ")[0]}",` +
    `"b":{"n":"nombre","v":["ing1","ing2","ing3"],"p":0,"h":0,"g":0,"k":0},` +
    `"a":{"n":"nombre","v":["ing1","ing2","ing3"],"p":0,"h":0,"g":0,"k":0},` +
    `"c":{"n":"nombre","v":["ing1","ing2","ing3"],"p":0,"h":0,"g":0,"k":0},` +
    `"s":{"n":"nombre","v":["ing1"],"p":0,"h":0,"g":0,"k":0}}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      return NextResponse.json(
        { error: `Anthropic API error: ${res.status} — ${errBody}` },
        { status: 502 },
      );
    }

    const data = await res.json();
    let text = (data.content || [])
      .map((b: { text?: string }) => b.text || "")
      .join("")
      .trim();
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const s = text.indexOf("{");
    const e = text.lastIndexOf("}");
    if (s === -1 || e === -1) {
      return NextResponse.json(
        { error: `Sin JSON en respuesta del dia ${dayNum}` },
        { status: 502 },
      );
    }

    const jsonStr = text.slice(s, e + 1);
    let day: unknown;
    try {
      day = JSON.parse(jsonStr);
    } catch {
      // char-by-char repair for common JSON issues
      let out = "";
      let inStr = false;
      let esc = false;
      for (let k = 0; k < jsonStr.length; k++) {
        const ch = jsonStr[k];
        if (esc) { out += ch; esc = false; continue; }
        if (ch === "\\") { out += ch; esc = true; continue; }
        if (ch === '"') { out += ch; inStr = !inStr; continue; }
        if (inStr && (ch === "\n" || ch === "\r" || ch === "\t")) {
          out += " ";
          continue;
        }
        out += ch;
      }
      try {
        day = JSON.parse(out);
      } catch {
        return NextResponse.json(
          { error: `JSON invalido en dia ${dayNum}` },
          { status: 502 },
        );
      }
    }

    return NextResponse.json({ day });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
