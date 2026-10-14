"use client";

import { useMemo, useState } from "react";
import { EJERCICIOS, REGIONES } from "@/lib/protocolos/ejercicios";
import type { ItemPlan, PerfilProfesional } from "@/lib/protocolos/types";
import FuentesEjercicio from "./FuentesEjercicio";
import { generarPlanPdf, nombreArchivo } from "./pdf-plan";
import type { BorradorPlan } from "./storage";

interface Props {
  plan: BorradorPlan;
  perfil: PerfilProfesional;
  onCambiar: (p: BorradorPlan) => void;
  onAgregar: (ejercicioId: string, dosis: string, fase: string) => void;
  onEditarPerfil: () => void;
  onVolver: () => void;
}

const INPUT = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none";

function hoy() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function PlanBuilder({ plan, perfil, onCambiar, onAgregar, onEditarPerfil, onVolver }: Props) {
  const [buscar, setBuscar] = useState("");
  const [region, setRegion] = useState<string>("todas");
  const [biblioteca, setBiblioteca] = useState(plan.items.length === 0);
  const [msg, setMsg] = useState("");

  const enPlan = useMemo(() => new Set(plan.items.map((i) => i.ejercicioId)), [plan.items]);
  const filtrados = useMemo(() => {
    const q = buscar.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    return EJERCICIOS.filter(
      (e) =>
        (region === "todas" || e.region === region) &&
        (!q || `${e.nombre} ${e.en} ${e.descripcion}`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(q)),
    );
  }, [buscar, region]);

  function editarItem(uid: string, cambios: Partial<ItemPlan>) {
    onCambiar({ ...plan, items: plan.items.map((i) => (i.uid === uid ? { ...i, ...cambios } : i)) });
  }
  function mover(idx: number, dir: -1 | 1) {
    const items = [...plan.items];
    const j = idx + dir;
    if (j < 0 || j >= items.length) return;
    [items[idx], items[j]] = [items[j], items[idx]];
    onCambiar({ ...plan, items });
  }
  function quitar(uid: string) {
    onCambiar({ ...plan, items: plan.items.filter((i) => i.uid !== uid) });
  }

  const perfilIncompleto = !perfil.nombre || !perfil.firma;

  function datosPdf() {
    return { paciente: plan.paciente.trim(), fecha: hoy(), protocolo: plan.protocolo, indicaciones: plan.indicaciones, items: plan.items };
  }

  function descargar() {
    const datos = datosPdf();
    generarPlanPdf(datos, perfil).save(nombreArchivo(datos));
  }

  async function compartir() {
    setMsg("");
    const datos = datosPdf();
    const doc = generarPlanPdf(datos, perfil);
    const file = new File([doc.output("blob")], nombreArchivo(datos), { type: "application/pdf" });
    if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Plan de ejercicios" });
      } catch {
        /* el usuario canceló */
      }
    } else {
      doc.save(nombreArchivo(datos));
      setMsg("Este navegador no permite compartir archivos: se descargó el PDF para que lo adjuntes por WhatsApp o correo.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <button onClick={onVolver} className="text-sm text-slate-500 hover:text-teal-700">
          ← Volver
        </button>
        {plan.items.length > 0 && (
          <button
            onClick={() => window.confirm("¿Vaciar el plan actual?") && onCambiar({ paciente: "", protocolo: "", indicaciones: "", items: [] })}
            className="text-sm text-slate-500 hover:text-red-600"
          >
            Vaciar plan
          </button>
        )}
      </div>

      <h2 className="text-2xl font-bold text-slate-900">Plan para el paciente</h2>

      {perfilIncompleto && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span>Completa tu perfil (nombre, logo y firma) para que el PDF salga firmado.</span>
          <button onClick={onEditarPerfil} className="font-semibold underline">
            Completar perfil
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="text-slate-600">Nombre del paciente</span>
          <input className={INPUT} value={plan.paciente} onChange={(e) => onCambiar({ ...plan, paciente: e.target.value })} />
        </label>
        <label className="text-sm">
          <span className="text-slate-600">Protocolo de referencia</span>
          <input className={INPUT} value={plan.protocolo} onChange={(e) => onCambiar({ ...plan, protocolo: e.target.value })} />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="text-slate-600">Indicaciones generales (frecuencia, progresión, recomendaciones)</span>
          <textarea
            rows={3}
            className={INPUT}
            value={plan.indicaciones}
            onChange={(e) => onCambiar({ ...plan, indicaciones: e.target.value })}
            placeholder="Ej.: realizar 3 veces por semana en días alternos. Control en 2 semanas."
          />
        </label>
      </div>

      {/* ── Ejercicios del plan ── */}
      <section>
        <p className="mb-2 text-sm font-semibold text-slate-900">Ejercicios ({plan.items.length})</p>
        {plan.items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            Agrega ejercicios desde un protocolo o desde la biblioteca.
          </p>
        ) : (
          <ul className="space-y-2">
            {plan.items.map((it, idx) => (
              <li key={it.uid} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">
                      {idx + 1}. {it.nombre}
                    </p>
                    {it.fase && <p className="text-xs text-teal-700">{it.fase}</p>}
                  </div>
                  <div className="flex shrink-0 gap-1 text-slate-400">
                    <button onClick={() => mover(idx, -1)} className="px-1.5 hover:text-slate-700" aria-label="Subir">
                      ↑
                    </button>
                    <button onClick={() => mover(idx, 1)} className="px-1.5 hover:text-slate-700" aria-label="Bajar">
                      ↓
                    </button>
                    <button onClick={() => quitar(it.uid)} className="px-1.5 hover:text-red-600" aria-label="Quitar">
                      ✕
                    </button>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <input className={INPUT} value={it.dosis} onChange={(e) => editarItem(it.uid, { dosis: e.target.value })} placeholder="Dosis" />
                  <input className={INPUT} value={it.notas} onChange={(e) => editarItem(it.uid, { notas: e.target.value })} placeholder="Nota para el paciente (opcional)" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Biblioteca ── */}
      <section className="rounded-2xl border border-slate-200 bg-white">
        <button onClick={() => setBiblioteca(!biblioteca)} className="flex w-full items-center justify-between px-5 py-4 text-left">
          <span className="font-semibold text-slate-900">Biblioteca de ejercicios ({EJERCICIOS.length})</span>
          <span className="text-slate-400">{biblioteca ? "−" : "+"}</span>
        </button>
        {biblioteca && (
          <div className="space-y-3 border-t border-slate-100 px-5 py-4">
            <input className={INPUT} value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Buscar ejercicio..." />
            <div className="flex flex-wrap gap-1.5">
              {[{ id: "todas", label: "Todas" }, ...REGIONES].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRegion(r.id)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    region === r.id ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <ul className="max-h-[28rem] divide-y divide-slate-100 overflow-y-auto">
              {filtrados.map((e) => (
                <li key={e.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800">{e.nombre}</p>
                    <p className="text-xs text-slate-500">
                      {e.descripcion} · {e.dosis}
                    </p>
                    <FuentesEjercicio ejercicio={e} />
                  </div>
                  <button
                    disabled={enPlan.has(e.id)}
                    onClick={() => onAgregar(e.id, e.dosis, "")}
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      enPlan.has(e.id) ? "bg-slate-100 text-slate-400" : "bg-teal-50 text-teal-700 hover:bg-teal-100"
                    }`}
                  >
                    {enPlan.has(e.id) ? "En el plan" : "+ Agregar"}
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-slate-400">
              Los enlaces de ExRx, HEP2go y Rehab Hero abren una búsqueda del ejercicio en esos sitios. Su contenido tiene derechos de sus autores y no se copia al PDF.
            </p>
          </div>
        )}
      </section>

      <div className="sticky bottom-3 flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur">
        <button
          onClick={descargar}
          disabled={plan.items.length === 0}
          className="rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-40"
        >
          Descargar PDF
        </button>
        <button
          onClick={compartir}
          disabled={plan.items.length === 0}
          className="rounded-full border border-teal-700 px-5 py-2.5 text-sm font-semibold text-teal-700 hover:bg-teal-50 disabled:opacity-40"
        >
          Compartir (WhatsApp, correo…)
        </button>
        {msg && <p className="w-full text-sm text-slate-600">{msg}</p>}
      </div>
    </div>
  );
}
