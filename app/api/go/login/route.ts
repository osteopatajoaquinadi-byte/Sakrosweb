import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getServiceClient } from "@/lib/supabase";
import { emailFrom } from "@/lib/email";
import { renderBrandedEmail } from "@/lib/email-template";
import { errorServidor } from "@/lib/go-errores";

// Envía el enlace de acceso a Sakros Go. Se genera con la API de
// administración de Supabase y se manda con Resend: el enlace lleva un
// token de un solo uso que la página /go canjea por una sesión.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ error: "Escribe un correo válido." }, { status: 400 });
  }
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "El envío de correos no está configurado." }, { status: 503 });
  }

  const db = getServiceClient();

  // Máximo 5 enlaces por correo al día, para que nadie use el formulario para spamear.
  const h = createHash("md5").update("go-login:" + email).digest("hex");
  const key = `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
  const { data: permitido } = await db.rpc("go_usar", { p_user: key, p_max: 5 });
  if (permitido === false) {
    return NextResponse.json(
      { error: "Ya te enviamos varios enlaces hoy. Revisa tu correo (también en spam)." },
      { status: 429 },
    );
  }

  // En construcción: solo reciben enlace los correos que autoriza el coach.
  const { data: autorizado, error: errAut } = await db.rpc("go_email_autorizado", { p_email: email });
  if (errAut) {
    console.error("Sakros Go login (autorizado):", errAut.message);
    await errorServidor("Login (correo autorizado)", errAut);
    return NextResponse.json({ error: "No se pudo revisar tu correo. Inténtalo de nuevo." }, { status: 500 });
  }
  if (autorizado !== true) {
    return NextResponse.json(
      { error: "Sakros Go está en construcción. Por ahora solo pueden entrar las personas invitadas por Sakros." },
      { status: 403 },
    );
  }

  // Crea la cuenta si no existe (el error de "ya existe" se ignora).
  await db.auth.admin.createUser({ email, email_confirm: true }).catch(() => null);
  const { data, error } = await db.auth.admin.generateLink({ type: "magiclink", email });
  const tokenHash = data?.properties?.hashed_token;
  if (error || !tokenHash) {
    console.error("Sakros Go login:", error?.message);
    await errorServidor("Login (generar enlace)", error ?? "sin token");
    return NextResponse.json({ error: "No se pudo generar el enlace. Inténtalo de nuevo." }, { status: 500 });
  }

  const link = `${request.nextUrl.origin}/go?th=${encodeURIComponent(tokenHash)}`;
  const { html, text } = renderBrandedEmail({
    preheader: "Tu enlace para entrar a Sakros Go",
    title: "Entra a Sakros Go",
    greeting: "Hola:",
    paragraphs: [
      "Toca el botón para entrar a tu plan de entrenamiento. El enlace sirve una sola vez y vence en una hora.",
      "Después, entra directo en sakros.cl/go desde el mismo teléfono: tu sesión queda abierta y no necesitas este correo otra vez. Si alguna vez te pide entrar de nuevo, escribe tu correo ahí y te mandamos otro enlace.",
      "Si no pediste este correo, puedes ignorarlo.",
    ],
    cta: { label: "Entrar a Sakros Go", href: link },
    closing: ["Equipo Sakros"],
  });

  const envio = await new Resend(apiKey).emails
    .send({ from: emailFrom("Sakros Go"), to: email, subject: "Tu enlace para entrar a Sakros Go", html, text })
    .catch((e: unknown) => ({ error: e }));
  if (envio.error) {
    console.error("Sakros Go login (Resend):", envio.error);
    await errorServidor("Login (enviar correo)", envio.error);
    return NextResponse.json({ error: "No se pudo enviar el correo. Inténtalo de nuevo." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
