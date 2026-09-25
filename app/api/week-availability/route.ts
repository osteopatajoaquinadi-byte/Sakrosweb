import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const serviceSlug = searchParams.get("service");
  const weekStart = searchParams.get("weekStart");

  if (!serviceSlug || !weekStart) {
    return NextResponse.json({ error: "Parámetros requeridos." }, { status: 400 });
  }

  const { data: service } = await getSupabase()
    .from("services")
    .select("id, duration_minutes")
    .eq("slug", serviceSlug)
    .eq("active", true)
    .single();

  if (!service) return NextResponse.json({ error: "Servicio no encontrado." }, { status: 404 });

  const { data: allWindows } = await getSupabase()
    .from("schedule_windows")
    .select("day_of_week, professional_id, start_time, end_time, last_booking_time")
    .eq("service_id", service.id);

  if (!allWindows || allWindows.length === 0) return NextResponse.json({ available: {} });

  const windowsByDay = new Map<number, typeof allWindows>();
  for (const w of allWindows) {
    const existing = windowsByDay.get(w.day_of_week) || [];
    existing.push(w);
    windowsByDay.set(w.day_of_week, existing);
  }

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const monday = new Date(weekStart + "T12:00:00");
  const profIds = [...new Set(allWindows.map(w => w.professional_id))];

  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    weekDates.push(d.toISOString().split("T")[0]);
  }

  const { data: weekBookings } = await getSupabase()
    .from("bookings").select("professional_id, start_time, booking_date")
    .in("booking_date", weekDates).in("professional_id", profIds).neq("status", "cancelled");

  const { data: weekBlocks } = await getSupabase()
    .from("schedule_blocks").select("professional_id, start_time, end_time, block_date")
    .in("block_date", weekDates).in("professional_id", profIds);

  const available: Record<string, number> = {};

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    if (d <= today) { available[dateStr] = 0; continue; }
    const jsDay = d.getUTCDay();
    const isoDay = jsDay === 0 ? 7 : jsDay;
    const dayWindows = windowsByDay.get(isoDay);
    if (!dayWindows || dayWindows.length === 0) { available[dateStr] = 0; continue; }

    const dayBookings = (weekBookings ?? []).filter(b => b.booking_date === dateStr);
    const bookedSet = new Set(dayBookings.map(b => `${b.professional_id}_${b.start_time.slice(0, 5)}`));
    const dayBlocks = (weekBlocks ?? []).filter(b => b.block_date === dateStr);
    let count = 0;

    for (const window of dayWindows) {
      if (dayBlocks.some(b => b.professional_id === window.professional_id && b.start_time === null)) continue;
      const startM = timeToMin(window.start_time), endM = timeToMin(window.end_time);
      const lastM = window.last_booking_time ? timeToMin(window.last_booking_time) : endM - service.duration_minutes;
      for (let m = startM; m <= lastM && m + service.duration_minutes <= endM; m += service.duration_minutes) {
        const key = `${window.professional_id}_${minToTime(m)}`;
        if (bookedSet.has(key)) continue;
        if (dayBlocks.some(b => b.professional_id === window.professional_id && b.start_time !== null && timeToMin(b.start_time) <= m && timeToMin(b.end_time!) > m)) continue;
        count++;
      }
    }
    available[dateStr] = count;
  }
  return NextResponse.json({ available });
}
function timeToMin(t: string): number { const [h,m]=t.split(":").map(Number); return h*60+m; }
function minToTime(m: number): string { return `${Math.floor(m/60).toString().padStart(2,"0")}:${(m%60).toString().padStart(2,"0")}`; }
