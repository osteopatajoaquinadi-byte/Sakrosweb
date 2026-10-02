import { NextRequest, NextResponse } from "next/server";
import { getServiceClient as getSupabase } from "@/lib/supabase";
import { requireStaff } from "@/lib/equipo-auth";

export async function GET(request: NextRequest) {
  const { denied } = requireStaff(request, "calendario");
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month"); // YYYY-MM
  const fromParam = searchParams.get("from"); // YYYY-MM-DD
  const toParam = searchParams.get("to"); // YYYY-MM-DD
  const ISO = /^\d{4}-\d{2}-\d{2}$/;

  // Rango: un mes completo (?month=) o un rango libre (?from=&to=)
  let firstDay: string;
  let lastDay: string;
  if (fromParam && toParam && ISO.test(fromParam) && ISO.test(toParam)) {
    firstDay = fromParam;
    lastDay = toParam;
  } else if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [year, m] = month.split("-").map(Number);
    firstDay = `${month}-01`;
    lastDay = `${month}-${String(new Date(year, m, 0).getDate()).padStart(2, "0")}`;
  } else {
    return NextResponse.json({ error: "Indica 'month' o 'from' y 'to'." }, { status: 400 });
  }

  // Traer reservas del mes con servicio y profesional
  const { data: bookings, error: err } = await getSupabase()
    .from("bookings")
    .select(`
      id,
      booking_date,
      start_time,
      end_time,
      client_name,
      client_phone,
      client_email,
      fichas_patient_id,
      payment_status,
      notes,
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

  // Calcular slots totales del rango (capacidad)
  let totalSlots = 0;
  if (windows) {
    const end = new Date(`${lastDay}T12:00:00Z`);
    for (let d = new Date(`${firstDay}T12:00:00Z`); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      const jsDay = d.getUTCDay();
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
