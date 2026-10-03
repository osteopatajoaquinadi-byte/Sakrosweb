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

// Rotación para que los 10 días sean distintos entre sí. Si algo choca con
// una restricción del paciente, la IA lo reemplaza por otra opción permitida.
const DESAYUNOS = [
  "omelette relleno",
  "shakshuka (huevos en salsa de tomate y pimentón)",
  "huevos pochados sobre base de verduras",
  "frittata al horno",
  "huevos revueltos con champiñones",
  "panqueques de harina de almendra",
  "tortilla de claras con espinaca",
  "huevos cocidos con palta y semillas",
  "budín de chía con frutos rojos y proteína",
  "huevos al plato con verduras asadas",
];
const PROTEINAS: [string, string][] = [
  ["salmón", "pollo"],
  ["vacuno magro (posta, lomo)", "merluza"],
  ["pavo", "sardinas o jurel"],
  ["reineta o corvina", "cerdo magro (lomo)"],
  ["pollo (trutro deshuesado)", "atún fresco o en conserva al agua"],
  ["cordero", "huevos y quesos maduros"],
  ["camarones o choritos", "pechuga de pavo"],
  ["legumbres con proteína (lentejas, garbanzos) en porción controlada", "salmón"],
  ["vacuno magro (carne molida 5%)", "congrio o pescado blanco"],
  ["pollo entero o pechuga", "pescado blanco (tofu o tempeh solo si es vegetariano o vegano)"],
];
const PREPARACIONES: [string, string][] = [
  ["al horno", "salteado tipo wok"],
  ["a la plancha", "al vapor"],
  ["guiso o estofado", "en papillote"],
  ["a la parrilla", "en ensalada tibia"],
  ["al curry suave", "a la plancha"],
  ["cocción lenta / braseado", "en brochetas"],
  ["ceviche o tartar (si el pescado lo permite) o salteado", "al horno con hierbas"],
  ["en budín o pastel de verduras", "salteado"],
  ["albóndigas al horno", "a la plancha con salsa verde"],
  ["en bowl con verduras asadas", "en sopa o crema de verduras con proteína"],
];
const SNACKS = [
  "frutos secos y semillas",
  "palitos de verduras con hummus",
  "huevo duro y aceitunas",
  "yogur griego natural con nueces",
  "queso de cabra con pepino",
  "chips de coco y almendras",
  "palta con limón y sal de mar",
  "berries con semillas de chía",
  "rollitos de pavo con palta",
  "edamame o lupino",
];

function buildPrompt(dayNum: number, tema: string, c: Config, previos: string[]) {
  const i = (dayNum - 1) % 10;
  return (
    "Nutricionista low carb psiconeuroinmunologia, contexto Chile. " +
    `Crea 1 dia de comidas (dia ${dayNum}/10, tema: ${tema}). ` +
    `Paciente ${c.peso}kg ${c.lbl} ${c.tdee}kcal. ` +
    `MACROS: prot ${c.prot}g, hidratos MAX ${c.carb}g (LOW CARB), grasas ${c.fat}g. ` +
    (c.restr ? `RESTRICCIONES OBLIGATORIAS: ${c.restr}. ` : "") +
    "VARIEDAD (muy importante): " +
    `Desayuno de hoy: ${DESAYUNOS[i]}. ` +
    `Almuerzo: proteina principal ${PROTEINAS[i][0]}, preparacion ${PREPARACIONES[i][0]}. ` +
    `Cena: proteina principal ${PROTEINAS[i][1]}, preparacion ${PREPARACIONES[i][1]}. ` +
    `Snack: ${SNACKS[i]}. ` +
    "Usa verduras, hierbas y especias distintas en cada comida. " +
    (previos.length
      ? `NO repitas ninguno de estos platos de dias anteriores ni combinaciones parecidas: ${previos.join("; ")}. `
      : "") +
    "Si algo asignado choca con una restriccion, reemplazalo por otra opcion permitida que no se haya usado en dias anteriores. " +
    (/vegetariano|vegano/i.test(c.restr)
      ? ""
      : "El paciente NO es vegetariano ni vegano: no uses tofu, tempeh ni proteina vegetal en polvo como proteina principal. ") +
    "REGLAS: nunca pescado en el desayuno. " +
    "PROHIBIDO siempre: azucar, pan de trigo, arroz, pasta, papa, harinas refinadas, jugos, ultraprocesados. " +
    "BASE: verduras no almidonadas. GRASAS: oliva, palta, frutos secos. " +
    `Aplica el tema: ${tema}. ` +
    "Nombre del plato descriptivo (incluye la preparacion). Ingredientes max 5 por comida, breves. " +
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

  const { dayNum, tema, config, previos: previosRaw } = await request.json();
  const previos: string[] = Array.isArray(previosRaw)
    ? previosRaw.filter((x: unknown) => typeof x === "string").slice(0, 40).map((x: string) => x.slice(0, 80))
    : [];
  const n = parseInt(dayNum);
  if (!n || n < 1 || n > 10 || typeof tema !== "string" || !config?.peso) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  // Si el modelo no existe para esta cuenta, se prueba el siguiente.
  const modelos = process.env.ANTHROPIC_MODEL
    ? [process.env.ANTHROPIC_MODEL]
    : ["claude-sonnet-5-5", "claude-sonnet-4-5", "claude-sonnet-4-20250514"];

  try {
    let ultimoError = "";
    let intentosLectura = 0;
    for (let m = 0; m < modelos.length; m++) {
      const model = modelos[m];
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          // Claves no asociadas a un workspace exigen indicar cuál usar
          ...(process.env.ANTHROPIC_WORKSPACE_ID
            ? { "anthropic-workspace-id": process.env.ANTHROPIC_WORKSPACE_ID }
            : {}),
        },
        body: JSON.stringify({
          model,
          max_tokens: 2000,
          temperature: 1,
          messages: [{ role: "user", content: buildPrompt(n, tema, config as Config, previos) }],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const text = (data.content || [])
          .filter((b: { type?: string }) => b.type === "text")
          .map((b: { text?: string }) => b.text || "")
          .join("");
        try {
          return NextResponse.json({ day: parseDay(text), model });
        } catch (e) {
          console.error(
            `Minuta día ${n}: respuesta no legible (${model}, stop_reason=${data.stop_reason}):`,
            (e as Error).message,
            text.slice(0, 500)
          );
          // Un reintento con el mismo modelo antes de rendirse
          if (intentosLectura++ < 1) { m--; continue; }
          return NextResponse.json(
            {
              error:
                data.stop_reason === "max_tokens"
                  ? `La respuesta del día ${n} llegó cortada.`
                  : `La respuesta del día ${n} no vino en el formato esperado.`,
            },
            { status: 502 }
          );
        }
      }

      const tipo: string = data?.error?.type ?? "";
      const detalle: string = data?.error?.message ?? `HTTP ${res.status}`;
      console.error(`Anthropic minuta (${model}):`, res.status, tipo, detalle);
      if (tipo === "not_found_error") {
        ultimoError = `Modelo no disponible (${model}).`;
        continue;
      }
      const motivo =
        tipo === "authentication_error"
          ? "La ANTHROPIC_API_KEY no es válida. Revisa que esté bien copiada en Vercel."
          : tipo === "permission_error"
            ? "La clave no tiene permiso para usar la API."
            : /credit balance/i.test(detalle)
              ? "La cuenta de la API no tiene saldo. Carga créditos en platform.claude.com → Billing."
              : tipo === "rate_limit_error" || tipo === "overloaded_error"
                ? "El servicio de IA está saturado. Espera un minuto e intenta de nuevo."
                : `El servicio de IA respondió: ${detalle}`;
      return NextResponse.json({ error: motivo }, { status: 502 });
    }
    return NextResponse.json({ error: ultimoError || "Ningún modelo disponible." }, { status: 502 });
  } catch (err) {
    console.error("Error generando minuta:", err);
    return NextResponse.json(
      { error: `No se pudo generar el día ${n} (${(err as Error).message}).` },
      { status: 500 }
    );
  }
}
