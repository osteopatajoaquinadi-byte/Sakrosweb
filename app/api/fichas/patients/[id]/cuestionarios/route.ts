import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getServiceClient as getSupabase } from "@/lib/supabase";
import { requireStaff } from "@/lib/equipo-auth";
import { emailFrom } from "@/lib/email";
import { renderBrandedEmail } from "@/lib/email-template";
import { siteConfig } from "@/lib/site-config";
import { firstNameOf } from "@/lib/booking-emails";
import { puntuarTHI, validarTHI } from "@/lib/cuestionarios/thi";

const DIAS_VIGENCIA = 30;

// Cuestionarios del paciente (THI). GET lista, POST completa uno en la
// ficha o envía el link al paciente, DELETE borra uno.

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { denied } = requireStaff(request, "clinico");
  if (denied) return denied;
  const { id } = await params;
  const { data, error } = await getSupabase()
    .from("fichas_cuestionarios")
    .select("id, tipo, estado, origen, respuestas, puntaje, severidad, subescalas, expira_at, creado_por, created_at, respondido_at")
    .eq("patient_id", id)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "No se pudieron cargar los cuestionarios." }, { status: 500 });
  return NextResponse.json({ cuestionarios: data ?? [] });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, denied } = requireStaff(request, "clinico");
  if (denied) return denied;
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (body?.tipo !== "THI") return NextResponse.json({ error: "Cuestionario no reconocido." }, { status: 400 });
  const db = getSupabase();

  // 1) Completado por el profesional en la ficha
  if (!body.enviar) {
    const respuestas = validarTHI(body.respuestas);
    if (!respuestas) return NextResponse.json({ error: "Faltan respuestas: contesta las 25 preguntas." }, { status: 400 });
    const r = puntuarTHI(respuestas);
    const { data, error } = await db
      .from("fichas_cuestionarios")
      .insert({
        patient_id: id,
        tipo: "THI",
        estado: "respondido",
        origen: "profesional",
        respuestas,
        puntaje: r.puntaje,
        severidad: r.severidad,
        subescalas: r.subescalas,
        creado_por: user.display_name,
        respondido_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: "No se pudo guardar el cuestionario." }, { status: 500 });
    return NextResponse.json({ ok: true, id: data.id, ...r });
  }

  // 2) Enviar link al paciente para que lo responda en su casa
  const { data: patient } = await db.from("fichas_patients").select("name, email").eq("id", id).single();
  const to = patient?.email?.trim() ?? "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: "Este paciente no tiene un correo válido en su ficha." }, { status: 400 });
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "El envío de correos no está configurado." }, { status: 503 });
  }

  const token = randomBytes(24).toString("base64url");
  const expira = new Date(Date.now() + DIAS_VIGENCIA * 86400_000);
  const { data: fila, error } = await db
    .from("fichas_cuestionarios")
    .insert({
      patient_id: id,
      tipo: "THI",
      estado: "pendiente",
      origen: "paciente",
      token,
      expira_at: expira.toISOString(),
      creado_por: user.display_name,
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: "No se pudo crear el cuestionario." }, { status: 500 });

  const link = `${siteConfig.url}/cuestionario/${token}`;
  const nombre = firstNameOf(patient?.name ?? "");
  const mail = renderBrandedEmail({
    preheader: "Responde este breve cuestionario antes de tu próxima sesión.",
    badge: { text: "Cuestionario", tone: "info" },
    title: "Cuestionario sobre tu tinnitus",
    greeting: nombre ? `Hola ${nombre},` : "Hola,",
    paragraphs: [
      `${user.display_name} te pide responder el Inventario de Incapacidad de Tinnitus (THI). Son 25 preguntas breves, te toma unos 5 minutos.`,
      "Tus respuestas nos ayudan a medir cómo te afecta el zumbido y a seguir tu evolución durante el tratamiento.",
    ],
    cta: { label: "Responder cuestionario", href: link },
    closing: [`El link es personal y está disponible por ${DIAS_VIGENCIA} días.`, "Equipo Sakros"],
  });
  const { error: sendErr } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: emailFrom("Sakros"),
    to,
    replyTo: siteConfig.email,
    subject: "Cuestionario sobre tu tinnitus — Sakros",
    html: mail.html,
    text: mail.text,
  });
  if (sendErr) {
    await db.from("fichas_cuestionarios").delete().eq("id", fila.id);
    return NextResponse.json({ error: "No se pudo enviar el correo." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, id: fila.id, to, link });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { denied } = requireStaff(request, "clinico");
  if (denied) return denied;
  const { id } = await params;
  const cid = new URL(request.url).searchParams.get("cid");
  if (!cid) return NextResponse.json({ error: "Falta el id." }, { status: 400 });
  const { error } = await getSupabase().from("fichas_cuestionarios").delete().eq("id", cid).eq("patient_id", id);
  if (error) return NextResponse.json({ error: "No se pudo eliminar." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
