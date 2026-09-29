import { NextRequest, NextResponse } from "next/server";

export function verifyPin(request: NextRequest): NextResponse | null {
  const pin =
    request.headers.get("x-equipo-pin") ||
    new URL(request.url).searchParams.get("pin");

  const validPin = process.env.EQUIPO_PIN || "Sakros2026";

  if (!pin || pin !== validPin) {
    return NextResponse.json({ error: "PIN inválido." }, { status: 401 });
  }

  return null; // OK
}
