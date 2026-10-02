"use client";

import { useState, useEffect, useCallback } from "react";
import AgendarReserva from "./AgendarReserva";
import DetalleCita, { type CalendarBooking as Booking } from "./DetalleCita";
import type { Permission } from "@/lib/equipo-auth";

type Vista = "quincena" | "mes";
const DIAS_VISTA = 14; // quincena: semana actual + siguiente (lunes a domingo)

// Fecha local YYYY-MM-DD (toISOString usa UTC y en Chile cambia de día de noche)
function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function lunesDeEstaSemana() {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  const dow = d.getDay(); // 0=Dom
  d.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow));
  return d;
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

type CalendarData = {
  bookings: Booking[];
  totalSlots: number;
  bookedSlots: number;
};

const SERVICE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  osteopatia: { bg: "bg-teal-100", text: "text-teal-800", dot: "bg-teal-500" },
  kinesiologia: { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500" },
  posturologia: { bg: "bg-purple-100", text: "text-purple-800", dot: "bg-purple-500" },
  "estudio-biomecanico": { bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500" },
  "actividad-fisica-dirigida": { bg: "bg-rose-100", text: "text-rose-800", dot: "bg-rose-500" },
};

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DAY_HEADERS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function getDefaultColor() {
  return { bg: "bg-slate-100", text: "text-slate-800", dot: "bg-slate-500" };
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmada",
  completed: "Asistió",
  no_show: "No asistió",
};

export default function CalendarioEquipo({ permissions }: { permissions: Permission[] }) {
  const puedeAgendar = permissions.includes("agendar");
  const [showAgendar, setShowAgendar] = useState(false);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-based
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [vista, setVista] = useState<Vista>("quincena");
  const [inicio, setInicio] = useState(lunesDeEstaSemana);
  const [citaAbierta, setCitaAbierta] = useState<Booking | null>(null);

  const monthStr = `${year}-${month.toString().padStart(2, "0")}`;
  const diasQuincena = Array.from({ length: DIAS_VISTA }, (_, i) => addDays(inicio, i));
  const rangoQuery =
    vista === "quincena"
      ? `from=${ymd(inicio)}&to=${ymd(addDays(inicio, DIAS_VISTA - 1))}`
      : `month=${monthStr}`;

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch(`/api/calendar?${rangoQuery}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.error) return;
        setData(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [rangoQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
    setSelectedDay(null);
  }

  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
    setSelectedDay(null);
  }

  // Generar grilla del mes
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0=Dom
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Lun=0

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  // Agrupar bookings por fecha
  const bookingsByDate: Record<string, Booking[]> = {};
  if (data) {
    for (const b of data.bookings) {
      if (!bookingsByDate[b.booking_date]) bookingsByDate[b.booking_date] = [];
      bookingsByDate[b.booking_date].push(b);
    }
  }

  const todayStr = ymd(now);
  const occupancy = data && data.totalSlots > 0
    ? Math.round((data.bookedSlots / data.totalSlots) * 100)
    : 0;

  // Bookings del día seleccionado
  // selectedDay guarda la fecha completa YYYY-MM-DD
  const selectedDateStr = selectedDay;
  const selectedBookings = selectedDateStr ? (bookingsByDate[selectedDateStr] ?? []) : [];

  // Conteo por servicio
  const serviceCounts: Record<string, number> = {};
  if (data) {
    for (const b of data.bookings) {
      const slug = b.services?.slug || "otro";
      serviceCounts[slug] = (serviceCounts[slug] || 0) + 1;
    }
  }

  function renderDia(d: Date, enGrilla: boolean) {
    const dateStr = ymd(d);
    const dayBookings = bookingsByDate[dateStr] ?? [];
    const isToday = dateStr === todayStr;
    const isPast = dateStr < todayStr;
    const isSelected = selectedDay === dateStr;
    if (!enGrilla && dayBookings.length === 0 && !isToday) {
      return (
        <p key={dateStr} className="px-1 text-[11px] text-slate-400 first-letter:uppercase">
          {d.toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" })} · sin citas
        </p>
      );
    }
    return (
      <div
        key={dateStr}
        className={`rounded-lg border p-1.5 ${enGrilla ? "min-h-[84px]" : ""} ${
          isSelected
            ? "border-teal-600 ring-1 ring-teal-600/40 bg-white"
            : isToday
              ? "border-teal-400 bg-teal-50/40"
              : isPast
                ? "border-slate-100 bg-slate-50"
                : "border-slate-200 bg-white"
        }`}
      >
        <button
          onClick={() => setSelectedDay(dateStr)}
          className="flex w-full items-baseline justify-between gap-1 px-0.5 mb-1 text-left"
          title="Seleccionar día para agendar"
        >
          <span className={`text-[11px] font-bold capitalize ${isToday ? "text-teal-700" : isPast ? "text-slate-400" : "text-slate-700"}`}>
            {enGrilla
              ? d.toLocaleDateString("es-CL", { day: "numeric", month: "short" })
              : d.toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" })}
            {isToday && " · hoy"}
          </span>
          {dayBookings.length > 0 && <span className="text-[10px] text-slate-400">{dayBookings.length}</span>}
        </button>
        <div className="space-y-0.5">
          {dayBookings.map((b) => {
            const colors = SERVICE_COLORS[b.services?.slug] || getDefaultColor();
            const abierta = citaAbierta?.id === b.id;
            return (
              <button
                key={b.id}
                onClick={() => setCitaAbierta(b)}
                title={`${b.start_time.slice(0, 5)} ${b.client_name} · ${b.services?.name} · ${b.professionals?.name}`}
                className={`flex w-full items-center gap-1 rounded ${colors.bg} px-1 py-0.5 text-left text-[11px] leading-tight transition hover:ring-1 hover:ring-teal-600 ${
                  abierta ? "ring-2 ring-teal-700" : ""
                } ${b.status === "no_show" ? "opacity-50 line-through" : ""}`}
              >
                <span className={`font-semibold tabular-nums ${colors.text}`}>{b.start_time.slice(0, 5)}</span>
                <span className="truncate text-slate-900">{b.client_name}</span>
                {b.status === "completed" && <span className="ml-auto text-emerald-700">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header con stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 sm:px-4">
          <p className="text-xs sm:text-sm text-slate-500">
            {vista === "quincena" ? "Reservas quincena" : "Reservas del mes"}
          </p>
          <p className="text-lg sm:text-2xl font-bold text-slate-900">
            {loading ? "–" : data?.bookedSlots ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 sm:px-4">
          <p className="text-xs sm:text-sm text-slate-500">Capacidad total</p>
          <p className="text-lg sm:text-2xl font-bold text-slate-900">
            {loading ? "–" : data?.totalSlots ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 sm:px-4">
          <p className="text-xs sm:text-sm text-slate-500">Ocupación</p>
          <p className={`text-lg sm:text-2xl font-bold ${occupancy >= 80 ? "text-emerald-600" : occupancy >= 50 ? "text-amber-600" : "text-slate-900"}`}>
            {loading ? "–" : `${occupancy}%`}
          </p>
        </div>
      </div>

      {/* Leyenda + agendar en una fila */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {Object.entries(SERVICE_COLORS).map(([slug, colors]) => (
            <div key={slug} className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
              {slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              {serviceCounts[slug] ? (
                <span className="text-slate-400">({serviceCounts[slug]})</span>
              ) : null}
            </div>
          ))}
        </div>
        {puedeAgendar && !showAgendar && (
          <button onClick={() => setShowAgendar(true)}
            className="rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
            + Agendar sesión o programa
          </button>
        )}
      </div>
      {showAgendar && (
        <AgendarReserva
          defaultDate={selectedDateStr ?? todayStr}
          onCancel={() => setShowAgendar(false)}
          onDone={() => { setShowAgendar(false); fetchData(); }}
        />
      )}

      {/* Navegación + selector de vista en una fila */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => (vista === "quincena" ? setInicio(addDays(inicio, -DIAS_VISTA)) : prevMonth())}
            aria-label="Anterior"
            className="h-8 w-8 rounded-lg border border-slate-200 text-sm text-slate-600 hover:border-teal-700 hover:text-teal-700"
          >
            ←
          </button>
          <button
            onClick={() => (vista === "quincena" ? setInicio(addDays(inicio, DIAS_VISTA)) : nextMonth())}
            aria-label="Siguiente"
            className="h-8 w-8 rounded-lg border border-slate-200 text-sm text-slate-600 hover:border-teal-700 hover:text-teal-700"
          >
            →
          </button>
          <h2 className="ml-1 text-base font-bold text-slate-900">
            {vista === "quincena"
              ? `${diasQuincena[0].toLocaleDateString("es-CL", { day: "numeric", month: "short" })} – ${diasQuincena[DIAS_VISTA - 1].toLocaleDateString("es-CL", { day: "numeric", month: "short" })}`
              : `${MONTH_NAMES[month - 1]} ${year}`}
          </h2>
          {vista === "quincena" && ymd(inicio) !== ymd(lunesDeEstaSemana()) && (
            <button
              onClick={() => setInicio(lunesDeEstaSemana())}
              className="ml-1 text-xs font-semibold text-teal-700 hover:underline"
            >
              Hoy
            </button>
          )}
        </div>
        <div className="inline-flex rounded-full border border-slate-200 bg-white p-0.5 text-xs font-semibold">
          {([
            ["quincena", "Quincena"],
            ["mes", "Mes"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setVista(key); setSelectedDay(null); }}
              className={`rounded-full px-3 py-1 transition ${
                vista === key ? "bg-teal-700 text-white" : "text-slate-600 hover:text-teal-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500">Cargando calendario...</div>
      ) : vista === "quincena" ? (
        <>
          {/* Escritorio: 2 semanas × 7 días, una línea por cita */}
          <div className="hidden md:block">
            <div className="grid grid-cols-7 gap-1.5 mb-1">
              {DAY_HEADERS.map((d) => (
                <div key={d} className="text-center text-[11px] font-semibold uppercase text-slate-500">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {diasQuincena.map((d) => renderDia(d, true))}
            </div>
          </div>
          {/* Móvil: lista por día */}
          <div className="md:hidden space-y-1.5">
            {diasQuincena.map((d) => renderDia(d, false))}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Grilla del mes */}
          <div>
            {/* Encabezados */}
            <div className="grid grid-cols-7 mb-1">
              {DAY_HEADERS.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-slate-500 py-2">
                  {d}
                </div>
              ))}
            </div>

            {/* Celdas */}
            <div className="grid grid-cols-7 border-l border-t border-slate-200">
              {calendarCells.map((day, i) => {
                if (day === null) {
                  return <div key={`empty-${i}`} className="border-r border-b border-slate-200 bg-slate-50 min-h-[100px]" />;
                }
                const dateStr = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
                const dayBookings = bookingsByDate[dateStr] ?? [];
                const isToday = dateStr === todayStr;
                const isSelected = selectedDay === dateStr;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(dateStr)}
                    className={`border-r border-b border-slate-200 min-h-[100px] p-1.5 text-left transition hover:bg-teal-50
                      ${isToday ? "bg-teal-50/50" : "bg-white"}
                      ${isSelected ? "ring-2 ring-inset ring-teal-600" : ""}
                    `}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold
                        ${isToday ? "bg-teal-700 text-white" : "text-slate-700"}
                      `}
                    >
                      {day}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dayBookings.slice(0, 4).map((b) => {
                        const colors = SERVICE_COLORS[b.services?.slug] || getDefaultColor();
                        return (
                          <div
                            key={b.id}
                            className={`${colors.bg} ${colors.text} rounded px-1 py-0.5 text-[10px] leading-tight truncate`}
                          >
                            {b.start_time.slice(0, 5)} {b.client_name.split(" ")[0]}
                          </div>
                        );
                      })}
                      {dayBookings.length > 4 && (
                        <p className="text-[10px] text-slate-400 pl-1">
                          +{dayBookings.length - 4} más
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panel lateral: detalle del día */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            {selectedDateStr ? (
              <>
                <h3 className="font-semibold text-slate-900 mb-1">
                  {new Date(selectedDateStr + "T12:00:00").toLocaleDateString("es-CL", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  {selectedBookings.length} reserva{selectedBookings.length !== 1 ? "s" : ""}
                </p>
                {selectedBookings.length === 0 ? (
                  <p className="text-sm text-slate-400">Sin reservas este día.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedBookings.map((b) => {
                      const colors = SERVICE_COLORS[b.services?.slug] || getDefaultColor();
                      return (
                        <button
                          key={b.id}
                          onClick={() => setCitaAbierta(b)}
                          className={`block w-full text-left rounded-lg border border-slate-100 p-3 transition hover:ring-2 hover:ring-teal-600/40 ${colors.bg}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                            <span className={`text-xs font-semibold ${colors.text}`}>
                              {b.services?.name}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-900">
                            {b.start_time.slice(0, 5)} – {b.end_time.slice(0, 5)}
                          </p>
                          <p className="text-sm text-slate-700">{b.client_name}</p>
                          <p className="text-xs text-slate-500">{b.professionals?.name}</p>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {STATUS_LABELS[b.status] ?? b.status}
                            {b.payment_status === "paid" && " · Pagada"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-slate-400 text-center py-8">
                Selecciona un día para ver el detalle.
              </div>
            )}
          </div>
        </div>
      )}

      {citaAbierta && (
        <DetalleCita
          key={citaAbierta.id}
          booking={citaAbierta}
          permissions={permissions}
          onClose={() => setCitaAbierta(null)}
          onChanged={fetchData}
        />
      )}
    </div>
  );
}
