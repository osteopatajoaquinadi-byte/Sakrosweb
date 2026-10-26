import { NextRequest, NextResponse } from "next/server";
import { getServiceClient as getSupabase } from "@/lib/supabase";
import { requireStaff } from "@/lib/equipo-auth";

// Reservas de la agenda de un paciente: las que vienen y el historial.

function ahoraChile() {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const v = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return { fecha: `${v("year")}-${v("month")}-${v("day")}`, hora: `${v("hour")}:${v("minute")}` };
}

type Row = {
  id: string;
  booking_date: string;
  start_time: string | null;
  status: string;
  payment_status: string | null;
  services: { name: string } | { name: string }[] | null;
  professionals: { name: string } | { name: string }[] | null;
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { denied } = requireStaff(request, "pacientes");
  if (denied) return denied;
  const { id } = await params;

  const { data, error } = await getSupabase()
    .from("bookings")
    .select("id, booking_date, start_time, status, payment_status, services(name), professionals(name)")
    .eq("fichas_patient_id", id)
    .order("booking_date", { ascending: true })
    .order("start_time", { ascending: true });
  if (error) return NextResponse.json({ error: "No se pudieron cargar las reservas." }, { status: 500 });

  const nombre = (v: Row["services"]) => (Array.isArray(v) ? v[0]?.name : v?.name) ?? "";
  const { fecha, hora } = ahoraChile();
  const reservas = ((data ?? []) as Row[]).map((b) => {
    const time = b.start_time?.slice(0, 5) ?? "";
    const futura = b.booking_date > fecha || (b.booking_date === fecha && time >= hora);
    return {
      id: b.id,
      date: b.booking_date,
      time,
      service: nombre(b.services),
      professional: nombre(b.professionals),
      status: b.status,
      paid: b.payment_status === "paid",
      futura,
    };
  });

  return NextResponse.json({
    proximas: reservas.filter((r) => r.futura && r.status !== "cancelled"),
    historial: reservas.filter((r) => !r.futura || r.status === "cancelled").reverse(),
  });
}
