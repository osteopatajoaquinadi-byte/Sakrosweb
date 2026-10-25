import { NextRequest, NextResponse } from "next/server";
import { getServiceClient as getSupabase } from "@/lib/supabase";
import { requireStaff } from "@/lib/equipo-auth";

// Fichas antiguas de Google Drive: buscar, vincular a un paciente o crear el
// paciente a partir de la ficha. Al vincular, la ficha queda como adjunto.

const enlace = (id: string) => `https://docs.google.com/spreadsheets/d/${id}/edit`;

function normalizar(t: string) {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// "maria jose SILVA soler." → "Maria Jose Silva Soler"
function nombreDesdeTitulo(t: string) {
  return t
    .replace(/^(copia de\s+)+/i, "")
    .replace(/^ficha\s+/i, "")
    .replace(/[.,\t]+$/g, "")
    .trim()
    .toLowerCase()
    .replace(/(^|[\s-])(\p{L})/gu, (_, a, b) => a + b.toUpperCase());
}

export async function GET(request: NextRequest) {
  const { denied } = requireStaff(request, "clinico");
  if (denied) return denied;
  const q = normalizar(new URL(request.url).searchParams.get("q") ?? "");
  if (q.length < 2) return NextResponse.json({ fichas: [] });

  let query = getSupabase()
    .from("fichas_drive")
    .select("drive_id, titulo, modificado, patient_id, fichas_patients(name)")
    .order("modificado", { ascending: false })
    .limit(30);
  for (const palabra of q.split(" ").slice(0, 5)) query = query.ilike("titulo_norm", `%${palabra}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "No se pudieron buscar las fichas." }, { status: 500 });
  return NextResponse.json({
    fichas: (data ?? []).map((f) => {
      const p = f.fichas_patients as { name: string } | { name: string }[] | null;
      return {
        drive_id: f.drive_id,
        titulo: f.titulo,
        modificado: f.modificado,
        patient_id: f.patient_id,
        paciente: Array.isArray(p) ? p[0]?.name ?? null : p?.name ?? null,
        url: enlace(f.drive_id),
      };
    }),
  });
}

export async function POST(request: NextRequest) {
  const { user, denied } = requireStaff(request, "clinico");
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  const driveId = String(body?.drive_id ?? "");
  const db = getSupabase();

  const { data: ficha } = await db
    .from("fichas_drive")
    .select("drive_id, titulo, modificado, patient_id")
    .eq("drive_id", driveId)
    .maybeSingle();
  if (!ficha) return NextResponse.json({ error: "Ficha no encontrada." }, { status: 404 });

  let patientId: string;
  if (body?.accion === "crear") {
    if (ficha.patient_id) return NextResponse.json({ patient_id: ficha.patient_id });
    const { data: nuevo, error } = await db
      .from("fichas_patients")
      .insert({ name: nombreDesdeTitulo(ficha.titulo) || ficha.titulo, created_by: user.username })
      .select("id")
      .single();
    if (error || !nuevo) return NextResponse.json({ error: "No se pudo crear el paciente." }, { status: 500 });
    patientId = nuevo.id;
  } else if (body?.accion === "vincular") {
    patientId = String(body.patient_id ?? "");
    const { data: existe } = await db.from("fichas_patients").select("id").eq("id", patientId).maybeSingle();
    if (!existe) return NextResponse.json({ error: "Paciente no encontrado." }, { status: 404 });
  } else {
    return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
  }

  // Si estaba enlazada a otro paciente, se mueve el adjunto.
  await db.from("fichas_adjuntos").delete().eq("url", enlace(ficha.drive_id)).eq("origen", "drive");
  const fecha = ficha.modificado ? ` · ${String(ficha.modificado).split("-").reverse().join("-")}` : "";
  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    db.from("fichas_drive").update({ patient_id: patientId }).eq("drive_id", ficha.drive_id),
    db.from("fichas_adjuntos").insert({
      patient_id: patientId,
      nombre: `Ficha antigua (Drive): ${ficha.titulo}${fecha}`,
      url: enlace(ficha.drive_id),
      tipo: "application/vnd.google-apps.spreadsheet",
      origen: "drive",
      subido_por: user.display_name,
    }),
  ]);
  if (e1 || e2) return NextResponse.json({ error: "No se pudo vincular la ficha." }, { status: 500 });
  return NextResponse.json({ patient_id: patientId });
}
