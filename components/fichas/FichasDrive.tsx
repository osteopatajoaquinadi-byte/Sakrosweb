"use client";

import { useEffect, useState } from "react";

type Ficha = {
  drive_id: string;
  titulo: string;
  modificado: string | null;
  patient_id: string | null;
  paciente: string | null;
  url: string;
};

// Resultados de la búsqueda en las fichas antiguas de Google Drive.
export default function FichasDrive({
  search,
  pacientes,
  onAbrirPaciente,
}: {
  search: string;
  pacientes: { id: string; name: string }[];
  onAbrirPaciente: (id: string) => void;
}) {
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [cargando, setCargando] = useState(false);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [destino, setDestino] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const q = search.trim();

  useEffect(() => {
    if (q.length < 2) return;
    const t = setTimeout(() => {
      setCargando(true);
      fetch(`/api/fichas/drive?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d) => setFichas(d.fichas ?? []))
        .catch(() => {})
        .finally(() => setCargando(false));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  async function accion(f: Ficha, tipo: "crear" | "vincular") {
    const patientId = tipo === "vincular" ? destino[f.drive_id] || pacientes[0]?.id : undefined;
    if (tipo === "vincular" && !patientId) return;
    setOcupado(f.drive_id);
    setError("");
    try {
      const res = await fetch("/api/fichas/drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: tipo, drive_id: f.drive_id, patient_id: patientId }),
      });
      const d = await res.json();
      if (!res.ok) setError(d.error || "No se pudo completar.");
      else onAbrirPaciente(d.patient_id);
    } catch {
      setError("Error de conexión.");
    } finally {
      setOcupado(null);
    }
  }

  if (q.length < 2) return null;

  return (
    <div className="mt-8">
      <h3 className="font-semibold text-slate-900">Fichas antiguas (Google Drive)</h3>
      <p className="text-xs text-slate-500 mb-3">
        Para abrirlas necesitas acceso a la carpeta &quot;fichas pacientes SaKros&quot; en Drive.
      </p>
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      {cargando ? (
        <p className="text-slate-500 text-sm">Buscando...</p>
      ) : fichas.length === 0 ? (
        <p className="text-slate-400 text-sm">Sin fichas antiguas con ese nombre.</p>
      ) : (
        <ul className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
          {fichas.map((f) => (
            <li key={f.drive_id} className="px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium text-slate-900 truncate">{f.titulo}</p>
                <p className="text-xs text-slate-500">
                  {f.modificado ? `Última edición ${f.modificado.split("-").reverse().join("-")}` : ""}
                  {f.paciente ? ` · Enlazada a ${f.paciente}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <a href={f.url} target="_blank" rel="noopener noreferrer"
                  className="rounded-full border border-slate-300 px-3 py-1 text-slate-700 hover:border-teal-700 hover:text-teal-700">
                  Abrir
                </a>
                {f.patient_id ? (
                  <button onClick={() => onAbrirPaciente(f.patient_id!)}
                    className="rounded-full bg-teal-700 px-3 py-1 font-semibold text-white hover:bg-teal-800">
                    Ver paciente
                  </button>
                ) : (
                  <>
                    {pacientes.length > 0 && (
                      <>
                        <select
                          value={destino[f.drive_id] ?? pacientes[0].id}
                          onChange={(e) => setDestino({ ...destino, [f.drive_id]: e.target.value })}
                          className="rounded-lg border border-slate-300 px-2 py-1 max-w-[180px]"
                        >
                          {pacientes.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        <button disabled={ocupado === f.drive_id} onClick={() => accion(f, "vincular")}
                          className="rounded-full border border-teal-700 px-3 py-1 text-teal-700 hover:bg-teal-50 disabled:opacity-50">
                          Vincular
                        </button>
                      </>
                    )}
                    <button disabled={ocupado === f.drive_id} onClick={() => accion(f, "crear")}
                      className="rounded-full bg-teal-700 px-3 py-1 font-semibold text-white hover:bg-teal-800 disabled:opacity-50">
                      {ocupado === f.drive_id ? "..." : "Crear paciente"}
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
