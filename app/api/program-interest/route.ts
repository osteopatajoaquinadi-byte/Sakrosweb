import { NextResponse } from "next/server";
import { Resend } from "resend";

// Lead del Programa de Rehabilitación Kinésica. La reserva real se hace en
// Tuu, acá solo capturamos los datos para que Sakros sepa quién pregunta y
// pueda hacer seguimiento si no termina el pago.
export async function POST(request: Request) {
  const { name, email, phone, prevision, notes } = await request.json().catch(() => ({}));

  if (!name || !email || !phone || !prevision) {
    return NextResponse.json(
      { error: "Faltan datos obligatorios." },
      { status: 400 },
    );
  }
  if (prevision !== "fonasa" && prevision !== "isapre") {
    return NextResponse.json({ error: "Previsión inválida." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const resend = new Resend(apiKey);
    try {
      await resend.emails.send({
        from: "Reservas Sakros <onboarding@resend.dev>",
        to: "osteopatajoaquinadi@gmail.com",
        replyTo: email,
        subject: `Programa de rehabilitación (${prevision.toUpperCase()}): ${name}`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 520px; color:#1e293b">
            <p>Un paciente dejó sus datos para el Programa de Rehabilitación Kinésica:</p>
            <ul style="line-height:1.7">
              <li><strong>Nombre:</strong> ${escapeHtml(name)}</li>
              <li><strong>Email:</strong> ${escapeHtml(email)}</li>
              <li><strong>Teléfono:</strong> ${escapeHtml(phone)}</li>
              <li><strong>Previsión:</strong> ${prevision.toUpperCase()}</li>
              ${notes ? `<li><strong>Comentarios:</strong> ${escapeHtml(String(notes))}</li>` : ""}
            </ul>
            <p style="color:#64748b;font-size:13px">Se le mostró el link de Tuu correspondiente. Si en 48 h no reservó, un seguimiento personal suele ayudar.</p>
          </div>
        `,
      });
    } catch (e) {
      console.error("program-interest email error:", e);
    }
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
