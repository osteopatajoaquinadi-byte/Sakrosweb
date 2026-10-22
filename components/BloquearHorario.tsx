"use client";

import { useEffect, useState } from "react";

type Option = { id: string; name: string };
type Choque = { date: string; time: string; client_name: string };

const input =
  "w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none";

const fecha = (d: string) =>
  new Date(`${d}T12:00:00`).toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" });

// Bloquear un horario de un profesional: la agenda online deja de ofrecerlo.
export default function BloquearHorario({
  defaultDate,
  onDone,
  onCancel,
}: {
  defaultDate: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [professionals, setProfessionals] = useState<Option[]>([]);
  const [professionalId, setProfessionalId] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [dateTo, setDateTo] = useState("");
  const [varios, setVarios] = useState(false);
  const [allDay, setAllDay] = useState(false);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [choques, setChoques] = useState<Choque[] | null>(null);

  useEffect(() => {
    fetch("/api/equipo/bookings")
      .then((r) => r.json())
      .then((d) => setProfessionals(d.professionals ?? []))
      .catch(() => setError("No se pudieron cargar los profesionales."));
  }, []);

  const valido =
    professionalId && date && reason.trim() && (allDay || (start && end && end > start)) &&
    (!varios || !dateTo || dateTo >= date);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/equipo/bloqueos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professional_id: professionalId,
          date,
          date_to: varios && dateTo ? dateTo : date,
          all_day: allDay,
          start_time: allDay ? null : start,
          end_time: allDay ? null : end,
          reason,
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error || "No se pudo guardar el bloqueo.");
      } else if (d.conflicts?.length) {
        setChoques(d.conflicts);
      } else {
        onDone();
      }
    } catch {
      setError("Error de conexión.");
    } finally {
      setSaving(false);
    }
  }

  if (choques) {
    return (
      <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm text-slate-700">
        <p className="font-semibold text-amber-900">Bloqueo guardado.</p>
        <p className="mt-1">
          Ojo: en ese horario ya hay {choques.length} cita{choques.length === 1 ? "" : "s"} agendada
          {choques.length === 1 ? "" : "s"}. No se cancelaron; revísalas y muévelas si corresponde:
        </p>
        <ul className="mt-2 list-disc pl-5">
          {choques.map((c, i) => (
            <li key={i}>{fecha(c.date)} · {c.time} · {c.client_name}</li>
          ))}
        </ul>
        <button onClick={onDone}
          className="mt-4 rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800">
          Entendido
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={guardar} className="mb-4 rounded-xl border border-slate-300 bg-white p-5">
      <h3 className="mb-3 font-semibold text-slate-900">Bloquear horario</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">Profesional *
          <select required value={professionalId} onChange={(e) => setProfessionalId(e.target.value)} className={`mt-1 ${input}`}>
            <option value="">Elige profesional…</option>
            {professionals.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">{varios ? "Desde *" : "Fecha *"}
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={`mt-1 ${input}`} />
        </label>
        <div className="flex flex-col gap-2 text-sm text-slate-700 sm:col-span-2 sm:flex-row sm:gap-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
            Día completo
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={varios} onChange={(e) => setVarios(e.target.checked)} />
            Varios días seguidos (vacaciones, congreso…)
          </label>
        </div>
        {varios && (
          <label className="text-sm font-medium text-slate-700">Hasta *
            <input type="date" required min={date} value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={`mt-1 ${input}`} />
          </label>
        )}
        {!allDay && (
          <div className="grid grid-cols-2 gap-3 sm:col-span-2 sm:max-w-sm">
            <label className="text-sm font-medium text-slate-700">Desde las *
              <input type="time" required value={start} onChange={(e) => setStart(e.target.value)} className={`mt-1 ${input}`} />
            </label>
            <label className="text-sm font-medium text-slate-700">Hasta las *
              <input type="time" required value={end} onChange={(e) => setEnd(e.target.value)} className={`mt-1 ${input}`} />
            </label>
          </div>
        )}
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">Motivo o nota *
          <input type="text" required value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder="Ej: trámite personal, capacitación, vacaciones…" className={`mt-1 ${input}`} />
        </label>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="submit" disabled={saving || !valido}
          className="rounded-full bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-50">
          {saving ? "Guardando..." : "Bloquear horario"}
        </button>
        <button type="button" onClick={onCancel}
          className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-teal-700">
          Cancelar
        </button>
      </div>
    </form>
  );
}
