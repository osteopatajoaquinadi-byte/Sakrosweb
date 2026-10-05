"use client";

import { bookingSlug, paymentLinks, paymentProvider } from "@/lib/site-config";
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

type Step = "service" | "date" | "time" | "details" | "done";

const PROGRAMA_REHAB_SLUG = "programa-rehabilitacion-kinesica";

// El programa se agenda como una hora de kinesiología (la primera sesión):
// el paciente elige fecha y hora, deja sus datos y al final elige su
// previsión (FONASA o ISAPRE) y cómo pagar.
const SERVICES_LIST = [
  { slug: "osteopatia", label: "Osteopatía", price: "$40.000" },
  { slug: "kinesiologia", label: "Kinesiología", price: "$25.000" },
  { slug: PROGRAMA_REHAB_SLUG, label: "Programa de Rehabilitación Kinésica", price: "10 sesiones" },
  { slug: "posturologia", label: "Posturología Clínica", price: "$30.000" },
  { slug: "estudio-biomecanico", label: "Estudio Biomecánico", price: "$40.000" },
  { slug: "actividad-fisica-dirigida", label: "Actividad Física Dirigida", price: "$12.000" },
];

const PROGRAMA = {
  fonasa: { label: "FONASA", price: "$190.000", cardUrl: "https://www.tuu.cl/programafonasa" },
  isapre: { label: "ISAPRE", price: "$230.000", cardUrl: "https://www.tuu.cl/programaisapre" },
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
  // Solo se preselecciona un servicio que exista en el calendario; si no,
  // el paciente parte eligiendo el servicio.
  const requested = bookingSlug(searchParams.get("servicio") || "");
  const preselectedService = SERVICES_LIST.some((s) => s.slug === requested) ? requested : "";

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
  // Cobro propio de la reserva (Mercado Pago); si no hay, se usa el link fijo.
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const pagoRetorno = searchParams.get("pago");
  const [submitting, setSubmitting] = useState(false);
  // Programa de rehabilitación kinésica: misma reserva que kinesiología,
  // con previsión y precio del programa al final.
  const [isProgram, setIsProgram] = useState(false);
  const [programaPrevision, setProgramaPrevision] = useState<"fonasa" | "isapre" | "">("");
  const programa = programaPrevision ? PROGRAMA[programaPrevision] : null;

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

  const serviceName = isProgram
    ? "Programa de Rehabilitación Kinésica"
    : SERVICES_LIST.find(s => s.slug === selectedService)?.label || "";

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
          notes: isProgram && programa
            ? `[Programa Rehabilitación ${programa.label}] ${notes}`.trim()
            : notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al crear la reserva.");
      } else {
        trackEvent("reserva_confirmada", {
          servicio: isProgram ? `programa_rehab_${programaPrevision}` : selectedService,
          pago: paymentMethod,
        });
        setPaymentUrl(data.payment_url ?? null);
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

  if (pagoRetorno && step === "service" && !selectedService) {
    const ok = pagoRetorno === "ok";
    return (
      <div className={`rounded-2xl border p-8 text-center ${ok ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
        <p className={`text-2xl font-bold mb-2 ${ok ? "text-emerald-800" : "text-amber-800"}`}>
          {ok ? "¡Pago recibido!" : pagoRetorno === "pendiente" ? "Pago en proceso" : "El pago no se completó"}
        </p>
        <p className={`mb-4 ${ok ? "text-emerald-700" : "text-amber-700"}`}>
          {ok
            ? "Tu reserva quedó confirmada y pagada. Te esperamos."
            : pagoRetorno === "pendiente"
            ? "Tu reserva quedará pagada apenas Mercado Pago confirme el pago."
            : "Puedes volver a intentarlo desde el link del correo de confirmación, o escribirnos por WhatsApp."}
        </p>
        <a
          href="https://wa.me/56945399692"
          className="inline-block rounded-full border border-teal-700 px-6 py-3 text-sm font-semibold text-teal-700 hover:bg-teal-50"
        >
          Escribir por WhatsApp
        </a>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 text-center">
        <p className="text-2xl font-bold text-emerald-800 mb-2">Reserva confirmada</p>
        <p className="text-emerald-700 mb-4">
          Te enviamos los detalles a <strong>{clientEmail}</strong>.
        </p>
        {paymentMethod === "online_webpay" && isProgram && programa && (
          <a
            href={programa.cardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mb-4 rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Pagar {programa.price} con tarjeta
          </a>
        )}
        {paymentMethod === "online_webpay" && !isProgram && paymentUrl && (
          <>
            <a
              href={paymentUrl}
              className="inline-block mb-2 rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Pagar ahora con Mercado Pago
            </a>
            <p className="text-sm text-emerald-700 mb-4">
              Tienes 2 horas para pagar. Si no se completa el pago, la hora se libera.
            </p>
          </>
        )}
        {paymentMethod === "online_webpay" && !isProgram && !paymentUrl && paymentLinks[selectedService] && (
          <a
            href={paymentLinks[selectedService]}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mb-4 rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Pagar ahora con {paymentProvider(paymentLinks[selectedService])}
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
            setIsProgram(false);
            setProgramaPrevision("");
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
                  const program = s.slug === PROGRAMA_REHAB_SLUG;
                  setSelectedService(program ? "kinesiologia" : s.slug);
                  setIsProgram(program);
                  setProgramaPrevision("");
                  setPaymentMethod("in_clinic");
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
              setIsProgram(false);
              setProgramaPrevision("");
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

            {/* Previsión (solo programa) */}
            {isProgram && (
              <div>
                <p className="block text-sm font-medium text-slate-700 mb-2">Previsión *</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(["fonasa", "isapre"] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => { setProgramaPrevision(k); setPaymentMethod(""); }}
                      className={`rounded-lg border p-3 text-left text-sm transition ${
                        programaPrevision === k
                          ? "border-teal-700 bg-teal-50 text-teal-800"
                          : "border-slate-200 hover:border-teal-700"
                      }`}
                    >
                      <p className="font-semibold">{PROGRAMA[k].label}</p>
                      <p className="text-xs text-slate-500">Programa de 10 sesiones</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(!isProgram || programa) && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Modalidad de pago
              </label>
              <div className={`grid gap-2 ${isProgram || paymentLinks[selectedService] ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
                {(isProgram || paymentLinks[selectedService]) && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("online_webpay")}
                    className={`rounded-lg border p-3 text-left text-sm transition ${
                      paymentMethod === "online_webpay"
                        ? "border-teal-700 bg-teal-50 text-teal-800"
                        : "border-slate-200 hover:border-teal-700"
                    }`}
                  >
                    <p className="font-semibold">{isProgram ? "Pago con tarjeta" : "Pago online"}</p>
                    <p className="text-xs text-slate-500">{isProgram ? "Online, al confirmar la reserva" : `Tarjeta con ${paymentProvider(paymentLinks[selectedService])}`}</p>
                    {programa && <p className="text-xs font-semibold text-teal-700 mt-1">{programa.price}</p>}
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
                  {programa && <p className="text-xs font-semibold text-teal-700 mt-1">{programa.price}</p>}
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
                  {programa && <p className="text-xs font-semibold text-teal-700 mt-1">{programa.price}</p>}
                </button>
              </div>
              {paymentMethod === "online_transfer" && (
                <div className="mt-3 rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900 mb-1">Datos para transferencia</p>
                  <p>Anikken Arentsen</p>
                  <p>RUT: 17.751.987-1</p>
                  <p>Cuenta RUT BancoEstado</p>
                  <p>N° cuenta: 17751987</p>
                  {programa && <p className="mt-1 font-semibold text-teal-700">Monto: {programa.price}</p>}
                  <p className="mt-2 text-xs text-slate-500">
                    Envía el comprobante al{" "}
                    <a href="https://wa.me/56945399692" className="text-teal-700 underline">+56 9 4539 9692</a>
                  </p>
                </div>
              )}
            </div>
            )}

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
              disabled={!clientName || !clientEmail || submitting || (isProgram && (!programa || !paymentMethod))}
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
