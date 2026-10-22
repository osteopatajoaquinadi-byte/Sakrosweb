import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { goMiembro } from "@/lib/go-auth";
import { mercadoPagoEnabled } from "@/lib/mercadopago";
import {
  TERMINOS_V,
  cancelarSuscripcion,
  crearSuscripcion,
  leerVenta,
  sincronizarSuscripcion,
} from "@/lib/go-suscripcion";

// POST: crea la suscripción mensual en Mercado Pago y devuelve el enlace de pago.
export async function POST(request: NextRequest) {
  const m = await goMiembro(request);
  if (!m || m.rol !== "cliente" || !m.atleta) {
    return NextResponse.json({ error: "Solo los clientes pueden suscribirse." }, { status: 403 });
  }
  if (!mercadoPagoEnabled()) {
    return NextResponse.json({ error: "Los pagos no están disponibles." }, { status: 503 });
  }
  const db = getServiceClient();
  const venta = await leerVenta(db);
  if (!venta.activo) {
    return NextResponse.json({ error: "La suscripción todavía no está disponible." }, { status: 409 });
  }
  const { data: doc } = await db.from("go_docs").select("data").eq("path", "atletas").eq("id", m.atleta).maybeSingle();
  const terminos = (doc?.data as { terminos?: { v?: string } } | undefined)?.terminos;
  if (terminos?.v !== TERMINOS_V) {
    return NextResponse.json({ error: "Acepta los términos y el descargo de salud para continuar." }, { status: 409 });
  }
  const { data: a } = await db.from("go_accesos").select("hasta, mp_estado").eq("atleta", m.atleta).maybeSingle();
  if (a?.mp_estado === "authorized" && a.hasta && new Date(a.hasta) > new Date()) {
    return NextResponse.json({ error: "Ya tienes una suscripción activa." }, { status: 409 });
  }

  try {
    const pre = await crearSuscripcion({
      atleta: m.atleta,
      email: m.email,
      precio: venta.precio,
      backUrl: `${request.nextUrl.origin}/go?sub=ok`,
    });
    await db.from("go_accesos").upsert({
      atleta: m.atleta,
      hasta: a?.hasta ?? null,
      mp_preapproval_id: pre.id,
      mp_estado: pre.status,
      precio: venta.precio,
      updated_at: new Date().toISOString(),
    });
    if (!pre.init_point) throw new Error("Mercado Pago no devolvió el enlace de pago.");
    return NextResponse.json({ url: pre.init_point });
  } catch (e) {
    console.error("Sakros Go, crear suscripción:", e);
    return NextResponse.json({ error: "No se pudo iniciar el pago. Inténtalo de nuevo." }, { status: 502 });
  }
}

// DELETE: cancela la renovación. El acceso sigue hasta la fecha ya pagada.
export async function DELETE(request: NextRequest) {
  const m = await goMiembro(request);
  if (!m || m.rol !== "cliente" || !m.atleta) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }
  const db = getServiceClient();
  const { data: a } = await db.from("go_accesos").select("mp_preapproval_id").eq("atleta", m.atleta).maybeSingle();
  if (!a?.mp_preapproval_id) return NextResponse.json({ error: "No tienes una suscripción." }, { status: 404 });
  try {
    await cancelarSuscripcion(a.mp_preapproval_id);
    await sincronizarSuscripcion(db, a.mp_preapproval_id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Sakros Go, cancelar suscripción:", e);
    return NextResponse.json({ error: "No se pudo cancelar. Inténtalo de nuevo." }, { status: 502 });
  }
}
