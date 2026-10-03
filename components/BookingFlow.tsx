"use client";

import { paymentLinks } from "@/lib/site-config";
import { trackEvent } from "@/components/GoogleAnalytics";

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

type Step = "service" | "date" | "time" | "details" | "program" | "program-done" | "done";

const PROGRAMA_REHAB_SLUG = "programa-rehabilitacion-kinesica";

// La reserva real del programa pasa por Tuu (FONASA / ISAPRE). En Sakros
// capturamos los datos del lead primero y después le mostramos el link que
// corresponde, para no perder la pista de quien se interesa.
const SERVICES_LIST = [
  { slug: "osteopatia", label: "Osteopatía", price: "$40.000" },
  { slug: "kinesiologia", label: "Kinesiología", price: "$25.000" },
  { slug: PROGRAMA_REHAB_SLUG, label: "Programa de Rehabilitación Kinésica", price: "10 sesiones" },
  { slug: "posturologia", label: "Posturología Clínica", price: "$30.000" },
  { slug: "estudio-biomecanico", label: "Estudio Biomecánico", price: "$40.000" },
  { slug: "actividad-fisica-dirigida", label: "Actividad Física Dirigida", price: "$12.000" },
];

const PROGRAMA_LINKS = {
  fonasa: "https://www.tuu.cl/programafonasa",
  isapre: "https://www.tuu.cl/programaisapre",
} as const;

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

// Horizonte de búsqueda de fechas disponibles (≈ 5 semanas)
const DIAS_BUSQUEDA = 35;
const FECHAS_INICIALES = 12;

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
  const [weekAvailability, setWeekAvailability] = useState<Record<string, number>>({});
  const [loadingWeek, setLoadingWeek] = useState(false);
  const [verTodasLasFechas, setVerTodasLasFechas] = useState(false);

  // Form fields
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("in_clinic");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Programa de rehabilitación kinésica: capturamos los datos antes de
  // llevarlo al link externo de Tuu, para seguir sabiendo quién pregunta.
  const [programaPrevision, setProgramaPrevision] = useState<"fonasa" | "isapre" | "">("");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Solo los días con horas libres, en orden
  const fechasDisponibles = useMemo(
    () =>
      Object.entries(weekAvailability)
        .filter(([date, n]) => n > 0 && date > toDateStr(today))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, n]) => ({ date, slots: n, day: new Date(date + "T12:00:00") })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weekAvailability]
  );

  const serviceName = SERVICES_LIST.find(s => s.slug === selectedService)?.label || "";

  // Pre-cargar disponibilidad de la semana
  useEffect(() => {
    if (!selectedService || step !== "date") return;
    setLoadingWeek(true);
    setVerTodasLasFechas(false);
    fetch(`/api/week-availability?service=${selectedService}&from=${toDateStr(new Date())}&days=${DIAS_BUSQUEDA}`)
      .then(res => res.json())
      .then(data => setWeekAvailability(data.available ?? {}))
      .catch(() => {})
      .finally(() => setLoadingWeek(false));
  }, [selectedService, step]);

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
        trackEvent("reserva_confirmada", { servicio: selectedService, pago: paymentMethod });
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
        {paymentMethod === "online_webpay" && paymentLinks[selectedService] && (
          <a
            href={paymentLinks[selectedService]}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mb-4 rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Pagar ahora con Mercado Pago
          </a>
        )}
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
                  // El programa no tiene calendario propio: pide los datos
                  // directo y después muestra el link de Tuu.
                  setStep(s.slug === PROGRAMA_REHAB_SLUG ? "program" : "date");
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

      {/* Paso programa: datos antes del link de Tuu */}
      {step === "program" && (
        <div>
          <button
            onClick={() => {
              setSelectedService("");
              setProgramaPrevision("");
              setStep("service");
            }}
            className="text-sm text-slate-500 hover:text-teal-700 mb-4"
          >
            ← Cambiar servicio
          </button>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Programa de Rehabilitación Kinésica
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            10 sesiones con plan individual. La reserva y el pago se hacen en Tuu, con tu previsión.
            Déjanos tus datos y te mostramos el link que corresponde.
          </p>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!programaPrevision) return;
              setSubmitting(true);
              setError("");
              try {
                // Guardamos el lead best-effort; el link se muestra pase lo que pase.
                await fetch("/api/program-interest", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: clientName,
                    email: clientEmail,
                    phone: clientPhone,
                    prevision: programaPrevision,
                    notes,
                  }),
                }).catch(() => {});
                trackEvent("programa_rehab_lead", { prevision: programaPrevision });
                setStep("program-done");
              } finally {
                setSubmitting(false);
              }
            }}
            className="space-y-5"
          >
            <div>
              <label htmlFor="pg-nombre" className="block text-sm font-medium text-slate-700 mb-1">
                Nombre completo *
              </label>
              <input
                id="pg-nombre"
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="pg-email" className="block text-sm font-medium text-slate-700 mb-1">
                Email *
              </label>
              <input
                id="pg-email"
                type="email"
                required
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="pg-telefono" className="block text-sm font-medium text-slate-700 mb-1">
                Teléfono *
              </label>
              <input
                id="pg-telefono"
                type="tel"
                required
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+56 9 1234 5678"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none"
              />
            </div>

            <div>
              <p className="block text-sm font-medium text-slate-700 mb-2">¿Con qué previsión? *</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {([
                  { v: "fonasa", t: "FONASA" },
                  { v: "isapre", t: "ISAPRE" },
                ] as const).map((o) => (
                  <button
                    type="button"
                    key={o.v}
                    onClick={() => setProgramaPrevision(o.v)}
                    className={
                      "rounded-xl border p-4 text-left transition " +
                      (programaPrevision === o.v
                        ? "border-teal-700 bg-teal-50"
                        : "border-slate-200 hover:border-teal-700")
                    }
                  >
                    <p className="font-semibold text-slate-900">{o.t}</p>
                    <p className="text-sm text-slate-500">
                      {o.v === "fonasa" ? "Pago con financiamiento Tuu" : "Convenio con tu Isapre"}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="pg-notas" className="block text-sm font-medium text-slate-700 mb-1">
                Comentarios (opcional)
              </label>
              <textarea
                id="pg-notas"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none"
                placeholder="Molestia, lesión previa u objetivo"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting || !programaPrevision}
              className="w-full rounded-xl bg-teal-700 px-6 py-3 text-white font-semibold hover:bg-teal-800 disabled:opacity-50"
            >
              {submitting ? "Enviando…" : "Continuar al programa"}
            </button>
          </form>
        </div>
      )}

      {/* Paso programa: link al final */}
      {step === "program-done" && (
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
            <svg className="h-8 w-8 text-teal-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Listo, {clientName.split(" ")[0] || "gracias"}
          </h2>
          <p className="text-slate-600 mb-8">
            Guardamos tus datos. Ahora continúa en Tuu para reservar y pagar tu programa
            {programaPrevision === "fonasa" ? " con FONASA" : " con tu ISAPRE"}.
          </p>
          <a
            href={programaPrevision === "fonasa" ? PROGRAMA_LINKS.fonasa : PROGRAMA_LINKS.isapre}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-xl bg-teal-700 px-6 py-3 text-white font-semibold hover:bg-teal-800"
          >
            Ir a {programaPrevision === "fonasa" ? "Programa FONASA" : "Programa ISAPRE"} en Tuu
          </a>
          <p className="text-xs text-slate-500 mt-6">
            Si tienes dudas antes de reservar, escríbenos por WhatsApp y te orientamos.
          </p>
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

          {loadingWeek ? (
            <div className="text-center py-8 text-slate-500 text-sm">Buscando fechas disponibles...</div>
          ) : fechasDisponibles.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="font-semibold text-slate-900 mb-1">No hay horas disponibles en las próximas semanas</p>
              <p className="text-sm text-slate-600">
                Escríbenos por WhatsApp y te buscamos un espacio.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Próxima fecha disponible */}
              {(() => {
                const next = fechasDisponibles[0];
                return (
                  <button
                    onClick={() => {
                      setSelectedDate(next.date);
                      setStep("time");
                    }}
                    className="w-full flex items-center justify-between gap-4 rounded-2xl border-2 border-teal-700 bg-teal-50 p-5 text-left transition hover:bg-teal-100"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                        Próxima fecha disponible
                      </p>
                      <p className="text-lg font-bold text-slate-900 first-letter:uppercase">
                        {formatDate(next.date)}
                      </p>
                      <p className="text-sm text-teal-700">
                        {next.slots} {next.slots === 1 ? "hora libre" : "horas libres"}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white">
                      Ver horas →
                    </span>
                  </button>
                );
              })()}

              {/* Otras fechas, solo con disponibilidad */}
              {fechasDisponibles.length > 1 && (
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Otras fechas disponibles</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {fechasDisponibles
                      .slice(1, verTodasLasFechas ? undefined : FECHAS_INICIALES + 1)
                      .map(({ date, slots, day }) => (
                        <button
                          key={date}
                          onClick={() => {
                            setSelectedDate(date);
                            setStep("time");
                          }}
                          className={`flex flex-col items-center py-3 px-1 rounded-xl border text-center transition ${
                            selectedDate === date
                              ? "border-teal-700 bg-teal-50 text-teal-800"
                              : "border-slate-200 hover:border-teal-700 hover:bg-teal-50 text-slate-700"
                          }`}
                        >
                          <span className="text-[11px] font-medium uppercase">{DAY_NAMES[day.getDay()]}</span>
                          <span className="text-lg font-bold leading-tight">{day.getDate()}</span>
                          <span className="text-[11px] text-slate-500">{MONTH_NAMES[day.getMonth()].slice(0, 3)}</span>
                          <span className="text-[10px] text-teal-600 font-medium">{slots} {slots === 1 ? "hr" : "hrs"}</span>
                        </button>
                      ))}
                  </div>
                  {!verTodasLasFechas && fechasDisponibles.length - 1 > FECHAS_INICIALES && (
                    <button
                      onClick={() => setVerTodasLasFechas(true)}
                      className="mt-3 text-sm font-semibold text-teal-700 hover:underline"
                    >
                      Ver más fechas ({fechasDisponibles.length - 1 - FECHAS_INICIALES})
                    </button>
                  )}
                </div>
              )}
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
              <label htmlFor="bk-nombre" className="block text-sm font-medium text-slate-700 mb-1">
                Nombre completo *
              </label>
              <input
                id="bk-nombre"
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-teal-700 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="bk-email" className="block text-sm font-medium text-slate-700 mb-1">
                Email *
              </label>
              <input
                id="bk-email"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-teal-700 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="bk-telefono" className="block text-sm font-medium text-slate-700 mb-1">
                Teléfono
              </label>
              <input
                id="bk-telefono"
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
              <div className={`grid gap-2 ${paymentLinks[selectedService] ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
                {paymentLinks[selectedService] && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("online_webpay")}
                    className={`rounded-lg border p-3 text-left text-sm transition ${
                      paymentMethod === "online_webpay"
                        ? "border-teal-700 bg-teal-50 text-teal-800"
                        : "border-slate-200 hover:border-teal-700"
                    }`}
                  >
                    <p className="font-semibold">Pago online</p>
                    <p className="text-xs text-slate-500">Tarjeta con Mercado Pago</p>
                  </button>
                )}
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
