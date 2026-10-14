// Cliente mínimo de PubMed E-utilities (NCBI). Gratis y sin clave; con
// NCBI_API_KEY el límite sube de 3 a 10 solicitudes por segundo.
// Solo servidor.

const EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

/** Revisiones sistemáticas, metaanálisis, guías y consensos. */
export const FILTRO_SINTESIS =
  '(systematic review[pt] OR meta-analysis[pt] OR practice guideline[pt] OR guideline[pt] OR consensus[ti])';

export interface ArticuloPubmed {
  pmid: string;
  titulo: string;
  revista: string;
  anio: string;
  autores: string;
  doi?: string;
  tipos: string[];
  resumen?: string;
}

function params(extra: Record<string, string>): string {
  const p = new URLSearchParams({ db: "pubmed", tool: "sakros-protocolos", ...extra });
  if (process.env.NCBI_API_KEY) p.set("api_key", process.env.NCBI_API_KEY);
  return p.toString();
}

async function getJson(url: string) {
  const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
  if (!res.ok) throw new Error(`PubMed respondió HTTP ${res.status}`);
  return res.json();
}

/** Busca PMIDs ordenados por fecha de publicación (más recientes primero). */
export async function buscarPmids(termino: string, max = 10, desdeAnio?: number): Promise<string[]> {
  const term = `(${termino}) AND ${FILTRO_SINTESIS}`;
  const extra: Record<string, string> = { term, retmax: String(max), retmode: "json", sort: "pub_date" };
  if (desdeAnio) {
    extra.datetype = "pdat";
    extra.mindate = String(desdeAnio);
    extra.maxdate = "3000";
  }
  const data = await getJson(`${EUTILS}/esearch.fcgi?${params(extra)}`);
  return (data?.esearchresult?.idlist as string[] | undefined) ?? [];
}

type EsummaryItem = {
  uid: string;
  title?: string;
  fulljournalname?: string;
  source?: string;
  pubdate?: string;
  authors?: { name: string }[];
  articleids?: { idtype: string; value: string }[];
  pubtype?: string[];
};

/** Metadatos (sin resumen) de una lista de PMIDs. */
export async function resumenes(pmids: string[]): Promise<ArticuloPubmed[]> {
  if (pmids.length === 0) return [];
  const data = await getJson(`${EUTILS}/esummary.fcgi?${params({ id: pmids.join(","), retmode: "json" })}`);
  const result = data?.result ?? {};
  return pmids
    .map((id) => result[id] as EsummaryItem | undefined)
    .filter((x): x is EsummaryItem => !!x?.title)
    .map((it) => {
      const autores = it.authors ?? [];
      return {
        pmid: it.uid,
        titulo: it.title!.replace(/\.$/, ""),
        revista: it.source || it.fulljournalname || "",
        anio: (it.pubdate || "").slice(0, 4),
        autores: autores.length > 1 ? `${autores[0].name}, et al.` : autores[0]?.name ?? "",
        doi: it.articleids?.find((a) => a.idtype === "doi")?.value,
        tipos: it.pubtype ?? [],
      };
    });
}

function decodeXml(s: string): string {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** Resúmenes (abstracts) completos vía efetch, para alimentar la síntesis. */
export async function abstracts(pmids: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  if (pmids.length === 0) return out;
  const res = await fetch(`${EUTILS}/efetch.fcgi?${params({ id: pmids.join(","), retmode: "xml", rettype: "abstract" })}`, {
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!res.ok) throw new Error(`PubMed respondió HTTP ${res.status}`);
  const xml = await res.text();
  for (const art of xml.split("<PubmedArticle>").slice(1)) {
    const pmid = art.match(/<PMID[^>]*>(\d+)<\/PMID>/)?.[1];
    if (!pmid) continue;
    const partes = [...art.matchAll(/<AbstractText([^>]*)>([\s\S]*?)<\/AbstractText>/g)].map((m) => {
      const label = m[1].match(/Label="([^"]+)"/)?.[1];
      const texto = decodeXml(m[2]);
      return label ? `${label}: ${texto}` : texto;
    });
    if (partes.length) out.set(pmid, partes.join("\n"));
  }
  return out;
}
