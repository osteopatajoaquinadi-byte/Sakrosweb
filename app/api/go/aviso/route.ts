import { createHash } from "node:crypto";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { goMiembro } from "@/lib/go-auth";
import { emailFrom } from "@/lib/email";
import { renderBrandedEmail } from "@/lib/email-template";
import { siteConfig } from "@/lib/site-config";

// Avisos al entrenador por correo:
// - «fms»: un cliente completó su evaluación de movimiento y espera la revisión (48 h).
// - «alerta»: un cliente marcó señales de alarma al entrar (plan suave).
const TIPOS = {
  fms: {
    asunto: "Sakros Go: evaluación lista para revisar",
    titulo: "Evaluación de movimiento lista",
    texto: "completó su evaluación de movimiento por video. Prometimos revisarla en 48 horas: entra a Sakros Go, elige al atleta, abre su evaluación y marca «Revisado».",
  },
  alerta: {
    asunto: "Sakros Go: cliente con señales de alarma",
    titulo: "Cliente con señales de alarma",
    texto: "marcó señales de alarma al crear su plan. La app le dejó un plan suave y le recomendó evaluarse. Conviene contactarlo.",
  },
} as const;

export async function POST(request: NextRequest) {
  const m = await goMiembro(request);
  if (!m || m.rol !== "cliente" || !m.atleta) return NextResponse.json({ ok: false }, { status: 401 });
  let b: { tipo?: unknown; detalle?: unknown };
  try {
    b = JSON.parse((await request.text()).slice(0, 4000));
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const tipo = b.tipo === "fms" || b.tipo === "alerta" ? b.tipo : null;
  if (!tipo) return NextResponse.json({ ok: false }, { status: 400 });

  const db = getServiceClient();
  // Pocos avisos por persona al día: evita que un error del cliente llene el correo.
  // Contador propio (no comparte el del Coach): clave derivada del usuario.
  const hx = createHash("md5").update("go-aviso:" + m.userId).digest("hex");
  const clave = `${hx.slice(0, 8)}-${hx.slice(8, 12)}-${hx.slice(12, 16)}-${hx.slice(16, 20)}-${hx.slice(20, 32)}`;
  const { data: permitido } = await db.rpc("go_usar", { p_user: clave, p_max: 6 });
  if (permitido === false) return NextResponse.json({ ok: true, limitado: true });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ ok: true, sinCorreo: true });
  const { data: doc } = await db.from("go_docs").select("data").eq("path", "atletas").eq("id", m.atleta).maybeSingle();
  const nombre = String((doc?.data as { nombre?: unknown } | null)?.nombre || "Un cliente").slice(0, 80);
  const detalle = typeof b.detalle === "string" ? b.detalle.replace(/\s+/g, " ").trim().slice(0, 400) : "";
  const T = TIPOS[tipo];
  const { html, text } = renderBrandedEmail({
    preheader: T.titulo,
    title: T.titulo,
    greeting: "Hola:",
    paragraphs: [`${nombre} (${m.email}) ${T.texto}`, detalle ? `Detalle: ${detalle}` : "", "Entrar: https://sakros.cl/go"].filter(Boolean),
    closing: ["Sakros Go"],
  });
  const to = process.env.GO_ALERTAS_EMAIL || siteConfig.email;
  try {
    await new Resend(apiKey).emails.send({ from: emailFrom("Sakros Go"), to, subject: `${T.asunto} · ${nombre}`, html, text });
  } catch (e) {
    console.error("Sakros Go aviso:", e);
  }
  return NextResponse.json({ ok: true });
}
