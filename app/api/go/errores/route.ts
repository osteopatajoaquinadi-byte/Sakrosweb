import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { goMiembro } from "@/lib/go-auth";
import { registrarError } from "@/lib/go-errores";

// Recibe los errores que la app Sakros Go detecta en el navegador.
// Acepta envíos sin sesión (el error puede ocurrir antes de entrar), con un
// límite diario por dirección para que nadie lo use para llenar la tabla.
const TIPOS = new Set(["error", "promesa", "sincronizacion", "api", "render"]);

export async function POST(request: NextRequest) {
  const raw = await request.text().catch(() => "");
  if (!raw || raw.length > 12_000) return NextResponse.json({ ok: false }, { status: 400 });
  let b: Record<string, unknown>;
  try {
    b = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const mensaje = typeof b.mensaje === "string" ? b.mensaje.trim() : "";
  if (!mensaje) return NextResponse.json({ ok: false }, { status: 400 });

  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "sin-ip";
  const h = createHash("md5").update("go-errores:" + ip).digest("hex");
  const clave = `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
  try {
    const { data: permitido } = await getServiceClient().rpc("go_usar", { p_user: clave, p_max: 50 });
    if (permitido === false) return NextResponse.json({ ok: true, limitado: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const m = await goMiembro(request).catch(() => null);
  await registrarError({
    origen: "app",
    tipo: TIPOS.has(String(b.tipo)) ? String(b.tipo) : "error",
    mensaje,
    detalle: typeof b.detalle === "string" ? b.detalle : null,
    url: typeof b.url === "string" ? b.url : null,
    ua: request.headers.get("user-agent"),
    version: typeof b.version === "string" ? b.version : null,
    atleta: m?.atleta ?? (typeof b.atleta === "string" ? b.atleta : null),
    userId: m?.userId ?? null,
    rol: m?.rol ?? null,
  });
  return NextResponse.json({ ok: true });
}
