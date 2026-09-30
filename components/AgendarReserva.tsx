"use client";

import { useEffect, useState } from "react";

type Option = { id: string; name: string; slug: string };
type PatientHit = { id: string; name: string; phone: string | null; email: string | null };

const input =
  "w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none";

// Formulario para agendar desde el panel (admin, profesionales y secretaría).
export default function AgendarReserva({
  defaultDate,
  onDone,
  onCancel,
}: {
  defaultDate: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [professionals, setProfessionals] = useState<Option[]>([]);
  const [services, setServices] = useState<Option[]>([]);
  const [links, setLinks] = useState<{ professional_id: string; service_id: string }[]>([]);

  const [serviceId, setServiceId] = useState("");
  const [professionalId, setProfessionalId] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("09:00");
  const [notes, setNotes] = useState("");

  const [search, setSearch] = useState("");
  const [hits, setHits] = useState<PatientHit[]>([]);
  const [patient, setPatient] = useState<PatientHit | null>(null);
  const [newPatient, setNewPatient] = useState({ name: "", phone: "", email: "" });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/equipo/bookings")
      .then((r) => r.json())
      .then((d) => {
        setProfessionals(d.professionals ?? []);
        setServices(d.services ?? []);
        setLinks(d.links ?? []);
      })
      .catch(() => setError("No se pudieron cargar servicios y profesionales."));
  }, []);

  useEffect(() => {
    const q = search.trim();
    if (q.length < 2 || patient) return;
    const t = setTimeout(() => {
      fetch(`/api/fichas/patients?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d) => setHits((d.patients ?? []).slice(0, 8)))
        .catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [search, patient]);

  const availablePros = serviceId
    ? professionals.filter((p) =>
        links.some((l) => l.service_id === serviceId && l.professional_id === p.id)
      )
    : professionals;

  async function submit(allowOverlap = false) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/equipo/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patient?.id ?? null,
          client_name: patient ? undefined : newPatient.name,
          client_phone: patient ? undefined : newPatient.phone,
          client_email: patient ? undefined : newPatient.email,
          service_id: serviceId,
          professional_id: professionalId,
          booking_date: date,
          start_time: time,
          notes: notes || null,
          allow_overlap: allowOverlap,
        }),
      });
      const d = await res.json();
      if (res.status === 409 && d.overlap) {
        if (confirm(`${d.error} ¿Agendar igual (por ejemplo, sesión grupal)?`)) {
          await submit(true);
        }
        return;
      }
      if (!res.ok) {
        setError(d.error || "Error al agendar.");
        return;
      }
      onDone();
    } catch {
      setError("Error de conexión.");
    } finally {
      setSaving(false);
    }
  }

  const canSubmit =
    serviceId && professionalId && date && time && (patient || newPatient.name.trim());

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="rounded-xl border border-teal-300 bg-white p-5 mb-6"
    >
      <h3 className="font-semibold text-slate-900 mb-4">Agendar hora</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">Paciente *</label>
        {patient ? (
          <div className="flex items-center justify-between rounded-lg bg-teal-50 border border-teal-200 px-3 py-2">
            <span className="text-sm text-slate-900">
              {patient.name}
              {patient.phone && <span className="text-slate-500"> · {patient.phone}</span>}
            </span>
            <button type="button" onClick={() => { setPatient(null); setSearch(""); }}
              className="text-xs font-semibold text-teal-700 hover:underline">
              Cambiar
            </button>
          </div>
        ) : (
          <>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar paciente existente por nombre, RUT o email..." className={input} />
            {hits.length > 0 && search.trim().length >= 2 && (
              <ul className="mt-1 rounded-lg border border-slate-200 divide-y divide-slate-100 max-h-48 overflow-auto">
                {hits.map((h) => (
                  <li key={h.id}>
                    <button type="button" onClick={() => { setPatient(h); setHits([]); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-teal-50">
                      {h.name} <span className="text-slate-400">{h.phone || h.email || ""}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-slate-500 mt-2 mb-1">
              ¿Paciente nuevo? Completa sus datos (se crea su ficha automáticamente):
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              <input type="text" placeholder="Nombre" value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })} className={input} />
              <input type="tel" placeholder="Teléfono" value={newPatient.phone}
                onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })} className={input} />
              <input type="email" placeholder="Email" value={newPatient.email}
                onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })} className={input} />
            </div>
          </>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">Servicio *
          <select value={serviceId} onChange={(e) => { setServiceId(e.target.value); setProfessionalId(""); }}
            className={`mt-1 ${input}`}>
            <option value="">Elegir...</option>
            {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">Profesional *
          <select value={professionalId} onChange={(e) => setProfessionalId(e.target.value)}
            className={`mt-1 ${input}`}>
            <option value="">Elegir...</option>
            {availablePros.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">Fecha *
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`mt-1 ${input}`} />
        </label>
        <label className="text-sm font-medium text-slate-700">Hora *
          <input type="time" step={900} value={time} onChange={(e) => setTime(e.target.value)}
            className={`mt-1 ${input}`} />
        </label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">Notas
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className={`mt-1 ${input}`} />
        </label>
      </div>

      {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="submit" disabled={saving || !canSubmit}
          className="rounded-full bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50">
          {saving ? "Agendando..." : "Agendar"}
        </button>
        <button type="button" onClick={onCancel}
          className="rounded-full border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:border-teal-700">
          Cancelar
        </button>
      </div>
    </form>
  );
}
