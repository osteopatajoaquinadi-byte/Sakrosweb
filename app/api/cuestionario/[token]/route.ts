import { NextRequest, NextResponse } from "next/server";
import { getServiceClient as getSupabase } from "@/lib/supabase";
import { firstNameOf } from "@/lib/booking-emails";
import { puntuarTHI, validarTHI } from "@/lib/cuestionarios/thi";

// Link público del paciente para responder su cuestionario. Solo funciona
// con el token, una vez y antes de que venza. No devuelve datos clínicos.

async function buscar(token: string) {
  if (!/^[\w-]{20,64}$/.test(token)) return null;
  const { data } = await getSupabase()
    .from("fichas_cuestionarios")
    .select("id, tipo, estado, expira_at, fichas_patients(name)")
    .eq("token", token)
    .maybeSingle();
  return data;
}

function nombreDe(row: { fichas_patients: unknown }) {
  const p = row.fichas_patients as { name?: string } | { name?: string }[] | null;
  return firstNameOf((Array.isArray(p) ? p[0]?.name : p?.name) ?? "");
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const row = await buscar(token);
  if (!row) return NextResponse.json({ error: "Link no válido." }, { status: 404 });
  const vencido = row.estado === "pendiente" && !!row.expira_at && new Date(row.expira_at) < new Date();
  return NextResponse.json({ tipo: row.tipo, nombre: nombreDe(row), estado: vencido ? "vencido" : row.estado });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const row = await buscar(token);
  if (!row) return NextResponse.json({ error: "Link no válido." }, { status: 404 });
  if (row.estado !== "pendiente") return NextResponse.json({ error: "Este cuestionario ya fue respondido." }, { status: 409 });
  if (row.expira_at && new Date(row.expira_at) < new Date()) {
    return NextResponse.json({ error: "Este link venció. Pide uno nuevo a Sakros." }, { status: 410 });
  }

  const body = await request.json().catch(() => null);
  const respuestas = validarTHI(body?.respuestas);
  if (!respuestas) return NextResponse.json({ error: "Responde las 25 preguntas." }, { status: 400 });
  const r = puntuarTHI(respuestas);

  const { data, error } = await getSupabase()
    .from("fichas_cuestionarios")
    .update({
      estado: "respondido",
      respuestas,
      puntaje: r.puntaje,
      severidad: r.severidad,
      subescalas: r.subescalas,
      respondido_at: new Date().toISOString(),
    })
    .eq("id", row.id)
    .eq("estado", "pendiente")
    .select("id");
  if (error || !data?.length) return NextResponse.json({ error: "No se pudo guardar. Intenta de nuevo." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
