import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getServiceClient as getSupabase } from "@/lib/supabase";
import { readSession } from "@/lib/equipo-auth";
import { emailFrom } from "@/lib/email";
import { siteConfig } from "@/lib/site-config";
import { SEGMENTOS, renderCampana, type ContenidoCampana, type Segmento } from "@/lib/campanas";

// Campañas de correo a la lista de pacientes (solo administradores).

function soloAdmin(request: NextRequest) {
  const user = readSession(request);
  if (!user) return { denied: NextResponse.json({ error: "Sesión expirada. Vuelve a ingresar." }, { status: 401 }) };
  if (user.role !== "admin") return { denied: NextResponse.json({ error: "Solo administradores." }, { status: 403 }) };
  return { user };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validar(c: Partial<ContenidoCampana>): string | null {
  if (!c.asunto?.trim()) return "Falta el asunto.";
  if (!c.titulo?.trim()) return "Falta el título.";
  if (!c.cuerpo?.trim()) return "Falta el texto del correo.";
  if (c.imagen && !/^https:\/\/\S+$/.test(c.imagen)) return "La imagen debe ser un enlace https.";
  if (c.ctaUrl && !/^https?:\/\/\S+$/.test(c.ctaUrl)) return "El enlace del botón no es válido.";
  if (c.ctaUrl && !c.ctaTexto?.trim()) return "Escribe el texto del botón.";
  return null;
}

function limpiar(c: Partial<ContenidoCampana>): ContenidoCampana {
  return {
    asunto: String(c.asunto ?? "").trim().slice(0, 150),
    preheader: String(c.preheader ?? "").trim().slice(0, 200),
    titulo: String(c.titulo ?? "").trim().slice(0, 150),
    cuerpo: String(c.cuerpo ?? "").trim().slice(0, 10000),
    imagen: c.imagen?.trim() || undefined,
    ctaTexto: c.ctaTexto?.trim() || undefined,
    ctaUrl: c.ctaUrl?.trim() || undefined,
  };
}

export async function GET(request: NextRequest) {
  const { denied } = soloAdmin(request);
  if (denied) return denied;
  const { data } = await getSupabase()
    .from("marketing_campaigns")
    .select("id, nombre, asunto, segmento, estado, programada_para, creado_por, created_at, contenido")
    .order("created_at", { ascending: false })
    .limit(50);
  return NextResponse.json({
    campanas: data ?? [],
    segmentos: Object.entries(SEGMENTOS).map(([key, s]) => ({ key, label: s.label })),
  });
}

export async function POST(request: NextRequest) {
  const { user, denied } = soloAdmin(request);
  if (denied) return denied;
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "El envío de correos no está configurado." }, { status: 503 });
  }
  const body = await request.json().catch(() => null);
  const contenido = limpiar(body?.contenido ?? {});
  const error = validar(contenido);
  if (error) return NextResponse.json({ error }, { status: 400 });
  const resend = new Resend(process.env.RESEND_API_KEY);

  // Prueba: un correo normal a una dirección, con el nombre de ejemplo.
  if (body?.accion === "prueba") {
    const to = String(body.to ?? "").trim();
    if (!EMAIL_RE.test(to)) return NextResponse.json({ error: "Correo de prueba inválido." }, { status: 400 });
    const nombre = String(user.display_name).split(" ")[0];
    const mail = renderCampana(contenido, { nombre, bajaUrl: siteConfig.url });
    const { error: e } = await resend.emails.send({
      from: emailFrom("Sakros"),
      to,
      replyTo: siteConfig.email,
      subject: `[Prueba] ${contenido.asunto}`,
      html: mail.html,
      text: mail.text,
    });
    if (e) return NextResponse.json({ error: "No se pudo enviar la prueba." }, { status: 502 });
    return NextResponse.json({ ok: true });
  }

  // Envío real a un segmento de Resend (Broadcast)
  if (body?.accion === "enviar") {
    const segmento = body.segmento as Segmento;
    if (!(segmento in SEGMENTOS)) return NextResponse.json({ error: "Lista no válida." }, { status: 400 });
    let scheduledAt: string | undefined;
    if (body.programarPara) {
      const d = new Date(body.programarPara);
      if (isNaN(d.getTime()) || d.getTime() < Date.now() + 60_000) {
        return NextResponse.json({ error: "La fecha programada debe ser futura." }, { status: 400 });
      }
      scheduledAt = d.toISOString();
    }
    const nombre = String(body.nombre ?? "").trim().slice(0, 100) || contenido.asunto;
    const mail = renderCampana(contenido);
    const { data, error: e } = await resend.broadcasts.create({
      name: nombre,
      segmentId: SEGMENTOS[segmento].id,
      from: emailFrom("Sakros"),
      replyTo: siteConfig.email,
      subject: contenido.asunto,
      previewText: contenido.preheader || undefined,
      html: mail.html,
      text: mail.text,
      send: true,
      ...(scheduledAt ? { scheduledAt } : {}),
    });
    if (e || !data) {
      console.error("Broadcast:", e?.message);
      return NextResponse.json({ error: `No se pudo enviar la campaña${e?.message ? `: ${e.message}` : "."}` }, { status: 502 });
    }
    await getSupabase().from("marketing_campaigns").insert({
      nombre,
      asunto: contenido.asunto,
      segmento,
      contenido,
      resend_broadcast_id: data.id,
      estado: scheduledAt ? "programada" : "enviada",
      programada_para: scheduledAt ?? null,
      creado_por: user.display_name,
    });
    return NextResponse.json({ ok: true, programada: !!scheduledAt });
  }

  return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
}
