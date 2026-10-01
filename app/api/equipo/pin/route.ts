import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { readSession } from "@/lib/equipo-auth";

// Cambio de PIN del propio usuario.
export async function POST(request: NextRequest) {
  const user = readSession(request);
  if (!user) {
    return NextResponse.json({ error: "Sesión expirada. Vuelve a ingresar." }, { status: 401 });
  }

  const { current_pin, new_pin } = await request.json().catch(() => ({}));
  const next = String(new_pin ?? "");
  if (next.length < 8 || next.length > 64) {
    return NextResponse.json({ error: "El PIN nuevo debe tener al menos 8 caracteres." }, { status: 400 });
  }

  const { data, error } = await getServiceClient().rpc("staff_change_pin", {
    p_username: user.username,
    p_current: String(current_pin ?? ""),
    p_new: String(new_pin),
  });

  if (error) {
    return NextResponse.json({ error: "Error al cambiar el PIN." }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "El PIN actual no es correcto." }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
