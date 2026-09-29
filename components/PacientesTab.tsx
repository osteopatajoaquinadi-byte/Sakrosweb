"use client";

import { useState, useEffect, useCallback } from "react";
import FichaPaciente from "./FichaPaciente";

type Patient = {
  id: string;
  rut: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  sport: string | null;
  reason: string | null;
  created_at: string;
};

export default function PacientesTab({ pin }: { pin: string }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Form para crear
  const [form, setForm] = useState({
    name: "", rut: "", phone: "", email: "", date_of_birth: "",
    occupation: "", sport: "", reason: "", notes: "",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const headers = { "x-equipo-pin": pin };

  const fetchPatients = useCallback(() => {
    setLoading(true);
    const q = search.trim();
    const url = q ? `/api/fichas/patients?q=${encodeURIComponent(q)}` : "/api/fichas/patients";
    fetch(url, { headers })
      .then((r) => r.json())
      .then((d) => setPatients(d.patients ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, pin]);

  useEffect(() => {
    const t = setTimeout(fetchPatients, 300);
    return () => clearTimeout(t);
  }, [fetchPatients]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/fichas/patients", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, created_by: "equipo" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al crear.");
      } else {
        setShowCreate(false);
        setForm({ name: "", rut: "", phone: "", email: "", date_of_birth: "", occupation: "", sport: "", reason: "", notes: "" });
        setSelectedId(data.patient.id);
        fetchPatients();
      }
    } catch {
      setError("Error de conexión.");
    } finally {
      setCreating(false);
    }
  }

  // Vista de ficha individual
  if (selectedId) {
    return (
      <div>
        <button
          onClick={() => setSelectedId(null)}
          className="text-sm text-slate-500 hover:text-teal-700 mb-4"
        >
          ← Volver a pacientes
        </button>
        <FichaPaciente patientId={selectedId} pin={pin} />
      </div>
    );
  }

  return (
    <div>
      {/* Barra superior */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, RUT o email..."
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 focus:border-teal-700 focus:outline-none"
        />
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 whitespace-nowrap"
        >
          {showCreate ? "Cancelar" : "+ Nuevo paciente"}
        </button>
      </div>

      {/* Formulario crear paciente */}
      {showCreate && (
        <form onSubmit={handleCreate} className="rounded-xl border border-slate-200 bg-white p-6 mb-6">
          <h3 className="font-semibold text-slate-900 mb-4">Nuevo paciente</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">RUT</label>
              <input type="text" value={form.rut} onChange={(e) => setForm({ ...form, rut: e.target.value })}
                placeholder="12.345.678-9"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de nacimiento</label>
              <input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ocupación</label>
              <input type="text" value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Deporte</label>
              <input type="text" value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Motivo de consulta</label>
              <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={2}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
            </div>
          </div>
          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
          <button type="submit" disabled={creating || !form.name.trim()}
            className="mt-4 rounded-full bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50">
            {creating ? "Guardando..." : "Crear paciente"}
          </button>
        </form>
      )}

      {/* Lista de pacientes */}
      {loading ? (
        <p className="text-slate-500 text-center py-8">Cargando pacientes...</p>
      ) : patients.length === 0 ? (
        <p className="text-slate-400 text-center py-8">
          {search ? "Sin resultados." : "No hay pacientes registrados."}
        </p>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Nombre</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700 hidden sm:table-cell">RUT</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700 hidden md:table-cell">Deporte</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700 hidden lg:table-cell">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className="hover:bg-teal-50 cursor-pointer transition"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-500 sm:hidden">{p.rut || "–"}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{p.rut || "–"}</td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{p.sport || "–"}</td>
                  <td className="px-4 py-3 text-slate-600 truncate max-w-[200px] hidden lg:table-cell">{p.reason || "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
