import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/equipo-auth";
import { pedirResenas } from "@/lib/resenas";

// Pide reseña en Google a quienes se atendieron. Vercel Cron la llama cada día
// (ver vercel.json) para las atenciones de ayer. Un administrador con sesión
// abierta puede abrirla con ?desde=AAAA-MM-DD&hasta=AAAA-MM-DD para ver a
// quiénes les llegaría, y agregar &enviar=1 para mandarlos.

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const fechaChile = (diasAtras: number) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(
    new Date(Date.now() - diasAtras * 24 * 3600 * 1000)
  );
const esFecha = (s: string | null) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const esCron = !!secret && request.headers.get("authorization") === `Bearer ${secret}`;
  const staff = requireStaff(request, "agendar");
  const esAdmin = !staff.denied && staff.user.role === "admin";
  if (!esCron && !esAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const url = new URL(request.url);
  const ayer = fechaChile(1);
  const desde = esAdmin && esFecha(url.searchParams.get("desde")) ? url.searchParams.get("desde")! : ayer;
  const hasta = esAdmin && esFecha(url.searchParams.get("hasta")) ? url.searchParams.get("hasta")! : ayer;
  if (hasta > ayer) return NextResponse.json({ error: "Solo atenciones hasta ayer." }, { status: 400 });
  // El cron envía siempre; a mano, solo con &enviar=1 (si no, es vista previa).
  const enviar = esCron || url.searchParams.get("enviar") === "1";

  try {
    const r = await pedirResenas(desde, hasta, enviar);
    const cuenta = (e: string) => r.destinatarios.filter((d) => d.estado === e).length;
    return NextResponse.json({
      ...r,
      resumen: {
        total: r.destinatarios.length,
        enviados: cuenta("enviado"),
        se_enviarian: cuenta("se enviaría"),
        ya_pedidos: cuenta("ya se le pidió antes"),
        dados_de_baja: cuenta("dado de baja, no se envía"),
      },
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
