import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { goMiembro } from "@/lib/go-auth";
import { TERMINOS_V, leerVenta, sincronizarSuscripcion } from "@/lib/go-suscripcion";
import { errorServidor } from "@/lib/go-errores";

// Estado del acceso del cliente (suscripción o acceso dado por el coach).
// Si la suscripción está por vencer, consulta a Mercado Pago por si ya hubo
// un cobro nuevo (por si el aviso automático no llegó).
export async function GET(request: NextRequest) {
  const m = await goMiembro(request);
  if (!m) return NextResponse.json({ error: "Inicia sesión de nuevo." }, { status: 401 });
  const db = getServiceClient();
  const venta = await leerVenta(db);
  if (m.rol === "coach") return NextResponse.json({ rol: "coach", activo: true, venta, terminosV: TERMINOS_V });

  let { data: a } = await db.from("go_accesos").select("*").eq("atleta", m.atleta).maybeSingle();
  const pronto = !a?.hasta || new Date(a.hasta).getTime() < Date.now() + 2 * 86400000;
  if (a?.mp_preapproval_id && pronto && a.mp_estado !== "cancelled" && process.env.MP_ACCESS_TOKEN) {
    try {
      await sincronizarSuscripcion(db, a.mp_preapproval_id);
      ({ data: a } = await db.from("go_accesos").select("*").eq("atleta", m.atleta).maybeSingle());
    } catch (e) {
      console.error("Sakros Go, sincronizar suscripción:", e);
      await errorServidor("Sincronizar suscripción", e, m);
    }
  }
  const activo = !!a?.hasta && new Date(a.hasta) > new Date();
  return NextResponse.json({
    rol: "cliente",
    activo,
    hasta: a?.hasta ?? null,
    origen: a?.origen ?? null,
    plan: a?.plan ?? "entrenamiento",
    estado: a?.mp_estado ?? null,
    venta,
    terminosV: TERMINOS_V,
  });
}
