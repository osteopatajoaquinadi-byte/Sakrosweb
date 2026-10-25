import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServiceClient as getSupabase } from "@/lib/supabase";
import { requireStaff } from "@/lib/equipo-auth";

// Archivos adjuntos de la ficha. Los archivos van a un bucket privado y se
// suben directo desde el navegador con una URL firmada (sin pasar por el
// límite de tamaño del servidor). También se pueden guardar enlaces (Drive).

const BUCKET = "fichas-adjuntos";
const MAX_BYTES = 50 * 1024 * 1024;

function nombreSeguro(n: string) {
  return n.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.\- ]/g, "_").replace(/\s+/g, "_").slice(0, 120) || "archivo";
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { denied } = requireStaff(request, "clinico");
  if (denied) return denied;
  const { id } = await params;
  const db = getSupabase();
  const { data, error } = await db
    .from("fichas_adjuntos")
    .select("id, nombre, path, url, tipo, tamano, origen, subido_por, created_at")
    .eq("patient_id", id)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "No se pudieron cargar los archivos." }, { status: 500 });

  const paths = (data ?? []).filter((a) => a.path).map((a) => a.path as string);
  const firmadas = new Map<string, string>();
  if (paths.length) {
    const { data: urls } = await db.storage.from(BUCKET).createSignedUrls(paths, 3600);
    for (const u of urls ?? []) if (u.path && u.signedUrl) firmadas.set(u.path, u.signedUrl);
  }
  return NextResponse.json({
    adjuntos: (data ?? []).map((a) => ({ ...a, enlace: a.path ? firmadas.get(a.path) ?? null : a.url })),
  });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, denied } = requireStaff(request, "clinico");
  if (denied) return denied;
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const db = getSupabase();

  // 1) Pedir URL firmada para subir un archivo
  if (body?.accion === "preparar") {
    const tamano = Number(body.tamano);
    if (!body.nombre || !Number.isFinite(tamano) || tamano <= 0) {
      return NextResponse.json({ error: "Archivo no válido." }, { status: 400 });
    }
    if (tamano > MAX_BYTES) return NextResponse.json({ error: "El archivo supera los 50 MB." }, { status: 413 });
    const path = `${id}/${randomUUID()}-${nombreSeguro(String(body.nombre))}`;
    const { data, error } = await db.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !data) return NextResponse.json({ error: "No se pudo preparar la subida." }, { status: 500 });
    return NextResponse.json({ path: data.path, token: data.token });
  }

  // 2) Registrar el archivo ya subido
  if (body?.accion === "confirmar") {
    const path = String(body.path ?? "");
    if (!path.startsWith(`${id}/`)) return NextResponse.json({ error: "Ruta no válida." }, { status: 400 });
    const carpeta = path.slice(0, path.lastIndexOf("/"));
    const archivo = path.slice(path.lastIndexOf("/") + 1);
    const { data: existe } = await db.storage.from(BUCKET).list(carpeta, { search: archivo, limit: 1 });
    if (!existe?.length) return NextResponse.json({ error: "El archivo no se subió correctamente." }, { status: 400 });
    const { error } = await db.from("fichas_adjuntos").insert({
      patient_id: id,
      nombre: String(body.nombre ?? archivo).slice(0, 200),
      path,
      tipo: String(body.tipo ?? "").slice(0, 100) || null,
      tamano: Number(body.tamano) || null,
      origen: "subido",
      subido_por: user.display_name,
    });
    if (error) return NextResponse.json({ error: "No se pudo registrar el archivo." }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // 3) Guardar un enlace (ej. ficha en Google Drive)
  if (body?.accion === "enlace") {
    const url = String(body.url ?? "").trim();
    if (!/^https:\/\/\S+$/.test(url)) return NextResponse.json({ error: "Enlace no válido." }, { status: 400 });
    const { error } = await db.from("fichas_adjuntos").insert({
      patient_id: id,
      nombre: String(body.nombre ?? "").trim().slice(0, 200) || "Enlace",
      url,
      origen: url.includes("drive.google.com") || url.includes("docs.google.com") ? "drive" : "subido",
      subido_por: user.display_name,
    });
    if (error) return NextResponse.json({ error: "No se pudo guardar el enlace." }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { denied } = requireStaff(request, "clinico");
  if (denied) return denied;
  const { id } = await params;
  const aid = new URL(request.url).searchParams.get("aid");
  if (!aid) return NextResponse.json({ error: "Falta el id." }, { status: 400 });
  const db = getSupabase();
  const { data } = await db.from("fichas_adjuntos").select("path").eq("id", aid).eq("patient_id", id).maybeSingle();
  if (!data) return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  if (data.path) await db.storage.from(BUCKET).remove([data.path]);
  await db.from("fichas_adjuntos").delete().eq("id", aid);
  return NextResponse.json({ ok: true });
}
