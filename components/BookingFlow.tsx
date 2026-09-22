"use client";

import { useState, useEffect } from "react";

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

export default function BookingFlow() {
  const [step, setStep] = useState<Step>("service");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [service, setService] = useState<Service | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("in_clinic");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fecha mínima: mañana
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  // Fecha máxima: 30 días
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split("T")[0];

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

      {/* Step 2: Date */}
      {step === "date" && (
        <div>
          <button
            onClick={() => setStep("service")}
            className="text-sm text-slate-500 hover:text-teal-700 mb-4"
          >
            ← Cambiar servicio
          </button>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Elige una fecha
          </h2>
          <input
            type="date"
            min={minDate}
            max={maxDateStr}
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setStep("time");
            }}
            className="w-full max-w-xs rounded-lg border border-slate-300 px-4 py-3 focus:border-teal-700 focus:outline-none"
          />
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
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Horas disponibles
          </h2>
          <p className="text-sm text-slate-500 mb-4">{formatDate(selectedDate)}</p>

          {loading && <p className="text-slate-500">Cargando disponibilidad...</p>}

          {!loading && slots.length === 0 && !error && (
            <p className="text-slate-500">
              No hay horas disponibles para esa fecha. Prueba otro día.
            </p>
          )}

          {!loading && slots.length > 0 && (
            <div className="grid gap-2 grid-cols-3 sm:grid-cols-4">
              {slots.map((slot) => (
                <button
                  key={`${slot.professional_id}_${slot.time}`}
                  onClick={() => {
                    setSelectedSlot(slot);
                    setStep("details");
                  }}
                  className="rounded-lg border border-slate-200 py-3 text-center text-sm font-medium hover:border-teal-700 hover:text-teal-700 transition"
                >
                  {slot.time}
                  <span className="block text-xs text-slate-400 mt-0.5">
                    {slot.professional_name.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Client details */}
      {step === "details" && selectedSlot && service && (
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
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 mb-6 text-sm text-slate-700">
            <p>
              <strong>{service.name}</strong> con{" "}
              {selectedSlot.professional_name}
            </p>
            <p>
              {formatDate(selectedDate)} a las {selectedSlot.time}
            </p>
            <p className="text-teal-700 font-semibold">
              ${service.price_clp.toLocaleString("es-CL")} CLP
            </p>
          </div>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-teal-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-teal-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Teléfono (opcional)
              </label>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-teal-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ¿Cómo prefieres pagar?
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-teal-700 focus:outline-none"
              >
                <option value="in_clinic">En la clínica</option>
                <option value="online_transfer">Transferencia online</option>
                {/* TODO: habilitar cuando esté Transbank Webpay */}
                {/* <option value="online_webpay">Tarjeta (Webpay)</option> */}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notas (opcional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Motivo de consulta, lesión, algo que debamos saber"
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-teal-700 focus:outline-none"
              />
            </div>

            {paymentMethod === "online_transfer" && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                Después de confirmar tu reserva, envía el comprobante de transferencia al
                WhatsApp{" "}
                <a href="https://wa.me/56945399692" className="underline">
                  +56 9 4539 9692
                </a>
                .
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || !clientName || !clientEmail}
              className="w-full rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
            >
              {submitting ? "Reservando..." : "Confirmar reserva"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
