import { NextRequest, NextResponse } from "next/server";
import { getSupabase, getServiceClient } from "@/lib/supabase";
import { verifyPin } from "@/lib/equipo-auth";

/* ── GET: listar leads (protegido con PIN) ── */
export async function GET(request: NextRequest) {
  const authError = verifyPin(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const servicio = url.searchParams.get("servicio");
  const estado = url.searchParams.get("estado");

  const supabase = getServiceClient();
  let query = supabase
    .from("campaign_leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (servicio) query = query.eq("servicio", servicio);
  if (estado) query = query.eq("estado", estado);

  const { data, error } = await query;

  if (error) {
    console.error("Error leyendo leads:", error);
    return NextResponse.json({ error: "Error al cargar leads." }, { status: 500 });
  }

  return NextResponse.json({ leads: data });
}

/* ── PATCH: actualizar estado/notas de un lead (protegido con PIN) ── */
export async function PATCH(request: NextRequest) {
  const authError = verifyPin(request);
  if (authError) return authError;

  const body = await request.json();
  const { id, estado, notas } = body;

  if (!id) {
    return NextResponse.json({ error: "ID requerido." }, { status: 400 });
  }

  const updates: Record<string, string> = {};
  if (estado) updates.estado = estado;
  if (notas !== undefined) updates.notas = notas;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nada que actualizar." }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { error } = await supabase
    .from("campaign_leads")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("Error actualizando lead:", error);
    return NextResponse.json({ error: "Error al actualizar." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/* ── POST: recibir nuevo lead (público, sin PIN) ── */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, whatsapp, dolor, duracion, hace_deporte, servicio, utm_source, utm_medium, utm_campaign, utm_content } = body;

    if (!nombre || !whatsapp || !dolor || !duracion || !hace_deporte) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios." },
        { status: 400 },
      );
    }

    // Validar formato de WhatsApp (Chile: 9 dígitos)
    const cleanPhone = whatsapp.replace(/\D/g, "");
    if (cleanPhone.length < 8 || cleanPhone.length > 15) {
      return NextResponse.json(
        { error: "Número de WhatsApp no válido." },
        { status: 400 },
      );
    }

    const supabase = getSupabase();

    const { error } = await supabase.from("campaign_leads").insert({
      nombre,
      whatsapp: cleanPhone,
      dolor,
      duracion,
      hace_deporte,
      servicio: servicio || "osteopatia",
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
      utm_content: utm_content || null,
    });

    if (error) {
      console.error("Error guardando lead:", error);
      return NextResponse.json(
        { error: "No pudimos procesar tu solicitud." },
        { status: 500 },
      );
    }

    // Notificar a Sakros por email (si Resend está configurado)
    try {
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: "Sakros Web <onboarding@resend.dev>",
          to: "sakrosvina@gmail.com",
          subject: `Nuevo lead campaña ${servicio || "osteopatia"} — ${nombre}`,
          text: [
            `Nombre: ${nombre}`,
            `WhatsApp: +56${cleanPhone}`,
            `Dolor: ${dolor}`,
            `Duración: ${duracion}`,
            `Deporte: ${hace_deporte}`,
            `Servicio: ${servicio || "osteopatia"}`,
            utm_source ? `UTM: ${utm_source} / ${utm_medium} / ${utm_campaign}` : "",
            "",
            "Contactar lo antes posible — el lead espera tu mensaje por WhatsApp.",
          ].filter(Boolean).join("\n"),
        });
      }
    } catch (emailErr) {
      // No fallar el lead si el email no se manda
      console.error("Error enviando notificación:", emailErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error en campaign-leads:", err);
    return NextResponse.json(
      { error: "Error interno." },
      { status: 500 },
    );
  }
}
