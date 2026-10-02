"use client";

import { useEffect, useState } from "react";
import FichaPaciente from "./FichaPaciente";
import type { Permission } from "@/lib/equipo-auth";

export type CalendarBooking = {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  client_name: string;
  client_phone: string | null;
  client_email?: string | null;
  fichas_patient_id?: string | null;
  payment_status: string;
  notes: string | null;
  status: string;
  service_id: string;
  professional_id: string;
  services: { name: string; slug: string };
  professionals: { name: string; slug: string };
};

type Option = { id: string; name: string; slug: string };
type Options = {
  professionals: Option[];
  services: Option[];
  links: { professional_id: string; service_id: string }[];
};

type Payment = {
  id: string;
  amount: number;
  method: string;
  pack_name: string | null;
  sessions_purchased: number;
  service_type: string | null;
  created_at: string;
};

const METHOD_LABELS: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  webpay: "Webpay",
  otro: "Otro",
};

type Balance = {
  total_remaining: number;
  balance_detail: { service_type: string; remaining: number }[] | null;
} | null;

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmada",
  completed: "Asistió",
  no_show: "No asistió",
  cancelled: "Cancelada",
};

export default function DetalleCita({
  booking,
  permissions,
  onClose,
  onChanged,
}: {
  booking: CalendarBooking;
  permissions: Permission[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const puedeAgendar = permissions.includes("agendar");
  const puedeVerFicha = permissions.includes("pacientes");
  const puedeVerPagos = permissions.includes("pagos");
  const fichaId = booking.fichas_patient_id ?? null;

  const [verFicha, setVerFicha] = useState(false);
  const [balance, setBalance] = useState<Balance>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingBalance, setLoadingBalance] = useState(!!fichaId && puedeVerFicha);

  const [editando, setEditando] = useState(false);
  const [options, setOptions] = useState<Options | null>(null);
  const [form, setForm] = useState({
    booking_date: booking.booking_date,
    start_time: booking.start_time.slice(0, 5),
    professional_id: booking.professional_id,
    service_id: booking.service_id,
    notes: booking.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Sesiones restantes del paciente
  useEffect(() => {
    if (!fichaId || !puedeVerFicha) return;
    fetch(`/api/fichas/patients/${fichaId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setBalance(d?.balance ?? null);
        setPayments(d?.payments ?? []);
      })
      .catch(() => {})
      .finally(() => setLoadingBalance(false));
  }, [fichaId, puedeVerFicha]);

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function abrirEdicion() {
    setEditando(true);
    setError("");
    if (!options) {
      fetch("/api/equipo/bookings")
        .then((r) => r.json())
        .then((d) => setOptions(d))
        .catch(() => setError("No se pudieron cargar profesionales y servicios."));
    }
  }

  async function patch(payload: Record<string, unknown>, closeAfter = false) {
    setSaving(true);
    setError("");
    try {
      let res = await fetch("/api/equipo/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: booking.id, ...payload }),
      });
      let d = await res.json().catch(() => ({}));
      if (res.status === 409 && d.overlap && confirm(`${d.error} ¿Guardar igual?`)) {
        res = await fetch("/api/equipo/bookings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: booking.id, ...payload, allow_overlap: true }),
        });
        d = await res.json().catch(() => ({}));
      }
      if (!res.ok) {
        setError(d.error || "No se pudo actualizar la cita.");
        return;
      }
      onChanged();
      if (closeAfter) onClose();
      else setEditando(false);
    } catch {
      setError("Error de conexión.");
    } finally {
      setSaving(false);
    }
  }

  function setStatus(status: string) {
    if (status === "cancelled" && !confirm("¿Cancelar esta cita?")) return;
    patch({ status }, true);
  }

  // Servicios que ofrece el profesional elegido
  const serviciosDelPro = options
    ? options.services.filter((s) =>
        options.links.some((l) => l.professional_id === form.professional_id && l.service_id === s.id)
      )
    : [];

  const programa = booking.notes?.match(/Programa: sesión (\d+) de (\d+)/);
  const fecha = new Date(booking.booking_date + "T12:00:00").toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`h-full w-full bg-white shadow-2xl overflow-y-auto border-l border-slate-200 animate-[slideIn_.2s_ease-out] ${
          verFicha ? "sm:max-w-3xl" : "sm:max-w-md"
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3">
          {verFicha ? (
            <button onClick={() => setVerFicha(false)} className="text-sm text-slate-500 hover:text-teal-700">
              ← Volver a la cita
            </button>
          ) : (
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cita</p>
          )}
          <button onClick={onClose} aria-label="Cerrar" className="text-2xl leading-none text-slate-400 hover:text-slate-700">
            ×
          </button>
        </div>

        {verFicha && fichaId ? (
          <div className="p-5">
            <FichaPaciente patientId={fichaId} permissions={permissions} />
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Encabezado */}
            <div>
              <h3 className="text-xl font-bold text-slate-900">{booking.client_name}</h3>
              <p className="text-sm text-slate-600 first-letter:uppercase">
                {fecha} · {booking.start_time.slice(0, 5)} – {booking.end_time.slice(0, 5)}
              </p>
              <p className="text-sm text-slate-600">
                {booking.services?.name} · {booking.professionals?.name}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
                  {STATUS_LABELS[booking.status] ?? booking.status}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 font-semibold ${
                    booking.payment_status === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {booking.payment_status === "paid" ? "Pagada" : "Pago pendiente"}
                </span>
                {programa && (
                  <span className="rounded-full bg-teal-100 px-2.5 py-1 font-semibold text-teal-800">
                    Programa: sesión {programa[1]} de {programa[2]}
                  </span>
                )}
              </div>
              {(booking.client_phone || booking.client_email) && (
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  {booking.client_phone && (
                    <>
                      <a href={`tel:${booking.client_phone}`} className="text-teal-700 hover:underline">
                        {booking.client_phone}
                      </a>
                      <a
                        href={`https://wa.me/${booking.client_phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-700 hover:underline"
                      >
                        WhatsApp
                      </a>
                    </>
                  )}
                  {booking.client_email && <span className="text-slate-600">{booking.client_email}</span>}
                </div>
              )}
            </div>

            {/* Sesiones y ficha */}
            {puedeVerFicha && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                {fichaId ? (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-500">Sesiones restantes</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {loadingBalance ? "–" : balance?.total_remaining ?? 0}
                      </p>
                      {balance?.balance_detail && balance.balance_detail.length > 0 && (
                        <p className="text-xs text-slate-500">
                          {balance.balance_detail.map((b) => `${b.service_type}: ${b.remaining}`).join(" · ")}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setVerFicha(true)}
                      className="rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                    >
                      Abrir ficha
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    Esta cita no está vinculada a una ficha. Búscala en la pestaña Pacientes.
                  </p>
                )}
              </div>
            )}

            {/* Pagos */}
            {puedeVerFicha && puedeVerPagos && fichaId && !loadingBalance && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">Pagos</p>
                {payments.length === 0 ? (
                  <p className="text-sm text-slate-400">Sin pagos registrados.</p>
                ) : (
                  <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                    {payments.slice(0, 4).map((p) => (
                      <li key={p.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {p.pack_name || p.service_type || "Pago"}
                            {p.sessions_purchased > 1 && !p.pack_name?.includes(String(p.sessions_purchased)) && ` · ${p.sessions_purchased} sesiones`}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(p.created_at).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}
                            {" · "}
                            {METHOD_LABELS[p.method] ?? p.method}
                          </p>
                        </div>
                        <span className="shrink-0 font-semibold text-slate-900">
                          ${Number(p.amount).toLocaleString("es-CL")}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {payments.length > 4 && (
                  <button onClick={() => setVerFicha(true)} className="mt-2 text-xs font-semibold text-teal-700 hover:underline">
                    Ver los {payments.length} pagos en la ficha
                  </button>
                )}
              </div>
            )}

            {booking.notes && !editando && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Notas</p>
                <p className="text-sm text-slate-700 whitespace-pre-line">{booking.notes}</p>
              </div>
            )}

            {/* Acciones */}
            {puedeAgendar && !editando && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {booking.status !== "completed" && (
                    <button
                      disabled={saving}
                      onClick={() => setStatus("completed")}
                      className="rounded-full border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                    >
                      Asistió
                    </button>
                  )}
                  {booking.status !== "no_show" && (
                    <button
                      disabled={saving}
                      onClick={() => setStatus("no_show")}
                      className="rounded-full border border-amber-600 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                    >
                      No asistió
                    </button>
                  )}
                  {booking.status !== "confirmed" && (
                    <button
                      disabled={saving}
                      onClick={() => setStatus("confirmed")}
                      className="rounded-full border border-slate-400 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Volver a confirmada
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={abrirEdicion}
                    className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                  >
                    Modificar cita
                  </button>
                  <button
                    disabled={saving}
                    onClick={() => setStatus("cancelled")}
                    className="rounded-full px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    Cancelar cita
                  </button>
                </div>
              </div>
            )}

            {/* Formulario de edición */}
            {editando && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  patch(form);
                }}
                className="space-y-3 rounded-xl border border-slate-200 p-4"
              >
                <p className="font-semibold text-slate-900">Modificar cita</p>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-sm text-slate-700">
                    Fecha
                    <input
                      type="date"
                      value={form.booking_date}
                      onChange={(e) => setForm({ ...form, booking_date: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none"
                    />
                  </label>
                  <label className="text-sm text-slate-700">
                    Hora
                    <input
                      type="time"
                      step={900}
                      value={form.start_time}
                      onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none"
                    />
                  </label>
                </div>
                <label className="block text-sm text-slate-700">
                  Profesional
                  <select
                    value={form.professional_id}
                    disabled={!options}
                    onChange={(e) => {
                      const professional_id = e.target.value;
                      const ofrece = options?.links.some(
                        (l) => l.professional_id === professional_id && l.service_id === form.service_id
                      );
                      const primero = options?.links.find((l) => l.professional_id === professional_id)?.service_id;
                      setForm({ ...form, professional_id, service_id: ofrece ? form.service_id : primero ?? form.service_id });
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none"
                  >
                    {!options && <option>{booking.professionals?.name}</option>}
                    {options?.professionals.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm text-slate-700">
                  Servicio
                  <select
                    value={form.service_id}
                    disabled={!options}
                    onChange={(e) => setForm({ ...form, service_id: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none"
                  >
                    {!options && <option>{booking.services?.name}</option>}
                    {serviciosDelPro.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm text-slate-700">
                  Notas
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none"
                  />
                </label>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={saving || !options}
                    className="rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
                  >
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditando(false)}
                    className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )}
      </aside>
    </div>
  );
}
