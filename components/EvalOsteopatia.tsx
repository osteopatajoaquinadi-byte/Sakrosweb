"use client";

import { useState } from "react";
import { generarMinutaLocal } from "@/lib/minuta-recetario";

/*
 * Ficha de evaluación de osteopatía — portada desde sakros-fichas.
 * Se guarda dentro de clinical_data de la sesión con `_form: "osteopatia_v2"`.
 */

export const OSTEO_FORM_ID = "osteopatia_v2";

const ORTHO_TESTS = ["Jackson", "Neri", "Compresión", "Descompresión", "Ross", "Adson", "Eden", "Wright"];
const OSTEO_TESTS = ["Klein", "Hautan", "Guillet", "Lateroflexión Sacra"];
const META_SIGNS = ["Reflujo Gastroesofágico", "Acidez", "Hinchazón", "Hígado Graso / Cirrosis / Hepatitis"];
const META_CBX = ["HTA", "Diabetes", "Fibrosis", "Autoinmune", "Tiroides", "Hepático"];
const CRANEAL_SIGNS = ["Mareo", "Vértigo", "Náuseas", "Cefaleas / Migrañas"];
const TIPOS_DOLOR = ["Nociceptivo", "Neuropático", "Nociplástico"] as const;

export const HRV_ROWS = [
  { key: "hr", label: "FC — Frecuencia cardíaca", unit: "bpm" },
  { key: "rmssd", label: "RMSSD", unit: "ms" },
  { key: "sdnn", label: "SDNN", unit: "ms" },
  { key: "lf", label: "LF — Baja frecuencia", unit: "ms²" },
  { key: "hf", label: "HF — Alta frecuencia", unit: "ms²" },
  { key: "lfhf", label: "Ratio LF/HF", unit: "" },
  { key: "pnn50", label: "pNN50", unit: "%" },
];

const RESTRICCIONES = [
  { k: "sinGluten", l: "🌾 Sin gluten", prompt: "Sin gluten" },
  { k: "sinLacteos", l: "🥛 Sin lácteos", prompt: "Sin lacteos" },
  { k: "sinMani", l: "🥜 Sin maní / cacahuete", prompt: "Sin mani" },
  { k: "sinMariscos", l: "🦐 Sin mariscos", prompt: "Sin mariscos" },
  { k: "sinHuevo", l: "🥚 Sin huevo", prompt: "Sin huevo" },
  { k: "sinSoja", l: "🌿 Sin soja", prompt: "Sin soja" },
  { k: "vegetariano", l: "🥗 Vegetariano", prompt: "Vegetariano" },
  { k: "vegano", l: "🌱 Vegano", prompt: "Vegano" },
  { k: "sinFrutosSecos", l: "🌰 Sin frutos secos", prompt: "Sin frutos secos" },
  { k: "sinCerdo", l: "🐷 Sin cerdo", prompt: "Sin cerdo" },
];

const NIVELES: Record<string, { label: string; prot: number; tdee: number; carb: number; corto: string; prompt: string }> = {
  sedF: { label: "Sedentario — Mujer (×1,2 prot)", prot: 1.2, tdee: 26, carb: 60, corto: "Sedentaria", prompt: "Mujer sedentaria" },
  sedM: { label: "Sedentario — Hombre (×1,6 prot)", prot: 1.6, tdee: 28, carb: 70, corto: "Sedentario", prompt: "Hombre sedentario" },
  activo3: { label: "Activo 3×/sem fuerza (×1,8 prot)", prot: 1.8, tdee: 32, carb: 100, corto: "Activo 3×/sem", prompt: "Activo 3x sem fuerza" },
  activo5: { label: "Activo 5×/sem fuerza (×2,0 prot)", prot: 2.0, tdee: 37, carb: 130, corto: "Activo 5×/sem", prompt: "Activo 5x sem fuerza" },
  elite: { label: "Deportista elite (×2,2 prot)", prot: 2.2, tdee: 42, carb: 160, corto: "Elite", prompt: "Deportista elite" },
};

const TEMAS = [
  "Antiinflamatorio — salmon, curcuma, berries",
  "Microbiota — fermentados, prebioticos, fibra",
  "Omega-3 — pescado azul, chia, nueces",
  "Eje intestino-cerebro — triptofano, probioticos",
  "Polifenoles — berries, oliva, te verde, jengibre",
  "Vitamina D y magnesio — pescado, semillas, hoja verde",
  "Detox hepatico — brocoli, ajo, limon, cilantro",
  "Inmunidad — zinc, selenio, vitamina C, hongos",
  "Energia mitocondrial — B12, hierro, CoQ10",
  "Consolidacion — maxima variedad de plantas",
];

export const COMIDAS_MINUTA = [
  { key: "b", label: "Desayuno", cls: "bg-amber-50 border-amber-200 text-amber-900" },
  { key: "a", label: "Almuerzo", cls: "bg-blue-50 border-blue-200 text-blue-900" },
  { key: "c", label: "Cena", cls: "bg-violet-50 border-violet-200 text-violet-900" },
  { key: "s", label: "Snack", cls: "bg-emerald-50 border-emerald-200 text-emerald-900" },
] as const;

/* eslint-disable @typescript-eslint/no-explicit-any */
type Data = Record<string, any>;

export function calcularMacros(peso: number, nivel: string, nComidas: number) {
  const n = NIVELES[nivel];
  if (!peso || !n) return null;
  const tdee = Math.round(peso * n.tdee);
  const prot = Math.round(peso * n.prot);
  const carb = n.carb;
  const fat = Math.round((tdee - prot * 4 - carb * 4) / 9);
  return {
    tdee,
    prot,
    carb,
    fat,
    fibra: Math.round(carb * 0.3),
    aguaL: Math.round((peso * 35) / 100) / 10,
    protComida: Math.round(prot / nComidas),
    carbComida: Math.round(carb / nComidas),
    fatComida: Math.round(fat / nComidas),
    protPct: Math.round(((prot * 4) / tdee) * 100),
    carbPct: Math.round(((carb * 4) / tdee) * 100),
    fatPct: Math.round(((fat * 9) / tdee) * 100),
    nivel: n,
  };
}

const input =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-700 focus:outline-none";

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h4 className="mb-3 border-b border-slate-100 pb-1.5 text-xs font-bold uppercase tracking-wider text-teal-800">
        {titulo}
      </h4>
      {children}
    </section>
  );
}

function Campo({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  );
}

export default function EvalOsteopatia({
  value,
  onChange,
  patientName,
  patientEmail,
}: {
  value: Data;
  onChange: (data: Data) => void;
  patientName?: string;
  patientEmail?: string | null;
}) {
  const d: Data = { ...value, _form: OSTEO_FORM_ID };
  const alim: Data = d.alimentacion ?? {};
  const restr: Data = alim.restricciones ?? {};
  const nComidas: number = alim.nComidas ?? 3;

  const [generando, setGenerando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [errorMinuta, setErrorMinuta] = useState("");
  const [diaVisto, setDiaVisto] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [msgEnvio, setMsgEnvio] = useState("");

  const set = (k: string, v: unknown) => onChange({ ...d, [k]: v });
  const setIn = (grupo: string, k: string, v: unknown) => onChange({ ...d, [grupo]: { ...(d[grupo] ?? {}), [k]: v } });
  const setSueno = (k: string, v: string) =>
    onChange({ ...d, anamnesis: { ...(d.anamnesis ?? {}), sueno: { ...(d.anamnesis?.sueno ?? {}), [k]: v } } });
  const setHRV = (pos: string, k: string, v: string) =>
    onChange({ ...d, hrv: { ...(d.hrv ?? {}), [pos]: { ...(d.hrv?.[pos] ?? {}), [k]: v } } });
  const setOrtho = (t: string, k: string, v: string) =>
    onChange({ ...d, testOrtho: { ...(d.testOrtho ?? {}), [t]: { ...(d.testOrtho?.[t] ?? {}), [k]: v } } });
  const setAlim = (k: string, v: unknown) => onChange({ ...d, alimentacion: { ...alim, [k]: v } });
  const setRestr = (k: string, v: unknown) =>
    onChange({ ...d, alimentacion: { ...alim, restricciones: { ...restr, [k]: v } } });

  const tipoDolor: string[] = Array.isArray(d.tipoDolor) ? d.tipoDolor : [];
  const peso = parseFloat(alim.peso || "0");
  const macros = calcularMacros(peso, alim.nivelActividad || "", nComidas);
  const minuta: Data | null = alim.minutaGenerada ?? null;
  const dias: Data[] = minuta?.d ?? [];

  async function generarMinuta() {
    if (!macros) {
      setErrorMinuta("Ingresa el peso y el nivel de actividad primero.");
      return;
    }
    setErrorMinuta("");
    setMsgEnvio("");
    setGenerando(true);
    setProgreso(0);
    setDiaVisto(0);
    const restricciones = [
      ...RESTRICCIONES.filter((r) => restr[r.k]).map((r) => r.prompt),
      ...(restr.otras ? [restr.otras] : []),
    ].join(", ");
    const config = {
      peso,
      tdee: macros.tdee,
      prot: macros.prot,
      carb: macros.carb,
      fat: macros.fat,
      lbl: macros.nivel.prompt,
      restr: restricciones,
    };
    // Base que no cambia mientras se generan los días
    const base = { ...d, alimentacion: { ...alim, minutaGenerada: null } };
    const guardar = (lista: Data[], conIA: number) =>
      onChange({
        ...base,
        alimentacion: {
          ...base.alimentacion,
          minutaGenerada: {
            e: "Plan psiconeuroinmunológico y microbiota — Low Carb adaptado",
            d: lista,
            n: `Beber ${macros.aguaL} L de agua al día. Priorizar sueño y manejo del estrés para optimizar el eje intestino-cerebro.`,
            origen: conIA ? `recetario + IA (${conIA} días)` : "recetario",
          },
        },
      });

    // 1) Recetario precargado: elige platos y calcula porciones sin usar IA
    const { dias: locales, faltantes } = generarMinutaLocal({
      temas: TEMAS,
      prot: macros.prot,
      fat: macros.fat,
      restricciones: restr,
      otras: restr.otras,
    });
    const nuevos: Data[] = locales.map((x) => x as Data | null).filter(Boolean) as Data[];
    setProgreso(Math.round(((10 - faltantes.length) / 10) * 100));
    if (faltantes.length === 0) {
      guardar(nuevos, 0);
      setGenerando(false);
      return;
    }

    // 2) Solo los días que el recetario no cubre (restricciones muy estrictas) van a la IA
    try {
      for (const i of faltantes) {
        const res = await fetch("/api/fichas/minuta", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dayNum: i,
            tema: TEMAS[i - 1],
            config,
            // Platos ya generados, para que la IA no los repita
            previos: nuevos.flatMap((dia) => ["b", "a", "c", "s"].map((k) => dia?.[k]?.n).filter(Boolean)),
          }),
        });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || !out.day) throw new Error(out.error || `No se pudo generar el día ${i}.`);
        nuevos.push(out.day);
        nuevos.sort((x, y) => (x.i ?? 0) - (y.i ?? 0));
        setProgreso(Math.round((nuevos.length / 10) * 100));
        guardar([...nuevos], faltantes.length);
      }
    } catch (err) {
      setErrorMinuta(`${(err as Error).message} Puedes intentar de nuevo.`);
    } finally {
      setGenerando(false);
    }
  }

  async function enviarMinuta() {
    if (!patientEmail) {
      setMsgEnvio("El paciente no tiene correo registrado en su ficha.");
      return;
    }
    setEnviando(true);
    setMsgEnvio("");
    try {
      const res = await fetch("/api/fichas/minuta/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: patientEmail, name: patientName, plan: minuta }),
      });
      const out = await res.json().catch(() => ({}));
      setMsgEnvio(res.ok ? `Minuta enviada a ${patientEmail}.` : out.error || "No se pudo enviar.");
    } catch {
      setMsgEnvio("Error de conexión.");
    } finally {
      setEnviando(false);
    }
  }

  const dia = dias[Math.min(diaVisto, Math.max(dias.length - 1, 0))];

  return (
    <div className="space-y-3">
      {/* Contraindicación */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 px-4 py-2.5 ${
          d.contraind ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"
        }`}
      >
        <span className={`text-sm font-bold ${d.contraind ? "text-red-700" : "text-emerald-700"}`}>
          ⚠ Contraindicación de manipulación
        </span>
        <div className="flex gap-2">
          {(["Sí", "No"] as const).map((v) => {
            const activo = (v === "Sí") === !!d.contraind;
            return (
              <button
                key={v}
                type="button"
                onClick={() => set("contraind", v === "Sí")}
                className={`rounded-md border-2 px-3 py-1 text-xs font-bold transition ${
                  activo
                    ? v === "Sí"
                      ? "border-red-600 bg-red-100 text-red-700"
                      : "border-emerald-600 bg-emerald-100 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                {v}
              </button>
            );
          })}
        </div>
      </div>

      <Seccion titulo="Motivo de consulta / objetivo del paciente">
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo label="Motivo de consulta">
            <textarea rows={3} className={input} value={d.motivo ?? ""} onChange={(e) => set("motivo", e.target.value)} placeholder="Motivo de consulta…" />
          </Campo>
          <Campo label="Objetivo del paciente">
            <textarea rows={3} className={input} value={d.objetivo ?? ""} onChange={(e) => set("objetivo", e.target.value)} placeholder="¿Qué espera lograr el paciente?" />
          </Campo>
        </div>
      </Seccion>

      <Seccion titulo="Anamnesis">
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo label="Ocupación">
            <input className={input} value={d.anamnesis?.ocupacion ?? ""} onChange={(e) => setIn("anamnesis", "ocupacion", e.target.value)} placeholder="Trabajo o actividad principal…" />
          </Campo>
          <Campo label="Actividad física">
            <input className={input} value={d.anamnesis?.actividadFisica ?? ""} onChange={(e) => setIn("anamnesis", "actividadFisica", e.target.value)} placeholder="Tipo, frecuencia, intensidad…" />
          </Campo>
          <Campo label="Enfermedades cardiovasculares o metabólicas" full>
            <input className={input} value={d.anamnesis?.enfermedades ?? ""} onChange={(e) => setIn("anamnesis", "enfermedades", e.target.value)} placeholder="HTA, diabetes, dislipidemia…" />
          </Campo>
        </div>
        <p className="mb-1 mt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Calidad de sueño</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            { k: "circadiano", t: "🌙 Ciclo circadiano", ph: "Horario de sueño, ritmo día/noche, exposición a luz…", cls: "bg-indigo-50 border-indigo-200 text-indigo-800" },
            { k: "sleepDrive", t: "😴 Sleep drive", ph: "Presión de sueño, somnolencia diurna, siesta…", cls: "bg-emerald-50 border-emerald-200 text-emerald-800" },
            { k: "ultradianos", t: "⚡ Ritmos ultradianos", ph: "Ciclos de 90 min, despertares nocturnos, fases de sueño…", cls: "bg-orange-50 border-orange-200 text-orange-800" },
          ].map((s) => (
            <div key={s.k} className={`rounded-lg border p-2.5 ${s.cls}`}>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wide">{s.t}</p>
              <textarea rows={3} className={`${input} text-xs`} value={d.anamnesis?.sueno?.[s.k] ?? ""} onChange={(e) => setSueno(s.k, e.target.value)} placeholder={s.ph} />
            </div>
          ))}
        </div>
      </Seccion>

      <Seccion titulo="Historia clínica">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { k: "tipoParto", l: "Tipo de parto" },
            { k: "traumatismos", l: "Traumatismos (TEC / latigazos)" },
            { k: "cirugias", l: "Cirugías" },
            { k: "lactancia", l: "Lactancia materna" },
            { k: "abusos", l: "Abusos emocionales / físicos", full: true },
          ].map((f) => (
            <Campo key={f.k} label={f.l} full={f.full}>
              <input className={input} value={d.histClinica?.[f.k] ?? ""} onChange={(e) => setIn("histClinica", f.k, e.target.value)} />
            </Campo>
          ))}
        </div>
      </Seccion>

      <Seccion titulo="Característica del dolor">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Tipo de dolor</p>
        <div className="mb-3 flex flex-wrap gap-2">
          {TIPOS_DOLOR.map((t) => {
            const sel = tipoDolor.includes(t);
            const cls = {
              Nociceptivo: "border-blue-500 bg-blue-50 text-blue-800",
              Neuropático: "border-violet-500 bg-violet-50 text-violet-800",
              Nociplástico: "border-amber-500 bg-amber-50 text-amber-800",
            }[t];
            return (
              <button
                key={t}
                type="button"
                onClick={() => set("tipoDolor", sel ? tipoDolor.filter((x) => x !== t) : [...tipoDolor, t])}
                className={`rounded-lg border-2 px-3.5 py-1.5 text-sm font-semibold transition ${
                  sel ? cls : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                }`}
              >
                {sel ? "✓ " : ""}
                {t}
              </button>
            );
          })}
        </div>
        <Campo label="Descripción del dolor">
          <textarea rows={3} className={input} value={d.dolor ?? ""} onChange={(e) => set("dolor", e.target.value)} placeholder="Localización, irradiación, tipo, factores agravantes/atenuantes…" />
        </Campo>
      </Seccion>

      <Seccion titulo="Evaluación HRV — variabilidad de la frecuencia cardíaca">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-teal-50 text-[11px] font-bold uppercase text-teal-800">
                <th className="px-2 py-2 text-left">Parámetro</th>
                <th className="px-2 py-2 text-center">🛌 Supino</th>
                <th className="px-2 py-2 text-center">💺 Sedente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {HRV_ROWS.map((r) => (
                <tr key={r.key}>
                  <td className="whitespace-nowrap px-2 py-1.5 font-medium text-slate-800">
                    {r.label}
                    {r.unit && <span className="ml-1 font-normal text-slate-400">({r.unit})</span>}
                  </td>
                  {["supino", "sedente"].map((pos) => (
                    <td key={pos} className="px-2 py-1 text-center">
                      <input
                        type="number"
                        step="any"
                        className={`${input} mx-auto w-24 text-center`}
                        value={d.hrv?.[pos]?.[r.key] ?? ""}
                        onChange={(e) => setHRV(pos, r.key, e.target.value)}
                        placeholder="—"
                      />
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-slate-50">
                <td className="px-2 py-1.5 align-top font-medium text-slate-800">Observaciones</td>
                {["supino", "sedente"].map((pos) => (
                  <td key={pos} className="px-2 py-1">
                    <textarea rows={2} className={`${input} text-xs`} value={d.hrv?.[pos]?.obs ?? ""} onChange={(e) => setHRV(pos, "obs", e.target.value)} placeholder="Contexto, hallazgos…" />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Seccion>

      <Seccion titulo="Test ortopédicos">
        <div className="space-y-1.5">
          <div className="hidden grid-cols-[110px_90px_1fr] gap-2 px-1 text-[10px] font-bold uppercase text-slate-400 sm:grid">
            <span>Test</span>
            <span>Resultado</span>
            <span>Observaciones</span>
          </div>
          {ORTHO_TESTS.map((t) => (
            <div key={t} className="grid grid-cols-[1fr_80px] items-center gap-2 rounded-lg bg-slate-50 p-1.5 sm:grid-cols-[110px_90px_1fr]">
              <span className="text-sm font-semibold text-slate-800">{t}</span>
              <input className={`${input} text-center`} value={d.testOrtho?.[t]?.resultado ?? ""} onChange={(e) => setOrtho(t, "resultado", e.target.value)} placeholder="+/-" />
              <input className={`${input} col-span-2 sm:col-span-1`} value={d.testOrtho?.[t]?.obs ?? ""} onChange={(e) => setOrtho(t, "obs", e.target.value)} placeholder="Observaciones…" />
            </div>
          ))}
        </div>
      </Seccion>

      <Seccion titulo="Test osteopáticos">
        <div className="grid gap-3 sm:grid-cols-2">
          {OSTEO_TESTS.map((t) => (
            <Campo key={t} label={t}>
              <input className={input} value={d.testOsteo?.[t] ?? ""} onChange={(e) => setIn("testOsteo", t, e.target.value)} placeholder="Resultado…" />
            </Campo>
          ))}
          <Campo label="Quick scanning" full>
            <input className={input} value={d.quickScanning ?? ""} onChange={(e) => set("quickScanning", e.target.value)} placeholder="Resultado quick scanning…" />
          </Campo>
        </div>
      </Seccion>

      <Seccion titulo="Característica metabólica o visceral">
        <div className="grid gap-3 sm:grid-cols-2">
          {META_SIGNS.map((s) => (
            <Campo key={s} label={s}>
              <input className={input} value={d.metaSigns?.[s] ?? ""} onChange={(e) => setIn("metaSigns", s, e.target.value)} placeholder="Resultado…" />
            </Campo>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {META_CBX.map((c) => {
            const on = !!d.metaCbx?.[c];
            return (
              <label key={c} className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-semibold ${on ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-slate-50"}`}>
                <input type="checkbox" checked={on} onChange={(e) => setIn("metaCbx", c, e.target.checked)} className="accent-amber-600" />
                {c}
              </label>
            );
          })}
        </div>
      </Seccion>

      <Seccion titulo="Traumatismos o características de origen craneal">
        <div className="grid gap-3 sm:grid-cols-2">
          {CRANEAL_SIGNS.map((s) => (
            <Campo key={s} label={s}>
              <input className={input} value={d.craneal?.[s] ?? ""} onChange={(e) => setIn("craneal", s, e.target.value)} placeholder="Describir…" />
            </Campo>
          ))}
        </div>
      </Seccion>

      <Seccion titulo="🥗 Alimentación">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Número de comidas al día</span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setAlim("nComidas", n)}
                className={`h-8 w-8 rounded-lg border-2 text-sm font-bold transition ${
                  nComidas === n ? "border-teal-700 bg-teal-700 text-white" : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { k: "comida1", l: "1ª comida" },
            { k: "comida2", l: "2ª comida" },
            { k: "comida3", l: "3ª comida" },
            { k: "snack", l: "Snack" },
          ].map((c) => (
            <Campo key={c.k} label={c.l}>
              <textarea rows={2} className={input} value={alim[c.k] ?? ""} onChange={(e) => setAlim(c.k, e.target.value)} placeholder={`Describir ${c.l.toLowerCase()}…`} />
            </Campo>
          ))}
        </div>

        {/* Calculadora */}
        <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50/50 p-4">
          <p className="mb-3 text-sm font-bold text-teal-800">📊 Calculadora de macronutrientes — Nueva pirámide alimenticia</p>
          <div className="mb-3 grid gap-3 sm:grid-cols-2">
            <Campo label="Peso corporal (kg)">
              <input type="number" min={30} max={200} className={input} value={alim.peso ?? ""} onChange={(e) => setAlim("peso", e.target.value)} placeholder="ej: 70" />
            </Campo>
            <Campo label="Nivel de actividad">
              <select className={input} value={alim.nivelActividad ?? ""} onChange={(e) => setAlim("nivelActividad", e.target.value)}>
                <option value="">Seleccionar…</option>
                {Object.entries(NIVELES).map(([k, n]) => (
                  <option key={k} value={k}>{n.label}</option>
                ))}
              </select>
            </Campo>
          </div>
          {!macros ? (
            <p className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-center text-sm text-slate-500">
              Ingresa el peso y selecciona el nivel de actividad para ver el cálculo
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[
                  { l: "Calorías estimadas", v: `${macros.tdee} kcal`, s: `${peso} kg × ${macros.nivel.tdee} — ${macros.nivel.corto}`, c: "border-red-200 bg-red-50 text-red-600" },
                  { l: "Proteínas", v: `${macros.prot} g/día`, s: `${macros.protComida} g × ${nComidas} comidas (${macros.protPct}%)`, c: "border-teal-200 bg-teal-50 text-teal-700" },
                  { l: "Hidratos low carb", v: `${macros.carb} g/día`, s: `${macros.carbPct}% calorías — máx ${macros.carbComida} g/comida`, c: "border-amber-200 bg-amber-50 text-amber-600" },
                  { l: "Grasas saludables", v: `${macros.fat} g/día`, s: `${macros.fatPct}% calorías — ${macros.fatComida} g/comida`, c: "border-emerald-200 bg-emerald-50 text-emerald-600" },
                  { l: "Fibra mínima", v: `${macros.fibra} g/día`, s: "Verduras, semillas, legumbres", c: "border-violet-200 bg-violet-50 text-violet-600" },
                  { l: "Agua", v: `${macros.aguaL} L/día`, s: "35 ml × kg corporal", c: "border-sky-200 bg-sky-50 text-sky-700" },
                ].map((m) => (
                  <div key={m.l} className={`rounded-lg border-2 p-3 text-center ${m.c}`}>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-600">{m.l}</p>
                    <p className="text-lg font-extrabold">{m.v}</p>
                    <p className="text-[10px] leading-snug text-slate-500">{m.s}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700">
                <p className="mb-1.5 font-bold">Nueva pirámide alimenticia — Low Carb</p>
                <div className="grid gap-1 sm:grid-cols-2">
                  {[
                    "Base: verduras no almidonadas (50% del plato)",
                    "Proteínas de calidad: huevo, pescado, carne magra, legumbres",
                    "Grasas buenas: oliva, palta, frutos secos, salmón",
                    "Carbohidratos solo integrales y en cantidad limitada",
                    "Fermentados: kéfir, chucrut, yogur natural",
                    "SIN: azúcar, harinas blancas, ultraprocesados, alcohol",
                  ].map((t) => (
                    <p key={t}>{t}</p>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Restricciones */}
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="mb-2.5 text-sm font-bold text-amber-900">⚠ Restricciones alimentarias — se aplican a la minuta automáticamente</p>
          <div className="mb-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {RESTRICCIONES.map((r) => {
              const on = !!restr[r.k];
              return (
                <label key={r.k} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm ${on ? "border-amber-300 bg-amber-100 font-semibold" : "border-slate-200 bg-white"}`}>
                  <input type="checkbox" checked={on} onChange={() => setRestr(r.k, !on)} className="accent-amber-600" />
                  {r.l}
                </label>
              );
            })}
          </div>
          <Campo label="Otras restricciones o alergias">
            <input className={input} value={restr.otras ?? ""} onChange={(e) => setRestr("otras", e.target.value)} placeholder="Ej: alergia al kiwi, intolerancia a la fructosa…" />
          </Campo>
        </div>

        {/* Minuta */}
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={generarMinuta}
              disabled={generando}
              className="rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
            >
              {generando ? `Generando con IA… ${progreso}%` : dias.length ? "Volver a generar minuta 10 días" : "Generar minuta 10 días"}
            </button>
            {dias.length > 0 && !generando && (
              <>
                <button
                  type="button"
                  onClick={enviarMinuta}
                  disabled={enviando}
                  className="rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
                >
                  {enviando ? "Enviando…" : "Enviar minuta al paciente"}
                </button>
                <button
                  type="button"
                  onClick={() => setAlim("minutaGenerada", null)}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Borrar
                </button>
              </>
            )}
          </div>
          {msgEnvio && <p className="mt-2 text-sm text-slate-700">{msgEnvio}</p>}
          {errorMinuta && <p className="mt-2 text-sm text-red-600">{errorMinuta}</p>}

          {generando && (
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="mb-1.5 flex justify-between text-xs text-slate-500">
                <span>Generando plan personalizado…</span>
                <span>{progreso}%</span>
              </div>
              <div className="mb-2 h-1.5 rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${progreso}%` }} />
              </div>
              <div className="flex flex-wrap gap-1">
                {TEMAS.map((t, i) => {
                  const hecho = progreso >= (i + 1) * 10;
                  const actual = progreso === i * 10;
                  return (
                    <span key={t} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${hecho ? "bg-teal-700 text-white" : actual ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-400"}`}>
                      {t.split(" — ")[0]}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {dia && <MinutaVista plan={minuta!} diaVisto={diaVisto} onDia={setDiaVisto} />}
        </div>
      </Seccion>

      <Seccion titulo="Otras observaciones clínicas">
        <textarea rows={3} className={input} value={d.otrasObs ?? ""} onChange={(e) => set("otrasObs", e.target.value)} placeholder="Otras observaciones clínicas…" />
      </Seccion>
    </div>
  );
}

/* Navegador de la minuta (se usa también en el historial) */
export function MinutaVista({ plan, diaVisto, onDia }: { plan: Data; diaVisto: number; onDia: (i: number) => void }) {
  const dias: Data[] = plan?.d ?? [];
  if (dias.length === 0) return null;
  const idx = Math.min(diaVisto, dias.length - 1);
  const dia = dias[idx];
  return (
    <div className="mt-3 space-y-3">
      {plan.e && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">🧬 {plan.e}</p>}
      <div className="flex items-center justify-between">
        <button type="button" disabled={idx === 0} onClick={() => onDia(idx - 1)} className="h-8 w-8 rounded-lg border border-slate-200 disabled:opacity-30">←</button>
        <div className="text-center">
          <p className="text-sm font-bold text-teal-800">Día {dia.i ?? idx + 1} de {dias.length}</p>
          {dia.t && <p className="text-xs font-semibold text-amber-700">{dia.t}</p>}
        </div>
        <button type="button" disabled={idx >= dias.length - 1} onClick={() => onDia(idx + 1)} className="h-8 w-8 rounded-lg border border-slate-200 disabled:opacity-30">→</button>
      </div>
      <div className="flex flex-wrap justify-center gap-1">
        {dias.map((_, i) => (
          <button key={i} type="button" onClick={() => onDia(i)} className={`h-7 w-7 rounded-full border-2 text-[11px] font-bold ${i === idx ? "border-teal-700 bg-teal-700 text-white" : "border-slate-200 text-slate-500"}`}>
            {i + 1}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {COMIDAS_MINUTA.map((cm) => {
          const c = dia[cm.key];
          if (!c?.n) return null;
          return (
            <div key={cm.key} className={`overflow-hidden rounded-lg border ${cm.cls}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 text-sm font-bold">
                <span>{cm.label} — {c.n}</span>
                <span className="text-[11px] font-semibold">P {c.p}g · HC {c.h}g · G {c.g}g · {c.k} kcal</span>
              </div>
              <div className="flex flex-wrap gap-1 bg-white px-3 py-2">
                {(c.v ?? []).map((ing: string, i: number) => (
                  <span key={i} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">{ing}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {plan.n && idx === 0 && <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">💡 {plan.n}</p>}
    </div>
  );
}

/* Resumen de solo lectura para el historial de sesiones */
export function OsteoResumen({ data }: { data: Data }) {
  const [abierto, setAbierto] = useState(false);
  const [diaVisto, setDiaVisto] = useState(0);
  const lleno = (v: unknown) => v !== undefined && v !== null && v !== "" && v !== false;
  const filas: [string, [string, string][]][] = [];
  const add = (sec: string, pares: [string, unknown][]) => {
    const ok = pares.filter(([, v]) => lleno(v)).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : v === true ? "Sí" : String(v)] as [string, string]);
    if (ok.length) filas.push([sec, ok]);
  };
  add("General", [["Contraindicación de manipulación", data.contraind ? "Sí" : ""], ["Motivo", data.motivo], ["Objetivo", data.objetivo]]);
  add("Anamnesis", [
    ["Ocupación", data.anamnesis?.ocupacion], ["Actividad física", data.anamnesis?.actividadFisica], ["Enfermedades", data.anamnesis?.enfermedades],
    ["Ciclo circadiano", data.anamnesis?.sueno?.circadiano], ["Sleep drive", data.anamnesis?.sueno?.sleepDrive], ["Ritmos ultradianos", data.anamnesis?.sueno?.ultradianos],
  ]);
  add("Historia clínica", [
    ["Tipo de parto", data.histClinica?.tipoParto], ["Traumatismos", data.histClinica?.traumatismos], ["Cirugías", data.histClinica?.cirugias],
    ["Lactancia", data.histClinica?.lactancia], ["Abusos", data.histClinica?.abusos],
  ]);
  add("Dolor", [["Tipo", data.tipoDolor], ["Descripción", data.dolor]]);
  add("Test ortopédicos", ORTHO_TESTS.map((t) => [t, [data.testOrtho?.[t]?.resultado, data.testOrtho?.[t]?.obs].filter(Boolean).join(" · ")]));
  add("Test osteopáticos", [...OSTEO_TESTS.map((t) => [t, data.testOsteo?.[t]] as [string, unknown]), ["Quick scanning", data.quickScanning]]);
  add("Metabólico / visceral", [
    ...META_SIGNS.map((s) => [s, data.metaSigns?.[s]] as [string, unknown]),
    ["Antecedentes", META_CBX.filter((c) => data.metaCbx?.[c])],
  ]);
  add("Craneal", CRANEAL_SIGNS.map((s) => [s, data.craneal?.[s]]));
  const a = data.alimentacion ?? {};
  add("Alimentación", [
    ["Comidas al día", a.nComidas], ["1ª comida", a.comida1], ["2ª comida", a.comida2], ["3ª comida", a.comida3], ["Snack", a.snack],
    ["Peso", a.peso ? `${a.peso} kg` : ""], ["Nivel", NIVELES[a.nivelActividad]?.corto],
    ["Restricciones", [...RESTRICCIONES.filter((r) => a.restricciones?.[r.k]).map((r) => r.prompt), ...(a.restricciones?.otras ? [a.restricciones.otras] : [])]],
  ]);
  add("Observaciones", [["Otras", data.otrasObs]]);
  const hayHRV = ["supino", "sedente"].some((p) => HRV_ROWS.some((r) => lleno(data.hrv?.[p]?.[r.key])) || lleno(data.hrv?.[p]?.obs));
  const total = filas.reduce((n, [, f]) => n + f.length, 0) + (hayHRV ? 1 : 0);
  if (total === 0 && !a.minutaGenerada) return null;

  return (
    <div className="mt-2">
      <button type="button" onClick={() => setAbierto(!abierto)} className="text-xs font-medium text-teal-700 hover:text-teal-900">
        {abierto ? "▾ Ocultar evaluación" : `▸ Ver evaluación de osteopatía (${total} campos${a.minutaGenerada ? " + minuta" : ""})`}
      </button>
      {abierto && (
        <div className="mt-2 space-y-3 rounded-lg bg-slate-50 p-3">
          {data.contraind && <p className="rounded-md bg-red-50 px-2 py-1 text-xs font-bold text-red-700">⚠ Contraindicación de manipulación</p>}
          {filas.map(([sec, pares]) => (
            <div key={sec}>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{sec}</p>
              {pares.map(([k, v]) => (
                <p key={k} className="text-sm"><span className="font-medium text-slate-700">{k}:</span> <span className="text-slate-600">{v}</span></p>
              ))}
            </div>
          ))}
          {hayHRV && (
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">HRV</p>
              <table className="text-xs">
                <thead><tr className="text-slate-500"><th className="pr-4 text-left font-medium" /><th className="pr-4">Supino</th><th>Sedente</th></tr></thead>
                <tbody>
                  {HRV_ROWS.filter((r) => lleno(data.hrv?.supino?.[r.key]) || lleno(data.hrv?.sedente?.[r.key])).map((r) => (
                    <tr key={r.key}><td className="pr-4 text-slate-700">{r.label}</td><td className="pr-4 text-center">{data.hrv?.supino?.[r.key] || "—"}</td><td className="text-center">{data.hrv?.sedente?.[r.key] || "—"}</td></tr>
                  ))}
                </tbody>
              </table>
              {["supino", "sedente"].map((p) => data.hrv?.[p]?.obs && <p key={p} className="mt-1 text-xs text-slate-600">Obs. {p}: {data.hrv[p].obs}</p>)}
            </div>
          )}
          {a.minutaGenerada && (
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Minuta 10 días</p>
              <MinutaVista plan={a.minutaGenerada} diaVisto={diaVisto} onDia={setDiaVisto} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
