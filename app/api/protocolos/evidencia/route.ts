import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/equipo-auth";
import { buscarPmids, resumenes } from "@/lib/protocolos/pubmed";

// Últimas revisiones sistemáticas, metaanálisis y guías en PubMed para la
// búsqueda de un protocolo. Respuesta cacheada 24 h por consulta.

export async function GET(request: NextRequest) {
  const { denied } = requireStaff(request, "clinico");
  if (denied) return denied;

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q || q.length > 300) {
    return NextResponse.json({ error: "Búsqueda inválida." }, { status: 400 });
  }
  const desde = new Date().getFullYear() - 3;

  try {
    const pmids = await buscarPmids(q, 8, desde);
    const articulos = await resumenes(pmids);
    return NextResponse.json({ articulos, desde });
  } catch (err) {
    console.error("PubMed evidencia:", err);
    return NextResponse.json({ error: "No se pudo consultar PubMed. Intenta de nuevo en un momento." }, { status: 502 });
  }
}
