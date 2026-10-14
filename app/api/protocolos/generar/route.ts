import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/equipo-auth";
import { EJERCICIOS, catalogoParaPrompt } from "@/lib/protocolos/ejercicios";
import { abstracts, buscarPmids, resumenes, type ArticuloPubmed } from "@/lib/protocolos/pubmed";
import type { Protocolo } from "@/lib/protocolos/types";

// Genera un protocolo por fases para una patología que no está en la
// biblioteca base:
//   1. la IA traduce la consulta a una búsqueda PubMed,
//   2. se traen las revisiones y guías más recientes con sus resúmenes,
//   3. la IA sintetiza la evidencia y arma las fases usando SOLO esos
//      artículos y SOLO ejercicios del catálogo.
// Las citas y los ejercicios que no cumplen esa regla se descartan acá.

export const maxDuration = 300;

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";

const CONSULTA_SCHEMA = {
  type: "object",
  properties: {
    titulo: { type: "string", description: "Nombre clínico de la patología en español" },
    area: { type: "string", enum: ["kinesiologia", "osteopatia"] },
    pubmed: { type: "string", description: "Búsqueda PubMed en inglés con operadores booleanos, sin filtros de tipo de publicación" },
    pertinente: { type: "boolean", description: "false si la consulta no es una condición tratable por kinesiología u osteopatía" },
  },
  required: ["titulo", "area", "pubmed", "pertinente"],
  additionalProperties: false,
};

const PROTOCOLO_SCHEMA = {
  type: "object",
  properties: {
    descripcion: { type: "string" },
    evidencia: {
      type: "array",
      items: {
        type: "object",
        properties: {
          texto: { type: "string" },
          certeza: { type: "string", enum: ["alta", "moderada", "baja", "muy baja"] },
          pmids: { type: "array", items: { type: "string" } },
        },
        required: ["texto", "certeza", "pmids"],
        additionalProperties: false,
      },
    },
    banderasRojas: { type: "array", items: { type: "string" } },
    escalas: { type: "array", items: { type: "string" } },
    fases: {
      type: "array",
      items: {
        type: "object",
        properties: {
          nombre: { type: "string" },
          semanas: { type: "string" },
          objetivos: { type: "array", items: { type: "string" } },
          precauciones: { type: "array", items: { type: "string" } },
          criteriosAvance: { type: "array", items: { type: "string" } },
          ejercicios: {
            type: "array",
            items: {
              type: "object",
              properties: { id: { type: "string" }, dosis: { type: "string" } },
              required: ["id", "dosis"],
              additionalProperties: false,
            },
          },
        },
        required: ["nombre", "semanas", "objetivos", "precauciones", "criteriosAvance", "ejercicios"],
        additionalProperties: false,
      },
    },
  },
  required: ["descripcion", "evidencia", "banderasRojas", "escalas", "fases"],
  additionalProperties: false,
};

type Consulta = { titulo: string; area: "kinesiologia" | "osteopatia"; pubmed: string; pertinente: boolean };
type Generado = {
  descripcion: string;
  evidencia: { texto: string; certeza: Protocolo["evidencia"][number]["certeza"]; pmids: string[] }[];
  banderasRojas: string[];
  escalas: string[];
  fases: Protocolo["fases"];
};

class Rechazo extends Error {}

function client() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    // Claves no asociadas a un workspace exigen indicar cuál usar
    defaultHeaders: process.env.ANTHROPIC_WORKSPACE_ID
      ? { "anthropic-workspace-id": process.env.ANTHROPIC_WORKSPACE_ID }
      : undefined,
  });
}

async function pedirJson<T>(
  anthropic: Anthropic,
  prompt: string,
  schema: Record<string, unknown>,
  effort: "low" | "medium" | "high",
  maxTokens: number,
): Promise<T> {
  const res = await anthropic.beta.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort, format: { type: "json_schema", schema } },
    messages: [{ role: "user", content: prompt }],
  });
  if (res.stop_reason === "refusal") throw new Rechazo("La IA no pudo procesar esta consulta.");
  if (res.stop_reason === "max_tokens") throw new Error("La respuesta llegó cortada.");
  const text = res.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("");
  return JSON.parse(text) as T;
}

function promptConsulta(consulta: string) {
  return (
    "Eres kinesiólogo y osteópata clínico. Un profesional busca un protocolo de tratamiento para: " +
    `"${consulta}".\n` +
    "Devuelve el nombre clínico de la condición en español, el área principal (kinesiologia u osteopatia) " +
    "y una búsqueda PubMed en inglés que encuentre la evidencia sobre su rehabilitación o tratamiento conservador " +
    "(usa sinónimos con OR y agrupa con paréntesis; no agregues filtros de tipo de publicación ni de fecha). " +
    "Marca pertinente=false si no es una condición que traten kinesiólogos u osteópatas."
  );
}

function promptProtocolo(c: Consulta, articulos: (ArticuloPubmed & { resumen: string })[]) {
  const fuentes = articulos
    .map((a) => `PMID ${a.pmid} · ${a.titulo} (${a.revista}, ${a.anio}) [${a.tipos.join(", ")}]\n${a.resumen}`)
    .join("\n\n---\n\n");
  return (
    `Arma un protocolo de tratamiento por fases para: ${c.titulo} (área: ${c.area}).\n` +
    "Lo usará un kinesiólogo u osteópata como plantilla para sus pacientes en Chile.\n\n" +
    "REGLAS:\n" +
    "- La sección evidencia (4 a 6 hallazgos) se basa SOLO en los artículos de abajo. Cada hallazgo cita los PMID que lo respaldan. " +
    "Si la evidencia es débil o contradictoria, dilo; no exageres. La certeza sigue la lógica GRADE (usa la certeza que informe el artículo si la reporta).\n" +
    "- Las fases (3 a 5) tienen un plazo en semanas, objetivos, precauciones y criterios clínicos medibles para avanzar. " +
    "Cuando la evidencia no cubre un detalle, usa la práctica clínica habitual y deja la recomendación prudente.\n" +
    "- En cada fase, de 3 a 8 ejercicios elegidos SOLO del catálogo (usa el id exacto), con dosis concreta (series × repeticiones, tiempo o frecuencia).\n" +
    "- Banderas rojas específicas de la condición que obligan a derivar, y escalas de resultado validadas.\n" +
    "- Español de Chile, frases claras y breves, sin markdown.\n\n" +
    `CATÁLOGO DE EJERCICIOS (id | nombre | región):\n${catalogoParaPrompt()}\n\n` +
    `ARTÍCULOS (PubMed, más recientes primero):\n\n${fuentes}`
  );
}

function slug(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

export async function POST(request: NextRequest) {
  const { denied } = requireStaff(request, "clinico");
  if (denied) return denied;

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Falta configurar ANTHROPIC_API_KEY en Vercel para generar protocolos." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const consulta = typeof body.consulta === "string" ? body.consulta.trim().slice(0, 200) : "";
  if (consulta.length < 3) {
    return NextResponse.json({ error: "Escribe la patología que quieres buscar." }, { status: 400 });
  }

  const anthropic = client();
  try {
    const c = await pedirJson<Consulta>(anthropic, promptConsulta(consulta), CONSULTA_SCHEMA, "low", 2000);
    if (!c.pertinente) {
      return NextResponse.json(
        { error: "La búsqueda no parece una condición que traten kinesiólogos u osteópatas. Prueba con otro término." },
        { status: 422 },
      );
    }

    let pmids = await buscarPmids(c.pubmed, 12, new Date().getFullYear() - 6);
    if (pmids.length < 4) pmids = await buscarPmids(c.pubmed, 12);
    if (pmids.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron revisiones ni guías en PubMed para esta búsqueda. Prueba con otro término." },
        { status: 404 },
      );
    }
    const [meta, textos] = await Promise.all([resumenes(pmids), abstracts(pmids)]);
    const articulos = meta
      .filter((a) => textos.has(a.pmid))
      .map((a) => ({ ...a, resumen: textos.get(a.pmid)! }));
    if (articulos.length === 0) {
      return NextResponse.json({ error: "Los artículos encontrados no tienen resumen disponible." }, { status: 404 });
    }

    const g = await pedirJson<Generado>(anthropic, promptProtocolo(c, articulos), PROTOCOLO_SCHEMA, "medium", 16000);

    // Solo se aceptan citas a artículos efectivamente recuperados y
    // ejercicios que existen en el catálogo.
    const porPmid = new Map(articulos.map((a) => [a.pmid, a]));
    const idsEjercicio = new Set(EJERCICIOS.map((e) => e.id));
    const citados = new Set<string>();
    const evidencia = g.evidencia
      .map((h) => ({ ...h, pmids: h.pmids.filter((p) => porPmid.has(p)) }))
      .filter((h) => h.pmids.length > 0);
    evidencia.forEach((h) => h.pmids.forEach((p) => citados.add(p)));

    const protocolo: Protocolo = {
      id: `ia-${slug(c.titulo)}`,
      titulo: c.titulo,
      area: c.area,
      sinonimos: [],
      descripcion: g.descripcion,
      pubmed: c.pubmed,
      actualizado: new Date().toISOString().slice(0, 7),
      origen: "ia",
      revisado: false,
      evidencia: evidencia.map((h) => ({
        texto: `${h.texto} [${h.pmids.map((p) => `PMID ${p}`).join(", ")}]`,
        certeza: h.certeza,
      })),
      banderasRojas: g.banderasRojas,
      escalas: g.escalas,
      fases: g.fases.map((f) => ({ ...f, ejercicios: f.ejercicios.filter((e) => idsEjercicio.has(e.id)) })),
      referencias: [...citados].map((p) => {
        const a = porPmid.get(p)!;
        return { pmid: a.pmid, doi: a.doi, cita: `${a.autores} ${a.titulo}. ${a.revista}. ${a.anio}.` };
      }),
    };

    return NextResponse.json({ protocolo, articulosRevisados: articulos.length });
  } catch (err) {
    if (err instanceof Rechazo) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: "La ANTHROPIC_API_KEY no es válida. Revisa que esté bien copiada en Vercel." }, { status: 502 });
    }
    if (err instanceof Anthropic.RateLimitError || err instanceof Anthropic.InternalServerError) {
      return NextResponse.json({ error: "El servicio de IA está saturado. Espera un minuto e intenta de nuevo." }, { status: 503 });
    }
    if (err instanceof Anthropic.APIError) {
      console.error("Anthropic protocolo:", err.status, err.message);
      const motivo = /credit balance/i.test(err.message)
        ? "La cuenta de la API no tiene saldo. Carga créditos en platform.claude.com → Billing."
        : `El servicio de IA respondió: ${err.message}`;
      return NextResponse.json({ error: motivo }, { status: 502 });
    }
    console.error("Error generando protocolo:", err);
    return NextResponse.json({ error: `No se pudo generar el protocolo (${(err as Error).message}).` }, { status: 500 });
  }
}
