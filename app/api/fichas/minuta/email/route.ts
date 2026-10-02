import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { requireStaff } from "@/lib/equipo-auth";
import { siteConfig } from "@/lib/site-config";

// Envía la minuta generada al correo del paciente.

type Comida = { n?: string; v?: string[]; p?: number; h?: number; g?: number; k?: number };
type Dia = { i?: number; t?: string; b?: Comida; a?: Comida; c?: Comida; s?: Comida };

const COMIDAS: [keyof Dia, string][] = [
  ["b", "Desayuno"],
  ["a", "Almuerzo"],
  ["c", "Cena"],
  ["s", "Snack"],
];

function esc(s: unknown) {
  return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

export async function POST(request: NextRequest) {
  const { denied } = requireStaff(request, "clinico");
  if (denied) return denied;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "El envío de correos no está configurado." }, { status: 503 });
  }

  const { to, name, plan } = await request.json();
  if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to) || !Array.isArray(plan?.d) || plan.d.length === 0) {
    return NextResponse.json({ error: "Falta el correo del paciente o la minuta." }, { status: 400 });
  }

  const dias = plan.d as Dia[];
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#0f172a">
      <h1 style="color:#0f766e;font-size:22px">Plan nutricional Sakros</h1>
      <p>Hola ${esc(name)}, aquí está tu minuta personalizada de 10 días.</p>
      ${plan.e ? `<p style="color:#166534;background:#f0fdf4;padding:10px;border-radius:8px">${esc(plan.e)}</p>` : ""}
      ${dias
        .map(
          (d) => `
        <h2 style="font-size:16px;margin-top:24px;border-bottom:1px solid #e2e8f0;padding-bottom:4px">
          Día ${esc(d.i)}${d.t ? ` · ${esc(d.t)}` : ""}
        </h2>
        ${COMIDAS.map(([k, label]) => {
          const c = d[k] as Comida | undefined;
          if (!c?.n) return "";
          return `<p style="margin:8px 0"><strong>${label}:</strong> ${esc(c.n)}<br>
            <span style="color:#475569">${esc((c.v || []).join(", "))}</span><br>
            <span style="color:#94a3b8;font-size:12px">P ${esc(c.p)}g · HC ${esc(c.h)}g · G ${esc(c.g)}g · ${esc(c.k)} kcal</span></p>`;
        }).join("")}`
        )
        .join("")}
      ${plan.n ? `<p style="margin-top:24px;background:#fffbeb;padding:10px;border-radius:8px;color:#92400e">${esc(plan.n)}</p>` : ""}
      <p style="margin-top:24px;color:#64748b;font-size:12px">
        ${esc(siteConfig.name)} · Este plan es una guía educativa y se ajusta en tus controles.
      </p>
    </div>`;

  try {
    const { error } = await new Resend(apiKey).emails.send({
      // Mientras no haya dominio verificado en Resend se usa su dominio de pruebas.
      from: "Sakros <onboarding@resend.dev>",
      to,
      replyTo: siteConfig.email,
      subject: `Plan nutricional Sakros — ${name || "Paciente"}`,
      html,
    });
    if (error) {
      console.error("Resend minuta:", error);
      return NextResponse.json({ error: error.message || "No se pudo enviar el correo." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error enviando minuta:", err);
    return NextResponse.json({ error: "No se pudo enviar el correo." }, { status: 500 });
  }
}
