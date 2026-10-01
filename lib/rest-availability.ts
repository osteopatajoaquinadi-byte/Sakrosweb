import type { SupabaseClient } from "@supabase/supabase-js";
import { REST_PROGRAM } from "@/lib/metodo-rest";
import { wixAvailableSlots, wixConfigured, type WixSlot } from "@/lib/wix-bookings";

// Horas libres de Joaquín para la sesión online del Método REST, calculadas
// en hora de Chile. Una hora está libre si cae dentro de sus horarios de
// atención (cualquier servicio), no tiene bloqueo ni otra reserva que se
// cruce y, si Wix está conectado, también está disponible en Wix.

export type RestSlot = { date: string; time: string; wixSlot?: WixSlot };

const DAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto",
  "septiembre", "octubre", "noviembre", "diciembre"];

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const toTime = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

function addDays(date: string, n: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Fecha y minutos del día actuales en Chile.
export function chileNow(now = new Date()): { date: string; minutes: number } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: REST_PROGRAM.timeZone,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(now).map((p) => [p.type, p.value])
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

// Clave "YYYY-MM-DD HH:MM" en hora de Chile de un instante ISO de Wix.
function chileKey(iso: string): string {
  const hasZone = /Z|[+-]\d{2}:?\d{2}$/.test(iso);
  if (!hasZone) return `${iso.slice(0, 10)} ${iso.slice(11, 16)}`;
  const { date, minutes } = chileNow(new Date(iso));
  return `${date} ${toTime(minutes)}`;
}

export function formatSlot(slot: { date: string; time: string }): string {
  const d = new Date(`${slot.date}T12:00:00Z`);
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()]} a las ${slot.time}`;
}

export async function findRestSlots(db: SupabaseClient, now = new Date()): Promise<RestSlot[]> {
  const { data: pro } = await db
    .from("professionals")
    .select("id")
    .eq("slug", REST_PROGRAM.professionalSlug)
    .single();
  if (!pro) return [];

  const { date: today, minutes: nowMin } = chileNow(now);
  const lastDay = addDays(today, REST_PROGRAM.searchDays);

  const [{ data: windows }, { data: blocks }, { data: bookings }] = await Promise.all([
    db.from("schedule_windows").select("day_of_week, start_time, end_time").eq("professional_id", pro.id),
    db.from("schedule_blocks").select("block_date, start_time, end_time")
      .eq("professional_id", pro.id).gte("block_date", today).lte("block_date", lastDay),
    db.from("bookings").select("booking_date, start_time, end_time")
      .eq("professional_id", pro.id).neq("status", "cancelled")
      .gte("booking_date", today).lte("booking_date", lastDay),
  ]);

  const duration = 60;
  const minStart = nowMin + REST_PROGRAM.minLeadHours * 60;
  const slots: RestSlot[] = [];
  const seen = new Set<string>();

  for (let i = 0; i <= REST_PROGRAM.searchDays; i++) {
    const date = addDays(today, i);
    const jsDay = new Date(`${date}T12:00:00Z`).getUTCDay();
    const isoDay = jsDay === 0 ? 7 : jsDay;

    const dayBlocks = (blocks ?? []).filter((b) => b.block_date === date);
    if (dayBlocks.some((b) => b.start_time === null)) continue;
    const dayBookings = (bookings ?? []).filter((b) => b.booking_date === date);

    const dayWindows = (windows ?? [])
      .filter((w) => w.day_of_week === isoDay)
      .sort((a, b) => toMin(a.start_time) - toMin(b.start_time));

    for (const w of dayWindows) {
      for (let m = toMin(w.start_time); m + duration <= toMin(w.end_time); m += duration) {
        if (i === 0 && m < minStart) continue;
        if (i === 1 && minStart > 24 * 60 && m < minStart - 24 * 60) continue;
        const overlaps = (s: string, e: string | null) =>
          toMin(s) < m + duration && (e ? toMin(e) : 24 * 60) > m;
        if (dayBookings.some((b) => overlaps(b.start_time, b.end_time))) continue;
        if (dayBlocks.some((b) => b.start_time && overlaps(b.start_time, b.end_time))) continue;
        const key = `${date} ${toTime(m)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        slots.push({ date, time: toTime(m) });
      }
    }
  }

  if (!wixConfigured() || slots.length === 0) return slots;

  // Con Wix conectado, solo se ofrecen horas libres en ambos calendarios.
  const from = new Date(now.getTime()).toISOString();
  const to = new Date(now.getTime() + (REST_PROGRAM.searchDays + 1) * 86400000).toISOString();
  const wixSlots = await wixAvailableSlots(from, to, REST_PROGRAM.timeZone);
  const wixByKey = new Map(wixSlots.map((s) => [chileKey(s.startDate), s]));
  return slots
    .filter((s) => wixByKey.has(`${s.date} ${s.time}`))
    .map((s) => ({ ...s, wixSlot: wixByKey.get(`${s.date} ${s.time}`) }));
}
