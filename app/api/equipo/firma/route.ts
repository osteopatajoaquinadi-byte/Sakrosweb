import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/equipo-auth";
import { FIRMA_ANIKKEN_PNG } from "@/lib/firmas/anikken";
import { FIRMA_JOAQUIN_PNG } from "@/lib/firmas/joaquin";

const norm = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

// Firma digital del profesional con la sesión abierta, para estampar en sus
// certificados. Solo se entrega a su propio dueño (hoy: Joaquín y Anikken).
// "cargo" va cuando la imagen es solo el trazo y el PDF debe escribir
// debajo el nombre y la profesión.
export async function GET(request: NextRequest) {
  const { user, denied } = requireStaff(request, "clinico");
  if (denied) return denied;
  if (norm(user.display_name).startsWith("joaquin")) {
    return NextResponse.json(
      { nombre: "Joaquín Adi A.", firma: FIRMA_JOAQUIN_PNG },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  }
  if (norm(user.display_name).startsWith("anikken")) {
    return NextResponse.json(
      { nombre: "Anikken Arentsen", firma: FIRMA_ANIKKEN_PNG, cargo: "Kinesióloga - Posturóloga", rut: "17.751.987-1" },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  }
  return NextResponse.json({ nombre: null, firma: null });
}
