import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { requireStaff } from "@/lib/equipo-auth";
import { emailFrom } from "@/lib/email";
import { renderBrandedEmail } from "@/lib/email-template";
import { siteConfig } from "@/lib/site-config";
import { firstNameOf } from "@/lib/booking-emails";

// Envía al paciente su plan de ejercicios (PDF generado en el navegador del
// profesional) como adjunto, con la plantilla de correo de Sakros.

const MAX_PDF_BYTES = 3_200_000; // en base64 queda bajo el límite de 4,5 MB de Vercel

export async function POST(request: NextRequest) {
  const { user, denied } = requireStaff(request, "clinico");
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const to = String(body?.to ?? "").trim();
  const paciente = String(body?.paciente ?? "").trim();
  const filename = String(body?.filename ?? "plan-ejercicios.pdf").replace(/[^\w.-]/g, "-");
  const pdf = String(body?.pdf ?? "");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: "Correo del paciente inválido." }, { status: 400 });
  }
  if (!pdf) return NextResponse.json({ error: "Falta el PDF." }, { status: 400 });
  const content = Buffer.from(pdf, "base64");
  if (content.length === 0 || content.length > MAX_PDF_BYTES) {
    return NextResponse.json(
      { error: "El PDF es demasiado grande para enviarlo por correo. Descárgalo y adjúntalo a mano." },
      { status: 413 }
    );
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "El envío de correos no está configurado." }, { status: 503 });
  }

  const nombre = firstNameOf(paciente) || "";
  const profesional = user.display_name;
  const mail = renderBrandedEmail({
    preheader: `${profesional} te envió tu plan de ejercicios.`,
    badge: { text: "Plan de ejercicios", tone: "info" },
    title: "Tu plan de ejercicios",
    greeting: nombre ? `Hola ${nombre},` : "Hola,",
    paragraphs: [
      `${profesional} te envía tu plan de ejercicios. Lo encuentras adjunto en PDF, con las indicaciones y la dosificación de cada ejercicio.`,
      "Si tienes dudas con algún ejercicio o sientes molestias al hacerlo, escríbenos antes de tu próxima sesión.",
    ],
    closing: ["Un abrazo,", "Equipo Sakros"],
  });

  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: emailFrom("Sakros"),
    to,
    replyTo: siteConfig.email,
    subject: `Tu plan de ejercicios — Sakros`,
    html: mail.html,
    text: mail.text,
    attachments: [{ filename, content, contentType: "application/pdf" }],
  });
  if (error) {
    console.error("Enviar plan:", error.message);
    return NextResponse.json({ error: "No se pudo enviar el correo." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
