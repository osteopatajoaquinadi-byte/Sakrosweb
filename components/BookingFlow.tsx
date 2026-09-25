"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";

type Service = {
  id: string;
  name: string;
  slug: string;
  duration_minutes: number;
  price_clp: number;
};

type Slot = {
  time: string;
  professional_id: string;
  professional_name: string;
};

type Step = "service" | "date" | "time" | "details" | "done";

const SERVICES_LIST = [
  { slug: "osteopatia", label: "Osteopatía", price: "$40.000" },
  { slug: "kinesiologia", label: "Kinesiología", price: "$25.000" },
  { slug: "posturologia", label: "Posturología Clínica", price: "$30.000" },
  { slug: "estudio-biomecanico", label: "Estudio Biomecánico", price: "$40.000" },
  { slug: "actividad-fisica-dirigida", label: "Actividad Física Dirigida", price: "$12.000" },
];

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function getWeekDays(weekOffset: number): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monday = new Date(today);
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(today.getDate() + diff + weekOffset * 7);
  
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

export default function BookingFlow() {
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get("servicio") || "";

  const [step, setStep] = useState<Step>(preselectedService ? "date" : "service");
  const [selectedService, setSelectedService] = useState<string>(preselectedService);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [service, setService] = useState<Service | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekAvailability, setWeekAvailability] = useState<Record<string, number>>({});
  const [loadingWeek, setLoadingWeek] = useState(false);

  // Form fields
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("in_clinic");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset]);
  const weekLabel = useMemo(() => {
    const first = weekDays[0];
    const last = weekDays[6];
    if (first.getMonth() === last.getMonth()) {
      return `${first.getDate()} – ${last.getDate()} de ${MONTH_NAMES[first.getMonth()]}`;
    }
    return `${first.getDate()} ${MONTH_NAMES[first.getMonth()].slice(0, 3)} – ${last.getDate()} ${MONTH_NAMES[last.getMonth()].slice(0, 3)}`;
  }, [weekDays]);

  const serviceName = SERVICES_LIST.find(s => s.slug === selectedService)?.label || "";

  // Pre-cargar disponibilidad de la semana
  useEffect(() => {
    if (!selectedService || step !== "date") return;
    setLoadingWeek(true);
    const mondayStr = toDateStr(weekDays[0]);
    fetch(`/api/week-availability?service=${selectedService}&weekStart=${mondayStr}`)
      .then(res => res.json())
      .then(data => {
        if (data.available) setWeekAvailability(data.available);
      })
      .catch(() => {})
      .finally(() => setLoadingWeek(false));
  }, [selectedService, weekOffset, step]);

  useEffect(() => {
    if (!selectedService || !selectedDate) return;
    setLoading(true);
    setError("");
    setSlots([]);
    setSelectedSlot(null);

    fetch(`/api/availability?service=${selectedService}&date=${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setService(data.service);
          setSlots(data.slots ?? []);
        }
      })
      .catch(() => setError("Error al cargar disponibilidad."))
      .finally(() => setLoading(false));
  }, [selectedService, selectedDate]);

  async function handleSubmit() {
    if (!selectedSlot || !service) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: service.id,
          professional_id: selectedSlot.professional_id,
          booking_date: selectedDate,
          start_time: selectedSlot.time,
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientPhone || undefined,
          payment_method: paymentMethod,
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al crear la reserva.");
      } else {
        setStep("done");
      }
    } catch {
      setError("Error de conexión. Intenta por WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("es-CL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // =================== RENDER ===================

  if (step === "done") {
    return (
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 text-center">
        <p className="text-2xl font-bold text-emerald-800 mb-2">Reserva confirmada</p>
        <p className="text-emerald-700 mb-4">
          Te enviamos los detalles a <strong>{clientEmail}</strong>.
        </p>
        {paymentMethod === "online_transfer" && (
          <p className="text-sm text-emerald-600 mb-4">
            Envía tu comprobante de transferencia al WhatsApp{" "}
            <a href="https://wa.me/56945399692" className="underline">
              +56 9 4539 9692
            </a>{" "}
            para confirmar tu pago.
          </p>
        )}
        <button
          onClick={() => {
            setStep("service");
            setSelectedService("");
            setSelectedDate("");
            setSelectedSlot(null);
            setClientName("");
            setClientEmail("");
            setClientPhone("");
            setNotes("");
            setError("");
          }}
          className="rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Reservar otra hora
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="flex gap-2 text-xs font-medium text-slate-400">
        {(["service", "date", "time", "details"] as Step[]).map((s, i) => (
          <span
            key={s}
            className={
              step === s
                ? "text-teal-700"
                : ["service", "date", "time", "details"].indexOf(step) > i
                  ? "text-slate-600"
                  : ""
            }
          >
            {i + 1}. {s === "service" ? "Servicio" : s === "date" ? "Fecha" : s === "time" ? "Hora" : "Datos"}
            {i < 3 && <span className="ml-2">→</span>}
          </span>
        ))}
      </div>

      {/* Step 1: Service */}
      {step === "service" && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            ¿Qué servicio necesitas?
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {SERVICES_LIST.map((s) => (
              <button
                key={s.slug}
                onClick={() => {
                  setSelectedService(s.slug);
                  setStep("date");
                }}
                className="text-left rounded-xl border border-slate-200 p-4 hover:border-teal-700 hover:shadow-sm transition"
              >
                <p className="font-semibold text-slate-900">{s.label}</p>
                <p className="text-sm text-teal-700">{s.price}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Date — calendario semanal */}
      {step === "date" && (
        <div>
          <button
            onClick={() => {
              setSelectedService("");
              setStep("service");
            }}
            className="text-sm text-slate-500 hover:text-teal-700 mb-4"
          >
            ← Cambiar servicio
          </button>
          {serviceName && (
            <p className="text-sm text-teal-700 font-semibold mb-2">{serviceName}</p>
          )}
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Elige una fecha
          </h2>

          {/* Navegación de semanas */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
              disabled={weekOffset === 0}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:border-teal-700 hover:text-teal-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Anterior
            </button>
            <span className="text-sm font-medium text-slate-700">{weekLabel}</span>
            <button
              onClick={() => setWeekOffset(Math.min(4, weekOffset + 1))}
              disabled={weekOffset >= 4}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:border-teal-700 hover:text-teal-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Siguiente →
            </button>
          </div>

          {/* Grilla de 7 días */}
          {loadingWeek ? (
            <div className="text-center py-8 text-slate-500 text-sm">Verificando disponibilidad...</div>
          ) : (
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const dateStr = toDateStr(day);
              const isPast = day <= today;
              const slotsAvailable = weekAvailability[dateStr] ?? 0;
              const noSlots = slotsAvailable === 0;
              const disabled = isPast || noSlots;
              const isSelected = selectedDate === dateStr;

              return (
                <button
                  key={dateStr}
                  disabled={disabled}
                  onClick={() => {
                    setSelectedDate(dateStr);
                    setStep("time");
                  }}
                  className={`flex flex-col items-center py-3 px-1 rounded-xl border text-center transition
                    ${disabled
                      ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                      : isSelected
                        ? "border-teal-700 bg-teal-50 text-teal-800"
                        : "border-slate-200 hover:border-teal-700 hover:bg-teal-50 text-slate-700 cursor-pointer"
                    }`}
                >
                  <span className="text-[11px] font-medium uppercase">{DAY_NAMES[day.getDay()]}</span>
                  <span className="text-lg font-bold">{day.getDate()}</span>
                  {!isPast && !noSlots && (
                    <span className="text-[10px] text-teal-600 font-medium">{slotsAvailable} hrs</span>
                  )}
                </button>
              );
            })}
          </div>
          )}
        </div>
      )}

      {/* Step 3: Time */}
      {step === "time" && (
        <div>
          <button
            onClick={() => setStep("date")}
            className="text-sm text-slate-500 hover:text-teal-700 mb-4"
          >
            ← Cambiar fecha
          </button>
          {serviceName && (
            <p className="text-sm text-teal-700 font-semibold mb-1">{serviceName}</p>
          )}
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Horas disponibles
          </h2>
          <p className="text-sm text-slate-500 mb-4">{formatDate(selectedDate)}</p>

          {loading && <p className="text-slate-500">Cargando disponibilidad...</p>}

          {!loading && slots.length === 0 && !error && (
            <div>
              <p className="text-slate-500 mb-3">
                No hay horas disponibles para esa fecha. Prueba otro día.
              </p>
              <button
                onClick={() => setStep("date")}
                className="text-sm text-teal-700 font-medium hover:underline"
              >
                ← Elegir otra fecha
              </button>
            </div>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="grid gap-2 sm:grid-cols-3">
            {slots.map((slot) => (
              <button
                key={`${slot.time}-${slot.professional_id}`}
                onClick={() => {
                  setSelectedSlot(slot);
                  setStep("details");
                }}
                className="text-left rounded-xl border border-slate-200 p-4 hover:border-teal-700 hover:shadow-sm transition"
              >
                <p className="font-semibold text-slate-900">{slot.time.slice(0, 5)}</p>
                <p className="text-xs text-slate-500">{slot.professional_name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Details */}
      {step === "details" && (
        <div>
          <button
            onClick={() => setStep("time")}
            className="text-sm text-slate-500 hover:text-teal-700 mb-4"
          >
            ← Cambiar hora
          </button>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Tus datos
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {serviceName && <span className="text-teal-700 font-semibold">{serviceName}</span>}
            {" · "}
            {formatDate(selectedDate)} · {selectedSlot?.time.slice(0, 5)} ·{" "}
            {selectedSlot?.professional_name}
          </p>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre completo *
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-teal-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-teal-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-teal-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Modalidad de pago
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("in_clinic")}
                  className={`rounded-lg border p-3 text-left text-sm transition ${
                    paymentMethod === "in_clinic"
                      ? "border-teal-700 bg-teal-50 text-teal-800"
                      : "border-slate-200 hover:border-teal-700"
                  }`}
                >
                  <p className="font-semibold">Pago en clínica</p>
                  <p className="text-xs text-slate-500">Presencial el día de tu hora</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("online_transfer")}
                  className={`rounded-lg border p-3 text-left text-sm transition ${
                    paymentMethod === "online_transfer"
                      ? "border-teal-700 bg-teal-50 text-teal-800"
                      : "border-slate-200 hover:border-teal-700"
                  }`}
                >
                  <p className="font-semibold">Transferencia</p>
                  <p className="text-xs text-slate-500">
                    Envía comprobante por WhatsApp
                  </p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notas (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-teal-700 focus:outline-none"
                placeholder="¿Algo que debamos saber antes de tu hora?"
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={!clientName || !clientEmail || submitting}
              className="w-full rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Reservando..." : "Confirmar reserva"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
