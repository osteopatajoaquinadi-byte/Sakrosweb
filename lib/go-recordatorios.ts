import { Resend } from "resend";
import { getServiceClient } from "@/lib/supabase";
import { emailFrom } from "@/lib/email";
import { renderBrandedEmail } from "@/lib/email-template";

// Recordatorios de Sakros Go, una vez al día (desde el cron de las 10:00 de Chile).
// - Día de entrenamiento: si hoy es uno de los días que la persona eligió en la app.
// - Constancia: si lleva 5 días o más sin registrar nada (como máximo un aviso cada 5 días).
// La persona los apaga en la app («Recordarme por correo»). Se envían solo a clientes
// con cuenta vinculada (go_miembros) y correo.

type Atleta = {
  nombre?: string;
  email?: string;
  diasSemana?: number[]; // 1 = lunes … 7 = domingo
  recordatorios?: boolean;
  recordatorio?: { ult?: string; tipo?: string; inact?: string };
  onb?: number;
  [k: string]: unknown;
};

const DIA_MS = 86_400_000;

function hoyChile(): { fecha: string; dow: number } {
  const now = new Date();
  const fecha = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(now);
  const wd = new Intl.DateTimeFormat("en-US", { timeZone: "America/Santiago", weekday: "short" }).format(now);
  const dow = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(wd) + 1;
  return { fecha, dow };
}

export async function goRecordatorios(opts: { dry?: boolean; origin: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const db = getServiceClient();
  const { fecha, dow } = hoyChile();

  const { data: miembros, error } = await db.from("go_miembros").select("atleta, email").eq("rol", "cliente");
  if (error) return { error: error.message };

  const resend = apiKey && !opts.dry ? new Resend(apiKey) : null;
  const out: { atleta: string; tipo: string; enviado: boolean; error?: string }[] = [];

  for (const m of miembros ?? []) {
    if (!m.atleta || !m.email) continue;
    const { data: doc } = await db.from("go_docs").select("data").eq("path", "atletas").eq("id", m.atleta).maybeSingle();
    const a = (doc?.data ?? {}) as Atleta;
    if (a.recordatorios === false || !a.onb) continue;
    const rec = a.recordatorio ?? {};
    if (rec.ult === fecha) continue;

    // Última actividad: sesión o registro más reciente.
    const { data: ult } = await db
      .from("go_docs")
      .select("updated_at, path")
      .eq("atleta", m.atleta)
      .in("path", [`a/${m.atleta}/sesiones`, `a/${m.atleta}/registro`])
      .order("updated_at", { ascending: false })
      .limit(1);
    const ultima = ult?.[0]?.updated_at ? new Date(ult[0].updated_at).getTime() : null;
    const dias = ultima ? Math.floor((Date.now() - ultima) / DIA_MS) : null;

    let tipo: "dia" | "constancia" | null = null;
    if ((a.diasSemana ?? []).includes(dow) && dias !== 0) tipo = "dia";
    else if (dias != null && dias >= 5) {
      const prev = rec.inact ? (new Date(`${fecha}T12:00:00Z`).getTime() - new Date(`${rec.inact}T12:00:00Z`).getTime()) / DIA_MS : 99;
      if (prev >= 5) tipo = "constancia";
    }
    if (!tipo) continue;

    const nombre = String(a.nombre || "").split(" ")[0] || "Hola";
    const link = `${opts.origin}/go`;
    const mail =
      tipo === "dia"
        ? renderBrandedEmail({
            preheader: "Hoy toca entrenar",
            title: "Hoy toca entrenar",
            greeting: `${nombre}:`,
            paragraphs: [
              "Hoy es uno de tus días de entrenamiento en Sakros Go. Tu sesión ya está lista: empieza con el chequeo de 10 segundos y la app la ajusta a cómo llegas.",
              "Si hoy no puedes, no pasa nada: hazla mañana.",
            ],
            cta: { label: "Abrir mi sesión", href: link },
            closing: ["Equipo Sakros"],
          })
        : renderBrandedEmail({
            preheader: "Tu plan te espera",
            title: "Retomemos tu entrenamiento",
            greeting: `${nombre}:`,
            paragraphs: [
              `Llevas ${dias} días sin entrenar con Sakros Go. Retomar es más fácil de lo que parece: la próxima sesión te espera donde la dejaste.`,
              "Si algo te está costando (tiempo, dolor o motivación), cuéntaselo al Coach en la app y lo ajustamos.",
            ],
            cta: { label: "Volver a entrenar", href: link },
            closing: ["Equipo Sakros"],
          });
    const asunto = tipo === "dia" ? "Hoy toca entrenar" : "Tu plan de Sakros Go te espera";

    let enviado = false;
    let err: string | undefined;
    if (resend) {
      const r = await resend.emails
        .send({ from: emailFrom("Sakros Go"), to: m.email, subject: asunto, html: mail.html, text: mail.text })
        .catch((e: unknown) => ({ error: e as { message?: string } }));
      if (r.error) err = String((r.error as { message?: string }).message ?? r.error);
      else enviado = true;
    }
    if (enviado) {
      const nuevo = { ...a, recordatorio: { ...rec, ult: fecha, tipo, ...(tipo === "constancia" ? { inact: fecha } : {}) } };
      await db.from("go_docs").update({ data: nuevo, updated_at: new Date().toISOString() }).eq("path", "atletas").eq("id", m.atleta);
    }
    out.push({ atleta: m.atleta, tipo, enviado, ...(err ? { error: err } : {}) });
  }
  return { fecha, dow, dry: !!opts.dry, total: out.length, resultados: out };
}
