import { NextRequest, NextResponse } from "next/server";
import { getServiceClient as getSupabase } from "@/lib/supabase";
import { requireStaff } from "@/lib/equipo-auth";

function hoyChile() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(new Date());
}

// Citas del calendario de un paciente desde una fecha de pago.
// Se usa para calcular cuántas sesiones de un pack ya se ocuparon
// (pacientes que pagaron antes de usar este sistema).
export async function GET(request: NextRequest) {
  const { denied } = requireStaff(request, "pagos");
  if (denied) return denied;

  const params = new URL(request.url).searchParams;
  const patientId = params.get("patient_id");
  const from = params.get("from");
  const service = params.get("service") || "";
  if (!patientId || !from || !/^\d{4}-\d{2}-\d{2}$/.test(from)) {
    return NextResponse.json({ error: "Faltan paciente o fecha." }, { status: 400 });
  }

  const { data, error } = await getSupabase()
    .from("bookings")
    .select("id, booking_date, start_time, status, services(name), professionals(name)")
    .eq("fichas_patient_id", patientId)
    .gte("booking_date", from)
    .neq("status", "cancelled")
    .order("booking_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "No se pudo leer el calendario." }, { status: 500 });
  }

  const today = hoyChile();
  type Row = {
    id: string;
    booking_date: string;
    start_time: string;
    status: string;
    services: { name: string } | { name: string }[] | null;
    professionals: { name: string } | { name: string }[] | null;
  };
  const nameOf = (v: Row["services"]) => (Array.isArray(v) ? v[0]?.name : v?.name) ?? "";

  const rows = ((data ?? []) as Row[])
    .map((b) => ({
      id: b.id,
      date: b.booking_date,
      time: b.start_time?.slice(0, 5) ?? "",
      status: b.status,
      service: nameOf(b.services),
      professional: nameOf(b.professionals),
    }))
    .filter((b) => !service || b.service === service);

  // Realizadas: hasta hoy y sin inasistencia. Las futuras se informan aparte.
  const done = rows.filter((b) => b.date <= today && b.status !== "no_show");
  const noShow = rows.filter((b) => b.date <= today && b.status === "no_show");
  const upcoming = rows.filter((b) => b.date > today);

  return NextResponse.json({ done, no_show: noShow, upcoming });
}
