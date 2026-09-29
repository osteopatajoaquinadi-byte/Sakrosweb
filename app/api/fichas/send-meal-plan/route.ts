import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { verifyPin } from "@/lib/equipo-auth";

export async function POST(request: NextRequest) {
  const denied = verifyPin(request);
  if (denied) return denied;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "RESEND_API_KEY no configurada en el servidor." },
      { status: 500 },
    );
  }

  const { email, body } = await request.json();

  if (!email || !body) {
    return NextResponse.json(
      { error: "Faltan parametros: email, body." },
      { status: 400 },
    );
  }

  try {
    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: "Sakros <onboarding@resend.dev>",
      to: email,
      subject: "Plan Nutricional Sakros",
      text: body,
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    console.error("Error enviando minuta:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
