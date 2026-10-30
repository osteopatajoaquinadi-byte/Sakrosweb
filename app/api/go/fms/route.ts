import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { goMiembro } from "@/lib/go-auth";

// FMS por video: la app extrae cuadros de cada video (3 repeticiones por
// lado) y los envía aquí. El Coach los compara con los criterios del FMS y
// devuelve un puntaje preliminar por lado. El prompt se arma en el servidor:
// esta ruta no sirve como acceso libre a Claude.

export const maxDuration = 60;

const MODEL = process.env.GO_MODEL || process.env.ANTHROPIC_MODEL || "claude-opus-5-5";
// Análisis por día y por persona (un análisis = una prueba con sus lados).
const LIMITE = { coach: 300, cliente: 25 };
const MAX_CUADROS = 12;
const MAX_CUADRO_B64 = 400_000;

type Prueba = { n: string; lados: Record<string, string>; criterios: string };

const PRUEBAS: Record<string, Prueba> = {
  ds: {
    n: "Sentadilla profunda (deep squat)",
    lados: { u: "Bilateral. Primero 3 repeticiones con los talones en el suelo; después, si las hizo, 3 con los talones sobre un libro o tabla de unos 5 cm." },
    criterios:
      "3: con los talones en el suelo, tronco paralelo a la tibia o más vertical, fémur bajo la horizontal, rodillas alineadas sobre los pies, palo alineado sobre los pies. " +
      "2: cumple esos criterios solo con los talones elevados. " +
      "1: aun con los talones elevados, tibia y tronco no paralelos, fémur no baja de la horizontal, rodillas no alineadas o flexión lumbar.",
  },
  hs: {
    n: "Paso de valla (hurdle step)",
    lados: { d: "Pasa la pierna derecha por encima de la valla.", i: "Pasa la pierna izquierda por encima de la valla." },
    criterios:
      "Valla (elástico) a la altura de la tuberosidad de la tibia; palo sobre los hombros. " +
      "3: cadera, rodilla y tobillo alineados en el plano sagital; mínimo o ningún movimiento lumbar; palo y valla se mantienen paralelos. " +
      "2: se pierde la alineación cadera-rodilla-tobillo, hay movimiento lumbar o el palo y la valla no quedan paralelos. " +
      "1: toca la valla con el pie o pierde el equilibrio.",
  },
  il: {
    n: "Estocada en línea (in-line lunge)",
    lados: { d: "Pierna derecha adelante.", i: "Pierna izquierda adelante." },
    criterios:
      "Pies sobre una línea, separados el largo de la tibia; palo vertical en la espalda tocando cabeza, columna torácica y sacro (mano del lado contrario a la pierna delantera arriba). " +
      "3: el palo mantiene los 3 contactos y queda vertical; el tronco no se mueve; palo y pies en el mismo plano sagital; la rodilla de atrás toca detrás del talón delantero. " +
      "2: se pierden contactos del palo, el palo no queda vertical, el tronco se mueve, palo y pies salen del plano o la rodilla no toca detrás del talón. " +
      "1: pierde el equilibrio o no completa el movimiento.",
  },
  sm: {
    n: "Movilidad de hombro (shoulder mobility)",
    lados: { d: "Mano derecha arriba (por detrás del cuello).", i: "Mano izquierda arriba (por detrás del cuello)." },
    criterios:
      "Puños cerrados; en un solo movimiento, una mano llega por arriba detrás del cuello y la otra por abajo detrás de la espalda. Se mide la distancia entre los puños comparada con el largo de la mano (pliegue de la muñeca a la punta del dedo medio). " +
      "3: puños a menos de 1 mano de distancia. 2: a menos de 1,5 manos. 1: a más de 1,5 manos. " +
      "Si la persona informó las medidas, úsalas como dato principal y usa los cuadros para revisar la técnica (puños cerrados, un solo movimiento, sin caminar las manos).",
  },
  aslr: {
    n: "Elevación activa de pierna extendida (ASLR)",
    lados: { d: "Eleva la pierna derecha.", i: "Eleva la pierna izquierda." },
    criterios:
      "Boca arriba, piernas extendidas, palmas arriba; la pierna que no se mueve queda apoyada y extendida. Referencia: punto medio entre la espina ilíaca anterosuperior y el centro de la rótula de la pierna apoyada. " +
      "3: el maléolo de la pierna que sube queda entre la mitad del muslo y la espina ilíaca (más allá del punto medio). " +
      "2: el maléolo queda entre la mitad del muslo y la rodilla. " +
      "1: el maléolo queda por debajo de la rodilla. Revisa también que la pierna apoyada no se doble ni rote.",
  },
  tspu: {
    n: "Flexión de estabilidad de tronco (trunk stability push-up)",
    lados: { u: "Bilateral. Primero 3 intentos en la posición más difícil; si no le salió, 3 en la más fácil." },
    criterios:
      "Boca abajo, manos al ancho de los hombros, rodillas extendidas. Hombres: posición difícil con los pulgares a la altura de la frente; fácil, a la altura del mentón. Mujeres: difícil con los pulgares a la altura del mentón; fácil, a la altura de la clavícula. " +
      "3: el cuerpo sube en bloque, sin retraso de la zona lumbar, en la posición difícil. " +
      "2: lo logra solo en la posición fácil. " +
      "1: no lo logra en la posición fácil (la zona lumbar se queda atrás o se arquea).",
  },
  rs: {
    n: "Estabilidad en rotación (rotary stability)",
    lados: { d: "Se mueven el brazo y la pierna del lado derecho (o la pierna derecha en el patrón diagonal).", i: "Se mueven el brazo y la pierna del lado izquierdo (o la pierna izquierda en el patrón diagonal)." },
    criterios:
      "En cuatro apoyos. Primero el patrón unilateral: extiende el brazo y la pierna del mismo lado y luego lleva el codo a la rodilla. Si no le sale, el patrón diagonal: brazo y pierna contrarios. " +
      "3: una repetición correcta del patrón unilateral, con la columna paralela al suelo y el codo tocando la rodilla. " +
      "2: una repetición correcta del patrón diagonal, con la columna paralela al suelo y el codo tocando la rodilla. " +
      "1: no logra una repetición correcta del patrón diagonal.",
  },
};

function limpiaTexto(v: unknown, max: number): string {
  return typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

export async function POST(request: NextRequest) {
  const m = await goMiembro(request);
  if (!m) return NextResponse.json({ error: "Inicia sesión de nuevo.", code: "not_granted" }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Falta ANTHROPIC_API_KEY.", code: "sampling_disabled" }, { status: 503 });
  }

  const raw = await request.text();
  if (raw.length > 4_000_000) {
    return NextResponse.json({ error: "Los cuadros pesan demasiado." }, { status: 413 });
  }
  let body: { test?: unknown; sexo?: unknown; lados?: unknown; medidas?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const test = typeof body.test === "string" ? body.test : "";
  const P = PRUEBAS[test];
  if (!P) return NextResponse.json({ error: "Prueba desconocida." }, { status: 400 });
  const lados = (body.lados && typeof body.lados === "object" ? body.lados : {}) as Record<string, unknown>;
  const recibidos = Object.keys(P.lados).filter((l) => Array.isArray(lados[l]) && (lados[l] as unknown[]).length > 0);
  if (!recibidos.length) return NextResponse.json({ error: "Faltan los videos." }, { status: 400 });
  for (const l of recibidos) {
    const fr = lados[l] as unknown[];
    if (fr.length > MAX_CUADROS || fr.some((x) => typeof x !== "string" || x.length > MAX_CUADRO_B64 || !/^[A-Za-z0-9+/=]+$/.test(x))) {
      return NextResponse.json({ error: "Cuadros inválidos." }, { status: 400 });
    }
  }

  const db = getServiceClient();
  const { data: permitido } = await db.rpc("go_usar_fms", { p_user: m.userId, p_max: LIMITE[m.rol] });
  if (permitido === false) {
    return NextResponse.json({ error: "Llegaste al límite de análisis de hoy. Sigue mañana.", code: "limite_diario" }, { status: 429 });
  }

  const sexo = body.sexo === "M" ? "mujer" : body.sexo === "H" ? "hombre" : "no declarado";
  const med = (body.medidas && typeof body.medidas === "object" ? body.medidas : {}) as Record<string, unknown>;
  const num = (v: unknown) => (typeof v === "number" && isFinite(v) && v > 0 && v < 200 ? Math.round(v * 10) / 10 : null);
  const medidas =
    test === "sm" && num(med.mano)
      ? ` Medidas informadas por la persona: largo de la mano ${num(med.mano)} cm; distancia entre puños con la mano derecha arriba ${num(med.d) ?? "sin dato"} cm, con la izquierda arriba ${num(med.i) ?? "sin dato"} cm.`
      : "";

  const content: Anthropic.Beta.BetaContentBlockParam[] = [
    {
      type: "text",
      text:
        `Eres kinesiólogo certificado en FMS (Functional Movement Screen) y revisas el video de un cliente de Sakros Go. ` +
        `Recibes cuadros extraídos en orden temporal de un video casero con 3 repeticiones. Prueba: ${P.n}. Sexo: ${sexo}.${medidas}\n` +
        `Criterios de puntaje:\n${P.criterios}\n` +
        `El puntaje 0 (dolor) no lo pones tú: la persona lo informa aparte. ` +
        `Puntúa cada lado con la mejor repetición que se vea. Sé conservador: si no se ve claro que cumple el criterio del 3, pon 2. ` +
        `Si los cuadros no permiten evaluar (cámara mal ubicada, cuerpo cortado, poca luz o no se hizo la prueba), pon puntaje null y explica en «regrabar» cómo volver a grabar. ` +
        `Escribe en español latinoamericano neutro, con tuteo, frases cortas y simples, dirigidas a la persona.\n` +
        `Responde solo con este JSON: {"lados":{${recibidos.map((l) => `"${l}":{"puntaje":1|2|3|null,"obs":"qué viste, en 1 o 2 frases"}`).join(",")}},"confianza":"alta"|"media"|"baja","resumen":"1 frase","regrabar":"" }`,
    },
  ];
  for (const l of recibidos) {
    content.push({ type: "text", text: `Lado «${l}»: ${P.lados[l]} Cuadros en orden temporal:` });
    for (const b64 of lados[l] as string[]) {
      content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } });
    }
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
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium" },
      messages: [{ role: "user", content }],
    });
    const texto = res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    const i = texto.indexOf("{"), j = texto.lastIndexOf("}");
    if (i < 0 || j < i) throw new Error("Respuesta sin JSON");
    const r = JSON.parse(texto.slice(i, j + 1)) as {
      lados?: Record<string, { puntaje?: unknown; obs?: unknown }>;
      confianza?: unknown;
      resumen?: unknown;
      regrabar?: unknown;
    };
    const out: Record<string, { puntaje: number | null; obs: string }> = {};
    for (const l of recibidos) {
      const x = r.lados?.[l] ?? {};
      const p = Number(x.puntaje);
      out[l] = { puntaje: [1, 2, 3].includes(p) ? p : null, obs: limpiaTexto(x.obs, 400) };
    }
    return NextResponse.json({
      lados: out,
      confianza: ["alta", "media", "baja"].includes(String(r.confianza)) ? r.confianza : "baja",
      resumen: limpiaTexto(r.resumen, 300),
      regrabar: limpiaTexto(r.regrabar, 400),
    });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Demasiadas consultas seguidas. Inténtalo en un minuto.", code: "rate_limited" }, { status: 429 });
    }
    console.error("Sakros Go FMS:", e);
    return NextResponse.json({ error: "No se pudo analizar el video. Inténtalo de nuevo." }, { status: 502 });
  }
}
