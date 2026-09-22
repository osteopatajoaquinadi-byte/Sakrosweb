import { NextResponse } from "next/server";
import { Resend } from "resend";
import { siteConfig } from "@/lib/site-config";

export async function POST(request: Request) {
  try {
    const { name, email, phone, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios." },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY no está configurada.");
      return NextResponse.json(
        { error: "El formulario no está disponible en este momento." },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    await resend.emails.send({
      // TODO (Juaco/Vercel): "from" debe ser una dirección de un dominio
      // verificado en Resend (ej. contacto@sakros.cl) una vez que exista.
      // Mientras tanto, Resend permite usar su dominio de pruebas.
      from: "Sakros Web <onboarding@resend.dev>",
      to: siteConfig.email,
      replyTo: email,
      subject: `Nuevo contacto desde sakros.cl — ${name}`,
      text: `Nombre: ${name}\nEmail: ${email}\nTeléfono: ${phone || "No indicado"}\n\nMensaje:\n${message}`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error enviando formulario de contacto:", error);
    return NextResponse.json(
      { error: "No pudimos enviar tu mensaje. Intenta por WhatsApp." },
      { status: 500 }
    );
  }
}
