import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getServiceClient as getSupabase } from "@/lib/supabase";
import { requireStaff } from "@/lib/equipo-auth";
import { emailFrom } from "@/lib/email";
import { renderBrandedEmail } from "@/lib/email-template";
import { siteConfig } from "@/lib/site-config";
import { firstNameOf } from "@/lib/booking-emails";

// Correo libre al paciente desde su ficha (indicaciones, recordatorios…),
// con la plantilla de Sakros. El destinatario sale de la ficha, no del navegador.

const MAX_ADJUNTO = 3_000_000;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, denied } = requireStaff(request, "pacientes");
  if (denied) return denied;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const asunto = String(body?.subject ?? "").trim().slice(0, 150);
  const mensaje = String(body?.message ?? "").trim().slice(0, 8000);
  const adjunto = body?.attachment as { filename?: string; content?: string; type?: string } | undefined;
  if (!asunto || !mensaje) {
    return NextResponse.json({ error: "Escribe el asunto y el mensaje." }, { status: 400 });
  }

  const { data: patient } = await getSupabase()
    .from("fichas_patients")
    .select("name, email")
    .eq("id", id)
    .single();
  const to = patient?.email?.trim() ?? "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: "Este paciente no tiene un correo válido en su ficha." }, { status: 400 });
  }

  let attachments: { filename: string; content: Buffer; contentType?: string }[] | undefined;
  if (adjunto?.content) {
    const content = Buffer.from(adjunto.content, "base64");
    if (content.length === 0 || content.length > MAX_ADJUNTO) {
      return NextResponse.json({ error: "El archivo adjunto es demasiado grande (máximo 3 MB)." }, { status: 413 });
    }
    attachments = [{
      filename: String(adjunto.filename || "adjunto").replace(/[^\w.\- ]/g, "-").slice(0, 100),
      content,
      contentType: adjunto.type || undefined,
    }];
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "El envío de correos no está configurado." }, { status: 503 });
  }

  const nombre = firstNameOf(patient?.name ?? "");
  const firma = user.display_name;
  // Párrafos separados por línea en blanco; los saltos simples se mantienen.
  const parrafos = mensaje.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const mail = renderBrandedEmail({
    preheader: parrafos[0]?.slice(0, 120) ?? asunto,
    title: asunto,
    greeting: nombre ? `Hola ${nombre},` : "Hola,",
    paragraphs: parrafos,
    closing: ["Saludos,", `${firma} · Sakros`],
  });

  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: emailFrom("Sakros"),
    to,
    replyTo: siteConfig.email,
    subject: `${asunto} — Sakros`,
    html: mail.html,
    text: mail.text,
    attachments,
  });
  if (error) {
    console.error("Correo a paciente:", error.message);
    return NextResponse.json({ error: "No se pudo enviar el correo." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, to });
}
