"use client";

import { useState } from "react";
import { getEjercicio } from "@/lib/protocolos/ejercicios";
import type { ArticuloPubmed } from "@/lib/protocolos/pubmed";
import type { Certeza, Fase, Protocolo } from "@/lib/protocolos/types";
import FichaEjercicio from "./FichaEjercicio";

const CERTEZA_CLASE: Record<Certeza, string> = {
  alta: "bg-emerald-100 text-emerald-800",
  moderada: "bg-sky-100 text-sky-800",
  baja: "bg-amber-100 text-amber-800",
  "muy baja": "bg-rose-100 text-rose-800",
};

interface Props {
  protocolo: Protocolo;
  idsEnPlan: Set<string>;
  onAgregar: (ejercicioId: string, dosis: string, fase: string) => void;
  onAgregarVarios: (nuevos: { ejercicioId: string; dosis: string; fase: string }[]) => void;
  onVolver: () => void;
  onIrAlPlan: () => void;
  totalPlan: number;
}

export default function ProtocoloView({ protocolo: p, idsEnPlan, onAgregar, onAgregarVarios, onVolver, onIrAlPlan, totalPlan }: Props) {
  const [abierta, setAbierta] = useState<number | null>(0);
  const [recientes, setRecientes] = useState<ArticuloPubmed[] | null>(null);
  const [cargandoRec, setCargandoRec] = useState(false);
  const [errRec, setErrRec] = useState("");

  async function cargarRecientes() {
    setCargandoRec(true);
    setErrRec("");
    try {
      const res = await fetch(`/api/protocolos/evidencia?q=${encodeURIComponent(p.pubmed)}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Error al consultar PubMed.");
      setRecientes(d.articulos);
    } catch (e) {
      setErrRec((e as Error).message);
    } finally {
      setCargandoRec(false);
    }
  }

  function agregarFase(f: Fase) {
    onAgregarVarios(
      f.ejercicios
        .filter((e) => !idsEnPlan.has(e.id))
        .map((e) => ({ ejercicioId: e.id, dosis: e.dosis ?? getEjercicio(e.id)?.dosis ?? "", fase: f.nombre })),
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <button onClick={onVolver} className="text-sm text-slate-500 hover:text-teal-700">
          ← Volver a protocolos
        </button>
        <button onClick={onIrAlPlan} className="rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
          Ver plan ({totalPlan})
        </button>
      </div>

      <header>
        <div className="mb-2 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
            {p.area === "osteopatia" ? "Osteopatía" : "Kinesiología"}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">Evidencia revisada: {p.actualizado}</span>
          {p.origen === "ia" ? (
            <span className="rounded-full bg-violet-100 px-2.5 py-1 text-violet-800">Generado con IA · revisar antes de usar</span>
          ) : p.revisado ? (
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-800">Revisado por el equipo</span>
          ) : (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-800">Protocolo base · pendiente de revisión clínica</span>
          )}
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{p.titulo}</h2>
        <p className="mt-1 text-slate-600">{p.descripcion}</p>
      </header>

      {/* ── Resumen de evidencia ── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 font-bold text-slate-900">Qué dice la evidencia</h3>
        <ul className="space-y-3">
          {p.evidencia.map((h, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-700">
              <span className={`h-fit shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${CERTEZA_CLASE[h.certeza]}`}>
                {h.certeza}
              </span>
              <span>{h.texto}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-slate-400">
          Certeza según GRADE informada por los autores o estimada por el diseño de los estudios.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5">
          <h3 className="mb-2 font-bold text-rose-900">Banderas rojas: derivar</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-rose-900/90">
            {p.banderasRojas.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-2 font-bold text-slate-900">Escalas de seguimiento</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            {p.escalas.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </section>
      </div>

      {/* ── Fases ── */}
      <section>
        <h3 className="mb-3 font-bold text-slate-900">Protocolo por fases</h3>
        <div className="space-y-3">
          {p.fases.map((f, i) => (
            <div key={f.nombre} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <button
                onClick={() => setAbierta(abierta === i ? null : i)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50"
              >
                <div>
                  <p className="font-semibold text-slate-900">{f.nombre}</p>
                  <p className="text-sm text-teal-700">{f.semanas}</p>
                </div>
                <span className="text-slate-400">{abierta === i ? "−" : "+"}</span>
              </button>
              {abierta === i && (
                <div className="space-y-4 border-t border-slate-100 px-5 py-4">
                  <div className="grid gap-4 text-sm md:grid-cols-3">
                    <Lista titulo="Objetivos" items={f.objetivos} />
                    <Lista titulo="Precauciones" items={f.precauciones} />
                    <Lista titulo="Criterios para avanzar" items={f.criteriosAvance} />
                  </div>
                  {f.terapiaManual?.length > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-sm">
                      <p className="mb-1 font-semibold text-amber-950">Terapia manual en sesión</p>
                      <ul className="list-disc space-y-1 pl-4 text-amber-950/80">
                        {f.terapiaManual.map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ul>
                      <p className="mt-1.5 text-[11px] text-amber-900/60">Uso del profesional; no aparece en el PDF del paciente.</p>
                    </div>
                  )}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">Ejercicios sugeridos</p>
                      {f.ejercicios.length > 0 && (
                        <button onClick={() => agregarFase(f)} className="text-sm font-semibold text-teal-700 hover:underline">
                          + Agregar toda la fase
                        </button>
                      )}
                    </div>
                    <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
                      {f.ejercicios.map((e) => {
                        const ej = getEjercicio(e.id);
                        if (!ej) return null;
                        const enPlan = idsEnPlan.has(e.id);
                        return (
                          <li key={e.id} className="flex items-start justify-between gap-2 px-3 py-2.5 text-sm">
                            <FichaEjercicio ejercicio={ej} dosis={e.dosis ?? ej.dosis} />
                            <button
                              disabled={enPlan}
                              onClick={() => onAgregar(ej.id, e.dosis ?? ej.dosis, f.nombre)}
                              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                                enPlan ? "bg-slate-100 text-slate-400" : "bg-teal-50 text-teal-700 hover:bg-teal-100"
                              }`}
                            >
                              {enPlan ? "En el plan" : "+ Agregar"}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Referencias ── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 font-bold text-slate-900">Referencias</h3>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
          {p.referencias.map((r) => (
            <li key={r.pmid}>
              {r.cita}{" "}
              <a href={`https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/`} target="_blank" rel="noopener noreferrer" className="text-teal-700 hover:underline">
                PubMed
              </a>
              {r.doi && (
                <>
                  {" · "}
                  <a href={`https://doi.org/${r.doi}`} target="_blank" rel="noopener noreferrer" className="text-teal-700 hover:underline">
                    DOI
                  </a>
                </>
              )}
            </li>
          ))}
        </ol>

        <div className="mt-5 border-t border-slate-100 pt-4">
          {recientes === null ? (
            <button onClick={cargarRecientes} disabled={cargandoRec} className="text-sm font-semibold text-teal-700 hover:underline disabled:opacity-50">
              {cargandoRec ? "Consultando PubMed..." : "Ver revisiones y guías publicadas en los últimos 3 años →"}
            </button>
          ) : recientes.length === 0 ? (
            <p className="text-sm text-slate-500">No hay revisiones ni guías nuevas en PubMed para esta búsqueda.</p>
          ) : (
            <>
              <p className="mb-2 text-sm font-semibold text-slate-900">Lo más reciente en PubMed</p>
              <ul className="space-y-2 text-sm">
                {recientes.map((a) => (
                  <li key={a.pmid}>
                    <a href={`https://pubmed.ncbi.nlm.nih.gov/${a.pmid}/`} target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-teal-700">
                      {a.titulo}
                    </a>
                    <span className="text-slate-500">
                      {" "}
                      — {a.autores} {a.revista}, {a.anio}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {errRec && <p className="mt-2 text-sm text-red-600">{errRec}</p>}
        </div>
      </section>

      <p className="text-xs text-slate-400">
        Herramienta de apoyo a la decisión clínica. No reemplaza el juicio profesional ni las indicaciones del médico tratante o del cirujano.
      </p>
    </div>
  );
}

function Lista({ titulo, items }: { titulo: string; items: string[] }) {
  return (
    <div>
      <p className="mb-1 font-semibold text-slate-900">{titulo}</p>
      <ul className="list-disc space-y-1 pl-4 text-slate-600">
        {items.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </div>
  );
}
