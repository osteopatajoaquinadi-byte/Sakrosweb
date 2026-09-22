import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

type Slot = {
  time: string; // HH:MM
  professional_id: string;
  professional_name: string;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const serviceSlug = searchParams.get("service");
  const dateStr = searchParams.get("date"); // YYYY-MM-DD

  if (!serviceSlug || !dateStr) {
    return NextResponse.json(
      { error: "Parámetros 'service' y 'date' son obligatorios." },
      { status: 400 }
    );
  }

  // Validar fecha
  const date = new Date(dateStr + "T12:00:00");
  if (isNaN(date.getTime())) {
    return NextResponse.json({ error: "Fecha inválida." }, { status: 400 });
  }

  // No permitir reservas en el pasado
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) {
    return NextResponse.json({ slots: [] });
  }

  // day_of_week ISO: 1=Lun … 7=Dom
  const jsDay = date.getUTCDay(); // 0=Dom
  const isoDay = jsDay === 0 ? 7 : jsDay;

  // 1. Obtener el servicio
  const { data: service, error: serviceErr } = await getSupabase()
    .from("services")
    .select("id, name, duration_minutes, price_clp")
    .eq("slug", serviceSlug)
    .eq("active", true)
    .single();

  if (serviceErr || !service) {
    return NextResponse.json({ error: "Servicio no encontrado." }, { status: 404 });
  }

  // 2. Obtener ventanas de horario para ese servicio y día de la semana
  const { data: windows } = await getSupabase()
    .from("schedule_windows")
    .select(`
      id,
      professional_id,
      start_time,
      end_time,
      last_booking_time,
      professionals!inner ( id, name, slug )
    `)
    .eq("service_id", service.id)
    .eq("day_of_week", isoDay);

  if (!windows || windows.length === 0) {
    return NextResponse.json({ service, slots: [] });
  }

  // 3. Obtener bloqueos para esa fecha
  const professionalIds = [...new Set(windows.map((w) => w.professional_id))];
  const { data: blocks } = await getSupabase()
    .from("schedule_blocks")
    .select("professional_id, start_time, end_time")
    .eq("block_date", dateStr)
    .in("professional_id", professionalIds);

  // 4. Obtener reservas existentes para esa fecha
  const { data: bookings } = await getSupabase()
    .from("bookings")
    .select("professional_id, start_time")
    .eq("booking_date", dateStr)
    .eq("service_id", service.id)
    .in("status", ["confirmed"]);

  const bookedSet = new Set(
    (bookings ?? []).map((b) => `${b.professional_id}_${b.start_time.slice(0, 5)}`)
  );

  // 5. Generar slots disponibles
  const duration = service.duration_minutes;
  const slots: Slot[] = [];

  for (const window of windows) {
    const prof = window.professionals as unknown as {
      id: string;
      name: string;
      slug: string;
    };

    // Verificar bloqueos de día completo
    const isFullDayBlocked = (blocks ?? []).some(
      (b) =>
        b.professional_id === window.professional_id &&
        b.start_time === null
    );
    if (isFullDayBlocked) continue;

    const startMinutes = timeToMinutes(window.start_time);
    const endMinutes = timeToMinutes(window.end_time);
    const lastBookingMinutes = window.last_booking_time
      ? timeToMinutes(window.last_booking_time)
      : endMinutes - duration;

    for (
      let m = startMinutes;
      m <= lastBookingMinutes && m + duration <= endMinutes;
      m += duration
    ) {
      const timeStr = minutesToTime(m);
      const key = `${window.professional_id}_${timeStr}`;

      if (bookedSet.has(key)) continue;

      // Verificar bloqueo parcial
      const isPartialBlocked = (blocks ?? []).some(
        (b) =>
          b.professional_id === window.professional_id &&
          b.start_time !== null &&
          timeToMinutes(b.start_time) <= m &&
          timeToMinutes(b.end_time!) > m
      );
      if (isPartialBlocked) continue;

      slots.push({
        time: timeStr,
        professional_id: prof.id,
        professional_name: prof.name,
      });
    }
  }

  // Ordenar por hora
  slots.sort((a, b) => a.time.localeCompare(b.time));

  return NextResponse.json({ service, slots });
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}
