"use client";

import { useEffect, useState } from "react";

type Reserva = {
  id: string;
  date: string;
  time: string;
  service: string;
  professional: string;
  status: string;
  paid: boolean;
};

const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
function fecha(d: string) {
  const [y, m, dd] = d.split("-").map(Number);
  const dia = DIAS[new Date(Date.UTC(y, m - 1, dd)).getUTCDay()];
  return `${dia} ${String(dd).padStart(2, "0")}-${String(m).padStart(2, "0")}-${y}`;
}

function Estado({ r, futura }: { r: Reserva; futura: boolean }) {
  const [txt, cls] =
    r.status === "cancelled"
      ? ["Cancelada", "bg-slate-100 text-slate-500 line-through"]
      : r.status === "no_show"
        ? ["No asistió", "bg-red-50 text-red-700"]
        : futura
          ? ["Agendada", "bg-teal-50 text-teal-700"]
          : ["Realizada", "bg-emerald-50 text-emerald-700"];
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{txt}</span>;
}

function Fila({ r, futura }: { r: Reserva; futura: boolean }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
      <div className="min-w-0">
        <span className="font-medium text-slate-900">{fecha(r.date)}</span>
        <span className="text-slate-500"> · {r.time} · </span>
        <span className="text-slate-700">{r.service || "Sesión"}</span>
        {r.professional && <span className="text-slate-500"> con {r.professional}</span>}
      </div>
      <div className="flex items-center gap-2">
        {r.paid && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">Pagada</span>}
        <Estado r={r} futura={futura} />
      </div>
    </li>
  );
}

// Reservas de la agenda del paciente: próximas e historial.
export default function ReservasPaciente({ patientId }: { patientId: string }) {
  const [proximas, setProximas] = useState<Reserva[]>([]);
  const [historial, setHistorial] = useState<Reserva[]>([]);
  const [cargando, setCargando] = useState(true);
  const [verHistorial, setVerHistorial] = useState(false);

  useEffect(() => {
    fetch(`/api/fichas/patients/${patientId}/reservas`)
      .then((r) => r.json())
      .then((d) => {
        setProximas(d.proximas ?? []);
        setHistorial(d.historial ?? []);
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [patientId]);

  const realizadas = historial.filter((r) => r.status !== "cancelled" && r.status !== "no_show").length;
  const inasistencias = historial.filter((r) => r.status === "no_show").length;
  const canceladas = historial.filter((r) => r.status === "cancelled").length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 mb-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <h3 className="font-semibold text-slate-900">Reservas</h3>
        {!cargando && (
          <p className="text-xs text-slate-500">
            {proximas.length} por realizar · {realizadas} realizadas
            {inasistencias > 0 && ` · ${inasistencias} inasistencias`}
            {canceladas > 0 && ` · ${canceladas} canceladas`}
          </p>
        )}
      </div>

      {cargando ? (
        <p className="text-sm text-slate-500">Cargando reservas...</p>
      ) : (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Por realizar</p>
          {proximas.length === 0 ? (
            <p className="text-sm text-slate-400 py-2">No tiene horas agendadas.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {proximas.map((r) => <Fila key={r.id} r={r} futura />)}
            </ul>
          )}

          {historial.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setVerHistorial(!verHistorial)}
                className="text-sm font-medium text-teal-700 hover:text-teal-800"
              >
                {verHistorial ? "Ocultar historial" : `Ver historial (${historial.length})`}
              </button>
              {verHistorial && (
                <ul className="mt-1 divide-y divide-slate-100">
                  {historial.map((r) => <Fila key={r.id} r={r} futura={false} />)}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
