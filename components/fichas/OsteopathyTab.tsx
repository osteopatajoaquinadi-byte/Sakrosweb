"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ORTHO_TESTS,
  OSTEO_TESTS,
  META_SIGNS,
  META_CBX,
  CRANEAL_SIGNS,
  type OsteoPlan,
} from "./constants";

/* ── Props ── */
interface OsteopathyTabProps {
  plan: OsteoPlan;
  onChange: (updated: OsteoPlan) => void;
}

/* ── HRV parameters ── */
const HRV_PARAMS = [
  { key: "hr", label: "FC — Frecuencia cardíaca", unit: "bpm" },
  { key: "rmssd", label: "RMSSD", unit: "ms" },
  { key: "sdnn", label: "SDNN", unit: "ms" },
  { key: "lf", label: "LF — Baja frecuencia", unit: "ms²" },
  { key: "hf", label: "HF — Alta frecuencia", unit: "ms²" },
  { key: "lfhf", label: "Ratio LF/HF", unit: "" },
  { key: "pnn50", label: "pNN50", unit: "%" },
] as const;

/* ── Historia clínica fields ── */
const HIST_FIELDS = [
  { k: "tipoParto", l: "Tipo de parto" },
  { k: "traumatismos", l: "Traumatismos (TEC / Latigazos)" },
  { k: "cirugias", l: "Cirugías" },
  { k: "lactancia", l: "Lactancia materna" },
  { k: "abusos", l: "Abusos emocionales / físicos" },
] as const;

/* ── Dolor types ── */
const DOLOR_TYPES = [
  { tipo: "Nociceptivo", bg: "bg-blue-100", border: "border-blue-500", text: "text-blue-800", selectedBg: "bg-blue-100" },
  { tipo: "Neuropático", bg: "bg-violet-100", border: "border-violet-600", text: "text-violet-800", selectedBg: "bg-violet-100" },
  { tipo: "Nociplástico", bg: "bg-amber-100", border: "border-amber-600", text: "text-amber-800", selectedBg: "bg-amber-100" },
] as const;

/* ── Meal fields ── */
const MEAL_FIELDS = [
  { k: "comida1", l: "1ª Comida" },
  { k: "comida2", l: "2ª Comida" },
  { k: "comida3", l: "3ª Comida" },
  { k: "snack", l: "Snack" },
] as const;

/* ── Restriction checkboxes ── */
const RESTRICTION_ITEMS = [
  { k: "sinGluten", l: "🌾 Sin gluten" },
  { k: "sinLacteos", l: "🥛 Sin lácteos" },
  { k: "sinMani", l: "🥜 Sin maní / cacahuete" },
  { k: "sinMariscos", l: "🦐 Sin mariscos" },
  { k: "sinHuevo", l: "🥚 Sin huevo" },
  { k: "sinSoja", l: "🌿 Sin soja" },
  { k: "vegetariano", l: "🥗 Vegetariano" },
  { k: "vegano", l: "🌱 Vegano" },
  { k: "sinFrutosSecos", l: "🌰 Sin frutos secos" },
  { k: "sinCerdo", l: "🐷 Sin cerdo" },
] as const;

/* ── Macro calculator constants ── */
const MACRO_CONFIG = {
  factProt: { sedF: 1.2, sedM: 1.6, activo3: 1.8, activo5: 2.0, elite: 2.2 },
  factTDEE: { sedF: 26, sedM: 28, activo3: 32, activo5: 37, elite: 42 },
  carbFixed: { sedF: 60, sedM: 70, activo3: 100, activo5: 130, elite: 160 },
  sexLabel: { sedF: "Sedentaria", sedM: "Sedentario", activo3: "Activo 3×/sem", activo5: "Activo 5×/sem", elite: "Elite" },
} as const;

type NivelKey = keyof typeof MACRO_CONFIG.factProt;

/* ── Low-carb pyramid tips ── */
const PYRAMID_TIPS = [
  "Base: verduras no almidonadas (50% del plato)",
  "Proteinas calidad: huevo, pescado, carne magra, legumbres",
  "Grasas buenas: oliva, palta, frutos secos, salmon",
  "Carbos solo integrales y en cantidad limitada",
  "Fermentados: kefir, chucrut, yogur natural",
  "SIN: azucar, harinas blancas, ultraprocesados, alcohol",
];

/* ══════════════════════════════════════════
   Section Header
   ══════════════════════════════════════════ */
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-5 pb-1.5 border-b-2 border-[#1A4A6B]/20">
      <span className="text-sm font-bold text-[#1A4A6B] tracking-wide uppercase">
        {children}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════
   Field Label
   ══════════════════════════════════════════ */
function Lbl({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
      {children}
    </label>
  );
}

/* ══════════════════════════════════════════
   OsteopathyTab
   ══════════════════════════════════════════ */
export default function OsteopathyTab({ plan: op, onChange }: OsteopathyTabProps) {
  /* ── field setters ── */
  const setOP = useCallback(
    (field: string, value: unknown) => {
      onChange({ ...op, [field]: value });
    },
    [op, onChange],
  );

  const setAnam = useCallback(
    (field: string, value: string) => {
      onChange({
        ...op,
        anamnesis: { ...op.anamnesis, [field]: value },
      });
    },
    [op, onChange],
  );

  const setSueno = useCallback(
    (field: string, value: string) => {
      onChange({
        ...op,
        anamnesis: {
          ...op.anamnesis,
          sueno: { ...op.anamnesis.sueno, [field]: value },
        },
      });
    },
    [op, onChange],
  );

  const setHRV = useCallback(
    (pos: "supino" | "sedente", field: string, value: string) => {
      onChange({
        ...op,
        hrv: {
          ...op.hrv,
          [pos]: { ...(op.hrv?.[pos] || {}), [field]: value },
        },
      });
    },
    [op, onChange],
  );

  const setHist = useCallback(
    (field: string, value: string) => {
      onChange({
        ...op,
        histClinica: { ...op.histClinica, [field]: value },
      });
    },
    [op, onChange],
  );

  const toggleTipoDolor = useCallback(
    (tipo: string) => {
      const arr = Array.isArray(op.tipoDolor) ? op.tipoDolor : [];
      onChange({
        ...op,
        tipoDolor: arr.includes(tipo)
          ? arr.filter((t) => t !== tipo)
          : [...arr, tipo],
      });
    },
    [op, onChange],
  );

  const setOrtho = useCallback(
    (test: string, field: string, value: string) => {
      onChange({
        ...op,
        testOrtho: {
          ...op.testOrtho,
          [test]: { ...op.testOrtho[test], [field]: value },
        },
      });
    },
    [op, onChange],
  );

  const setOT = useCallback(
    (test: string, value: string) => {
      onChange({
        ...op,
        testOsteo: { ...op.testOsteo, [test]: value },
      });
    },
    [op, onChange],
  );

  const setMS = useCallback(
    (sign: string, value: string) => {
      onChange({
        ...op,
        metaSigns: { ...op.metaSigns, [sign]: value },
      });
    },
    [op, onChange],
  );

  const setMCbx = useCallback(
    (key: string, value: boolean) => {
      onChange({
        ...op,
        metaCbx: { ...op.metaCbx, [key]: value },
      });
    },
    [op, onChange],
  );

  const setCr = useCallback(
    (sign: string, value: string) => {
      onChange({
        ...op,
        craneal: { ...op.craneal, [sign]: value },
      });
    },
    [op, onChange],
  );

  const setAlim = useCallback(
    (field: string, value: unknown) => {
      onChange({
        ...op,
        alimentacion: { ...op.alimentacion, [field]: value },
      });
    },
    [op, onChange],
  );

  const setRestr = useCallback(
    (field: string, value: unknown) => {
      onChange({
        ...op,
        alimentacion: {
          ...op.alimentacion,
          restricciones: { ...op.alimentacion?.restricciones, [field]: value },
        },
      });
    },
    [op, onChange],
  );

  /* ── Macro calculator ── */
  const macroResult = useMemo(() => {
    const peso = parseFloat(String(op.alimentacion?.peso || 0));
    const nivel = (op.alimentacion?.nivelActividad || "") as NivelKey;
    const nCom = op.alimentacion?.nComidas || 3;

    if (!peso || !nivel || !MACRO_CONFIG.factProt[nivel]) return null;

    const tdee = Math.round(peso * MACRO_CONFIG.factTDEE[nivel]);
    const totalProt = Math.round(peso * MACRO_CONFIG.factProt[nivel]);
    const protKcal = totalProt * 4;
    const carbGrams = MACRO_CONFIG.carbFixed[nivel] || 80;
    const carbKcal = carbGrams * 4;
    const fatGrams = Math.round((tdee - protKcal - carbKcal) / 9);
    const fiber = Math.round(carbGrams * 0.3);
    const water = Math.round(peso * 35);
    const porComida = Math.round(totalProt / nCom);
    const carbPct = Math.round((carbKcal / tdee) * 100);
    const fatPct = Math.round(((fatGrams * 9) / tdee) * 100);
    const protPct = Math.round((protKcal / tdee) * 100);

    return {
      tdee,
      totalProt,
      carbGrams,
      fatGrams,
      fiber,
      water,
      porComida,
      carbPct,
      fatPct,
      protPct,
      nCom,
      peso,
      nivel,
      sexLabel: MACRO_CONFIG.sexLabel[nivel],
      factTDEE: MACRO_CONFIG.factTDEE[nivel],
    };
  }, [op.alimentacion?.peso, op.alimentacion?.nivelActividad, op.alimentacion?.nComidas]);

  /* ── Meal plan placeholder state ── */
  const [planError, setPlanError] = useState("");

  /* ══════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════ */
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* ── Card: main form ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5">
        {/* ── 1. Contraindicación ── */}
        <div
          className={`flex items-center justify-between p-3 rounded-lg mb-4 border-[1.5px] transition-colors ${
            op.contraind
              ? "bg-red-50 border-red-200"
              : "bg-green-50 border-green-200"
          }`}
        >
          <span
            className={`font-bold text-[13px] ${
              op.contraind ? "text-red-600" : "text-green-700"
            }`}
          >
            ⚠ Contraindicación de manipulación
          </span>
          <div className="flex gap-2">
            {(["Sí", "No"] as const).map((v) => {
              const active =
                (op.contraind && v === "Sí") || (!op.contraind && v === "No");
              const isYes = v === "Sí";
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setOP("contraind", isYes)}
                  className={`px-3 py-1 rounded-md text-xs font-bold border-2 cursor-pointer transition-all ${
                    active
                      ? isYes
                        ? "border-red-400 bg-red-100 text-red-600"
                        : "border-green-400 bg-green-100 text-green-700"
                      : "border-gray-200 bg-white text-gray-400"
                  }`}
                >
                  {v}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 2. Motivo / Objetivo ── */}
        <SectionHeader>Motivo de Consulta / Objetivo del Paciente</SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
          <div>
            <Lbl>Motivo de consulta</Lbl>
            <textarea
              className="w-full min-h-[70px] rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A6B]/30 focus:border-[#1A4A6B] transition resize-y"
              value={op.motivo}
              onChange={(e) => setOP("motivo", e.target.value)}
              placeholder="Motivo de consulta…"
            />
          </div>
          <div>
            <Lbl>Objetivo del paciente</Lbl>
            <textarea
              className="w-full min-h-[70px] rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A6B]/30 focus:border-[#1A4A6B] transition resize-y"
              value={op.objetivo || ""}
              onChange={(e) => setOP("objetivo", e.target.value)}
              placeholder="¿Qué espera lograr el paciente?"
            />
          </div>
        </div>

        {/* ── 3. Anamnesis ── */}
        <SectionHeader>Anamnesis</SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
          <div>
            <Lbl>Ocupación</Lbl>
            <input
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A6B]/30 focus:border-[#1A4A6B] transition"
              value={op.anamnesis?.ocupacion || ""}
              onChange={(e) => setAnam("ocupacion", e.target.value)}
              placeholder="Trabajo o actividad principal…"
            />
          </div>
          <div>
            <Lbl>Actividad física</Lbl>
            <input
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A6B]/30 focus:border-[#1A4A6B] transition"
              value={op.anamnesis?.actividadFisica || ""}
              onChange={(e) => setAnam("actividadFisica", e.target.value)}
              placeholder="Tipo, frecuencia, intensidad…"
            />
          </div>
          <div className="md:col-span-2">
            <Lbl>Enfermedades cardiovasculares o metabólicas</Lbl>
            <input
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A6B]/30 focus:border-[#1A4A6B] transition"
              value={op.anamnesis?.enfermedades || ""}
              onChange={(e) => setAnam("enfermedades", e.target.value)}
              placeholder="HTA, diabetes, dislipidemia…"
            />
          </div>

          {/* Sleep quality — 3 sub-sections */}
          <div className="md:col-span-2">
            <Lbl>Calidad de sueño</Lbl>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-1">
              {/* Circadiano */}
              <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                <div className="text-[11px] font-bold text-indigo-900 mb-1.5 uppercase tracking-wider">
                  🌙 Ciclo circadiano
                </div>
                <textarea
                  className="w-full min-h-[64px] rounded-md border border-indigo-100 bg-white px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 transition resize-y"
                  value={op.anamnesis?.sueno?.circadiano || ""}
                  onChange={(e) => setSueno("circadiano", e.target.value)}
                  placeholder="Horario de sueño, ritmo día/noche, exposición a luz…"
                />
              </div>
              {/* Sleep Drive */}
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="text-[11px] font-bold text-green-900 mb-1.5 uppercase tracking-wider">
                  😴 Sleep drive
                </div>
                <textarea
                  className="w-full min-h-[64px] rounded-md border border-green-100 bg-white px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-300 transition resize-y"
                  value={op.anamnesis?.sueno?.sleepDrive || ""}
                  onChange={(e) => setSueno("sleepDrive", e.target.value)}
                  placeholder="Presión de sueño, somnolencia diurna, siesta…"
                />
              </div>
              {/* Ultradianos */}
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <div className="text-[11px] font-bold text-amber-800 mb-1.5 uppercase tracking-wider">
                  ⚡ Ritmos ultradianos
                </div>
                <textarea
                  className="w-full min-h-[64px] rounded-md border border-orange-100 bg-white px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 transition resize-y"
                  value={op.anamnesis?.sueno?.ultradianos || ""}
                  onChange={(e) => setSueno("ultradianos", e.target.value)}
                  placeholder="Ciclos de 90 min, despertares nocturnos, fases de sueño…"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. Historia Clínica ── */}
        <SectionHeader>Historia Clínica</SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {HIST_FIELDS.map((f) => (
            <div
              key={f.k}
              className={f.k === "abusos" ? "md:col-span-2" : undefined}
            >
              <Lbl>{f.l}</Lbl>
              <input
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A6B]/30 focus:border-[#1A4A6B] transition"
                value={
                  op.histClinica[f.k as keyof typeof op.histClinica] || ""
                }
                onChange={(e) => setHist(f.k, e.target.value)}
              />
            </div>
          ))}
        </div>

        {/* ── 5. Dolor ── */}
        <SectionHeader>Característica del Dolor</SectionHeader>
        <div className="mb-3">
          <Lbl>Tipo de dolor</Lbl>
          <div className="flex gap-2 flex-wrap mt-1">
            {DOLOR_TYPES.map(({ tipo, bg, border, text, selectedBg }) => {
              const arr = Array.isArray(op.tipoDolor) ? op.tipoDolor : [];
              const selected = arr.includes(tipo);
              return (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => toggleTipoDolor(tipo)}
                  className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold border-2 cursor-pointer transition-all ${
                    selected
                      ? `${selectedBg} ${border} ${text}`
                      : "bg-white border-gray-200 text-gray-400"
                  }`}
                >
                  {selected ? "✓ " : ""}
                  {tipo}
                </button>
              );
            })}
          </div>
        </div>
        <Lbl>Descripción del dolor</Lbl>
        <textarea
          className="w-full min-h-[70px] rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A6B]/30 focus:border-[#1A4A6B] transition resize-y"
          value={op.dolor}
          onChange={(e) => setOP("dolor", e.target.value)}
          placeholder="Localización, irradiación, tipo, factores agravantes/atenuantes…"
        />

        {/* ── 6. HRV Table ── */}
        <SectionHeader>
          Evaluación HRV — Variabilidad de la Frecuencia Cardíaca
        </SectionHeader>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-[#1A4A6B]/10">
                <th className="px-3 py-2 text-left text-[#1A4A6B] font-bold text-[11px] whitespace-nowrap">
                  Parámetro
                </th>
                <th className="px-3 py-2 text-center text-[#1A4A6B] font-bold text-[11px]">
                  🛏️ Supino
                </th>
                <th className="px-3 py-2 text-center text-[#1A4A6B] font-bold text-[11px]">
                  💺 Sedente
                </th>
              </tr>
            </thead>
            <tbody>
              {HRV_PARAMS.map((row, i) => (
                <tr
                  key={row.key}
                  className={`border-b border-gray-100 ${
                    i % 2 === 0 ? "bg-[#FAFAF8]" : "bg-white"
                  }`}
                >
                  <td className="px-3 py-1.5 font-semibold text-gray-700 whitespace-nowrap">
                    {row.label}
                    {row.unit && (
                      <span className="text-gray-400 font-normal ml-1">
                        ({row.unit})
                      </span>
                    )}
                  </td>
                  {(["supino", "sedente"] as const).map((pos) => (
                    <td key={pos} className="px-2 py-1 text-center">
                      <input
                        type="number"
                        className="w-[90px] text-center rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1A4A6B]/30 focus:border-[#1A4A6B] transition"
                        value={
                          op.hrv?.[pos]?.[
                            row.key as keyof (typeof op.hrv)["supino"]
                          ] || ""
                        }
                        onChange={(e) => setHRV(pos, row.key, e.target.value)}
                        placeholder="—"
                      />
                    </td>
                  ))}
                </tr>
              ))}
              {/* Observaciones row */}
              <tr className="bg-blue-50/50 border-b border-gray-100">
                <td className="px-3 py-1.5 font-semibold text-gray-700 align-top">
                  Observaciones
                </td>
                {(["supino", "sedente"] as const).map((pos) => (
                  <td key={pos} className="px-2 py-1">
                    <textarea
                      className="w-full min-h-[56px] rounded-md border border-gray-200 bg-white px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1A4A6B]/30 focus:border-[#1A4A6B] transition resize-y"
                      value={op.hrv?.[pos]?.obs || ""}
                      onChange={(e) => setHRV(pos, "obs", e.target.value)}
                      placeholder="Contexto, hallazgos…"
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Card: Tests ortopédicos ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5">
        <SectionHeader>Test Ortopédicos</SectionHeader>
        {/* Column headers */}
        <div className="hidden md:grid grid-cols-[auto_1fr_2fr] gap-1.5 items-center mb-1 px-1.5">
          <span className="text-[10px] font-bold text-gray-400 min-w-[90px]">
            TEST
          </span>
          <span className="text-[10px] font-bold text-gray-400">RESULTADO</span>
          <span className="text-[10px] font-bold text-gray-400">
            OBSERVACIONES
          </span>
        </div>
        {ORTHO_TESTS.map((t) => (
          <div
            key={t}
            className="grid grid-cols-1 md:grid-cols-[auto_1fr_2fr] gap-1.5 items-center p-1.5 mb-1 rounded-md bg-[#FAFAF8] border border-gray-100"
          >
            <span className="text-xs font-semibold min-w-[90px]">{t}</span>
            <input
              className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1A4A6B]/30 focus:border-[#1A4A6B] transition"
              value={op.testOrtho[t]?.resultado || ""}
              onChange={(e) => setOrtho(t, "resultado", e.target.value)}
              placeholder="+/-"
            />
            <input
              className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1A4A6B]/30 focus:border-[#1A4A6B] transition"
              value={op.testOrtho[t]?.obs || ""}
              onChange={(e) => setOrtho(t, "obs", e.target.value)}
              placeholder="Observaciones…"
            />
          </div>
        ))}
      </div>

      {/* ── Card: Tests osteopticos ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5">
        <SectionHeader>Test Osteopáticos</SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
          {OSTEO_TESTS.map((t) => (
            <div key={t}>
              <Lbl>{t}</Lbl>
              <input
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1A4A6B]/30 focus:border-[#1A4A6B] transition"
                value={op.testOsteo[t] || ""}
                onChange={(e) => setOT(t, e.target.value)}
                placeholder="Resultado…"
              />
            </div>
          ))}
        </div>
        <Lbl>Quick Scanning</Lbl>
        <input
          className="w-full rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1A4A6B]/30 focus:border-[#1A4A6B] transition"
          value={op.quickScanning || ""}
          onChange={(e) => setOP("quickScanning", e.target.value)}
          placeholder="Resultado Quick Scanning…"
        />
      </div>

      {/* ── Card: Metabólico ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5">
        <SectionHeader>Característica Metabólica o Visceral</SectionHeader>
        {META_SIGNS.map((s) => (
          <div key={s} className="mb-2">
            <Lbl>{s}</Lbl>
            <input
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1A4A6B]/30 focus:border-[#1A4A6B] transition"
              value={op.metaSigns?.[s] || ""}
              onChange={(e) => setMS(s, e.target.value)}
              placeholder="Resultado…"
            />
          </div>
        ))}
        <div className="flex flex-wrap gap-2 mt-2">
          {META_CBX.map((c) => (
            <label
              key={c}
              className={`flex items-center gap-1.5 cursor-pointer px-2.5 py-1.5 rounded-lg border transition-colors ${
                op.metaCbx?.[c]
                  ? "bg-amber-50 border-amber-200"
                  : "bg-[#FAFAF8] border-gray-100"
              }`}
            >
              <input
                type="checkbox"
                checked={!!op.metaCbx?.[c]}
                onChange={(e) => setMCbx(c, e.target.checked)}
                className="accent-amber-500 w-3.5 h-3.5"
              />
              <span className="text-xs font-semibold">{c}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ── Card: Craneal ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5">
        <SectionHeader>
          Traumatismos o Características de Origen Craneal
        </SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {CRANEAL_SIGNS.map((s) => (
            <div key={s}>
              <Lbl>{s}</Lbl>
              <input
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1A4A6B]/30 focus:border-[#1A4A6B] transition"
                value={op.craneal?.[s] || ""}
                onChange={(e) => setCr(s, e.target.value)}
                placeholder="Describir…"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Card: Alimentación ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5">
        <SectionHeader>🥗 Alimentación</SectionHeader>

        {/* Number of meals + meal descriptions */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <Lbl>Número de comidas al día</Lbl>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setAlim("nComidas", n)}
                  className={`w-8 h-8 rounded-lg border-2 font-bold text-[13px] cursor-pointer transition-all ${
                    (op.alimentacion?.nComidas || 3) === n
                      ? "border-[#1A4A6B] bg-[#1A4A6B] text-white"
                      : "border-gray-200 bg-white text-gray-400"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MEAL_FIELDS.map((c) => (
              <div key={c.k}>
                <Lbl>{c.l}</Lbl>
                <textarea
                  className="w-full min-h-[60px] rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A6B]/30 focus:border-[#1A4A6B] transition resize-y"
                  value={
                    op.alimentacion?.[c.k as keyof typeof op.alimentacion] as string || ""
                  }
                  onChange={(e) => setAlim(c.k, e.target.value)}
                  placeholder={`Describir ${c.l.toLowerCase()}…`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Macro calculator ── */}
        <div className="bg-[#1A4A6B]/5 rounded-xl p-4 border-[1.5px] border-[#1A4A6B]/15">
          <div className="font-bold text-[#1A4A6B] text-[13px] mb-3">
            📊 Calculadora de macronutrientes — Nueva pirámide alimenticia
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <Lbl>Peso corporal (kg)</Lbl>
              <input
                type="number"
                min={30}
                max={200}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A6B]/30 focus:border-[#1A4A6B] transition"
                value={op.alimentacion?.peso || ""}
                onChange={(e) => setAlim("peso", e.target.value)}
                placeholder="ej: 70"
              />
            </div>
            <div>
              <Lbl>Nivel de actividad</Lbl>
              <select
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A6B]/30 focus:border-[#1A4A6B] transition"
                value={op.alimentacion?.nivelActividad || ""}
                onChange={(e) => setAlim("nivelActividad", e.target.value)}
              >
                <option value="">Seleccionar…</option>
                <option value="sedF">Sedentario — Mujer (×1,2 prot)</option>
                <option value="sedM">Sedentario — Hombre (×1,6 prot)</option>
                <option value="activo3">Activo 3×/sem fuerza (×1,8 prot)</option>
                <option value="activo5">Activo 5×/sem fuerza (×2,0 prot)</option>
                <option value="elite">Deportista elite (×2,2 prot)</option>
              </select>
            </div>
          </div>

          {/* Macro results or placeholder */}
          {!macroResult ? (
            <div className="p-3 rounded-lg bg-white border border-gray-100 text-gray-400 text-[13px] text-center">
              Ingresa el peso y selecciona el nivel de actividad para ver el
              cálculo
            </div>
          ) : (
            <div>
              {/* Macro cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {[
                  {
                    label: "Calorias estimadas",
                    value: `${macroResult.tdee} kcal`,
                    sub: `${macroResult.peso}kg x ${macroResult.factTDEE} — ${macroResult.sexLabel}`,
                    colorClasses: "bg-red-50 border-red-200 text-red-600",
                  },
                  {
                    label: "Proteinas",
                    value: `${macroResult.totalProt} g/dia`,
                    sub: `${macroResult.porComida}g x ${macroResult.nCom} comidas (${macroResult.protPct}%)`,
                    colorClasses:
                      "bg-[#1A4A6B]/10 border-[#1A4A6B]/25 text-[#1A4A6B]",
                  },
                  {
                    label: "Hidratos LOW CARB",
                    value: `${macroResult.carbGrams} g/dia`,
                    sub: `${macroResult.carbPct}% calorias — max ${Math.round(macroResult.carbGrams / macroResult.nCom)}g/comida`,
                    colorClasses: "bg-amber-50 border-amber-200 text-amber-600",
                  },
                  {
                    label: "Grasas saludables",
                    value: `${macroResult.fatGrams} g/dia`,
                    sub: `${macroResult.fatPct}% calorias — ${Math.round(macroResult.fatGrams / macroResult.nCom)}g/comida`,
                    colorClasses: "bg-green-50 border-green-200 text-green-600",
                  },
                  {
                    label: "Fibra minima",
                    value: `${macroResult.fiber} g/dia`,
                    sub: "Verduras, semillas, legumbres",
                    colorClasses:
                      "bg-violet-50 border-violet-200 text-violet-600",
                  },
                  {
                    label: "Agua",
                    value: `${Math.round(macroResult.water / 100) / 10}L/dia`,
                    sub: "35ml x kg corporal",
                    colorClasses: "bg-blue-50 border-blue-200 text-blue-600",
                  },
                ].map((m) => (
                  <div
                    key={m.label}
                    className={`rounded-lg p-3 border-[1.5px] text-center ${m.colorClasses}`}
                  >
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      {m.label}
                    </div>
                    <div className="text-xl font-extrabold mb-0.5">
                      {m.value}
                    </div>
                    <div className="text-[10px] text-gray-500 leading-snug">
                      {m.sub}
                    </div>
                  </div>
                ))}
              </div>
              {/* Pyramid tips */}
              <div className="bg-white rounded-lg p-3 border border-gray-100 text-[11px] text-gray-400">
                <div className="font-bold text-gray-700 mb-1.5 text-xs">
                  Nueva piramide alimenticia — Low Carb
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  {PYRAMID_TIPS.map((tip) => (
                    <div key={tip} className="text-[11px] text-gray-700">
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Restricciones alimentarias ── */}
        <div className="mt-4 p-4 bg-amber-50 rounded-xl border-[1.5px] border-amber-200">
          <div className="font-bold text-amber-800 text-[13px] mb-3">
            ⚠ Restricciones alimentarias — se aplican a la minuta
            automáticamente
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
            {RESTRICTION_ITEMS.map((r) => {
              const checked =
                op.alimentacion?.restricciones?.[
                  r.k as keyof typeof op.alimentacion.restricciones
                ] || false;
              return (
                <label
                  key={r.k}
                  className={`flex items-center gap-2 cursor-pointer px-2.5 py-1.5 rounded-lg border transition-colors ${
                    checked
                      ? "bg-amber-100 border-amber-300"
                      : "bg-[#FAFAF8] border-gray-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!checked}
                    onChange={() => setRestr(r.k, !checked)}
                    className="accent-amber-600 w-3.5 h-3.5"
                  />
                  <span
                    className={`text-xs ${checked ? "font-semibold" : "font-normal"}`}
                  >
                    {r.l}
                  </span>
                </label>
              );
            })}
          </div>
          <Lbl>Otras restricciones o alergias</Lbl>
          <input
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition"
            value={op.alimentacion?.restricciones?.otras || ""}
            onChange={(e) => setRestr("otras", e.target.value)}
            placeholder="Ej: alergia al kiwi, intolerancia a la fructosa…"
          />
        </div>

        {/* ── Generar Minuta IA (placeholder) ── */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              const peso = parseFloat(String(op.alimentacion?.peso || 0));
              const nivel = op.alimentacion?.nivelActividad || "";
              if (!peso || !nivel) {
                setPlanError(
                  "Ingresa el peso y nivel de actividad primero.",
                );
                return;
              }
              setPlanError("");
              // Placeholder: full generation logic to be implemented
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm cursor-pointer transition-all bg-[#C8943A] hover:bg-[#B17F2E] text-white shadow-sm"
          >
            🤖 Generar Minuta IA
          </button>
          {planError && (
            <div className="text-red-500 text-xs mt-2">{planError}</div>
          )}
        </div>
      </div>

      {/* ── Card: Otras observaciones ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5">
        <Lbl>Otras observaciones clínicas</Lbl>
        <textarea
          className="w-full min-h-[70px] rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A6B]/30 focus:border-[#1A4A6B] transition resize-y"
          value={op.otrasObs || ""}
          onChange={(e) => setOP("otrasObs", e.target.value)}
          placeholder="Otras observaciones clínicas…"
        />
      </div>
    </div>
  );
}
