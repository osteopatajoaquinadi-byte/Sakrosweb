import { NextRequest, NextResponse } from "next/server";
import { permissionsFor, readSession } from "@/lib/equipo-auth";

export async function GET(request: NextRequest) {
  const user = readSession(request);
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user, permissions: permissionsFor(user.role) });
}
