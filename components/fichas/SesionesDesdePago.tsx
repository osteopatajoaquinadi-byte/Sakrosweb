"use client";

import { useEffect, useState } from "react";

type Cita = { id: string; date: string; time: string; status: string; service: string; professional: string };
type Resultado = { done: Cita[]; no_show: Cita[]; upcoming: Cita[] };

const fecha = (d: string) =>
  new Date(`${d}T12:00:00`).toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

// Cuenta en el calendario las sesiones realizadas desde la fecha del pago
// y muestra cuántas quedan del pack.
export default function SesionesDesdePago({
  patientId,
  from,
  service,
  purchased,
  onCount,
  actionLabel,
}: {
  patientId: string;
  from: string;
  service: string; // "" = cualquier servicio
  purchased: number;
  onCount?: (done: number) => void;
  actionLabel?: string; // si se indica, muestra un botón para aplicar el conteo
}) {
  const [data, setData] = useState<{ key: string; res: Resultado | null; error: string } | null>(null);
  const [verLista, setVerLista] = useState(false);
  const key = `${patientId}|${from}|${service}`;

  useEffect(() => {
    if (!from) return;
    let vigente = true;
    const t = setTimeout(() => {
      const q = new URLSearchParams({ patient_id: patientId, from, service });
      fetch(`/api/fichas/payments/calendario?${q}`)
        .then((r) => r.json())
        .then((d) => {
          if (!vigente) return;
          if (d.error) setData({ key, res: null, error: d.error });
          else setData({ key, res: d, error: "" });
        })
        .catch(() => vigente && setData({ key, res: null, error: "Error de conexión." }));
    }, 300);
    return () => {
      vigente = false;
      clearTimeout(t);
    };
  }, [key, patientId, from, service]);

  const actual = data?.key === key ? data : null;
  const realizadas = actual?.res?.done.length ?? 0;

  // Sin botón: el conteo se aplica solo cada vez que cambia.
  useEffect(() => {
    if (actual?.res && !actionLabel) onCount?.(actual.res.done.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actual?.res]);

  if (!from) return null;
  if (!actual) return <p className="text-xs text-slate-500">Buscando sesiones en el calendario…</p>;
  if (actual.error) return <p className="text-xs text-red-600">{actual.error}</p>;

  const res = actual.res!;
  const quedan = Math.max(0, purchased - realizadas);
  const servicioTxt = service ? ` de ${service}` : "";

  return (
    <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-slate-700">
      <p>
        Desde el <strong>{fecha(from)}</strong> hay <strong>{realizadas}</strong>{" "}
        {realizadas === 1 ? "sesión realizada" : "sesiones realizadas"}
        {servicioTxt} en el calendario.
      </p>
      <p className="mt-1 font-semibold text-teal-800">
        {realizadas > purchased
          ? `Ojo: ya realizó ${realizadas} y el pack es de ${purchased}. Le quedan 0 (${realizadas - purchased} sin cubrir).`
          : `Le quedan ${quedan} de ${purchased} ${purchased === 1 ? "sesión" : "sesiones"}.`}
      </p>
      {(res.upcoming.length > 0 || res.no_show.length > 0) && (
        <p className="mt-1 text-xs text-slate-500">
          {res.upcoming.length > 0 && `${res.upcoming.length} más agendada${res.upcoming.length === 1 ? "" : "s"} a futuro. `}
          {res.no_show.length > 0 && `${res.no_show.length} inasistencia${res.no_show.length === 1 ? "" : "s"} no contada${res.no_show.length === 1 ? "" : "s"}.`}
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold">
        {res.done.length + res.upcoming.length + res.no_show.length > 0 && (
          <button type="button" onClick={() => setVerLista(!verLista)} className="text-teal-700 hover:underline">
            {verLista ? "Ocultar citas" : "Ver citas"}
          </button>
        )}
        {actionLabel && (
          <button type="button" onClick={() => onCount?.(realizadas)} className="text-teal-700 hover:underline">
            {actionLabel} ({realizadas})
          </button>
        )}
      </div>
      {verLista && (
        <ul className="mt-2 space-y-0.5 text-xs">
          {res.done.map((c) => (
            <li key={c.id}>✓ {fecha(c.date)} · {c.time} · {c.service}{c.professional ? ` · ${c.professional}` : ""}</li>
          ))}
          {res.no_show.map((c) => (
            <li key={c.id} className="text-slate-400">✗ {fecha(c.date)} · {c.time} · no asistió</li>
          ))}
          {res.upcoming.map((c) => (
            <li key={c.id} className="text-slate-500">○ {fecha(c.date)} · {c.time} · {c.service} (agendada)</li>
          ))}
        </ul>
      )}
    </div>
  );
}
