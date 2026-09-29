import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month"); // YYYY-MM
  const pin = searchParams.get("pin");

  if (!month || !pin) {
    return NextResponse.json({ error: "Parámetros requeridos." }, { status: 400 });
  }

  // Verificar PIN de acceso profesional
  const validPin = process.env.EQUIPO_PIN || "Sakros2026";
  if (pin !== validPin) {
    return NextResponse.json({ error: "PIN inválido." }, { status: 401 });
  }

  // Calcular rango del mes
  const [year, m] = month.split("-").map(Number);
  const firstDay = `${month}-01`;
  const lastDay = new Date(year, m, 0).toISOString().split("T")[0];

  // Traer reservas del mes con servicio y profesional
  const { data: bookings, error: err } = await getSupabase()
    .from("bookings")
    .select(`
      id,
      booking_date,
      start_time,
      end_time,
      client_name,
      status,
      service_id,
      professional_id,
      services ( name, slug ),
      professionals ( name, slug )
    `)
    .gte("booking_date", firstDay)
    .lte("booking_date", lastDay)
    .neq("status", "cancelled")
    .order("booking_date")
    .order("start_time");

  if (err) {
    return NextResponse.json({ error: "Error al cargar calendario." }, { status: 500 });
  }

  // Traer schedule_windows para calcular capacidad total del mes
  const { data: windows } = await getSupabase()
    .from("schedule_windows")
    .select(`
      day_of_week,
      start_time,
      end_time,
      last_booking_time,
      service_id,
      services ( duration_minutes, slot_interval_minutes )
    `);

  // Calcular slots totales del mes (capacidad)
  let totalSlots = 0;
  if (windows) {
    for (let day = 1; day <= new Date(year, m, 0).getDate(); day++) {
      const date = new Date(year, m - 1, day);
      const jsDay = date.getDay();
      const isoDay = jsDay === 0 ? 7 : jsDay;

      for (const w of windows) {
        if (w.day_of_week !== isoDay) continue;
        const svc = w.services as unknown as {
          duration_minutes: number;
          slot_interval_minutes: number | null;
        };
        const interval = svc.slot_interval_minutes ?? svc.duration_minutes;
        const startM = timeToMin(w.start_time);
        const endM = timeToMin(w.end_time);
        const lastM = w.last_booking_time
          ? timeToMin(w.last_booking_time)
          : endM - interval;

        for (let t = startM; t <= lastM && t + interval <= endM; t += interval) {
          totalSlots++;
        }
      }
    }
  }

  return NextResponse.json({
    bookings: bookings ?? [],
    totalSlots,
    bookedSlots: (bookings ?? []).length,
  });
}

function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
