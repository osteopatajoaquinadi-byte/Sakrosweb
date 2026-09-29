"use client";

import { useState } from "react";
import {
  FMS_TESTS,
  SFMA_DETAIL,
  OBJECTIVES,
  blankKine,
  type KinePlan,
  type SfmaClassification,
  type BlockType,
} from "./constants";
import SessionCard, { type SessionForCard } from "./SessionCard";

/* ── Helpers ── */
const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

/* ── Props ── */
interface KinesiologyTabProps {
  plan: KinePlan;
  onChange: (updated: KinePlan) => void;
  sessions?: SessionForCard[];
  isAdmin?: boolean;
  onNewSession?: () => void;
}

/* ── Sub-tab key ── */
type SubTab = "eval" | "plan" | "sessions";

/* ── Color helpers for FMS score buttons ── */
const fmsScoreColors: Record<
  number,
  { bg: string; border: string; text: string }
> = {
  0: { bg: "bg-red-500", border: "border-red-500", text: "text-white" },
  1: { bg: "bg-yellow-400", border: "border-yellow-400", text: "text-yellow-900" },
  2: { bg: "bg-green-300", border: "border-green-300", text: "text-green-900" },
  3: { bg: "bg-green-600", border: "border-green-600", text: "text-white" },
};

/* ── Color helpers for SFMA classification ── */
const sfmaClsStyles: Record<
  string,
  { active: string; bg: string; border: string }
> = {
  FN: {
    active: "bg-emerald-100 text-emerald-800 border-emerald-400",
    bg: "bg-green-50",
    border: "border-emerald-300",
  },
  DN: {
    active: "bg-amber-100 text-amber-700 border-amber-400",
    bg: "bg-amber-50",
    border: "border-amber-300",
  },
  FP: {
    active: "bg-red-100 text-red-600 border-red-400",
    bg: "bg-red-50",
    border: "border-red-300",
  },
  DP: {
    active: "bg-rose-200 text-rose-800 border-rose-500",
    bg: "bg-rose-50",
    border: "border-rose-400",
  },
};

/* ── Pain-type pill colors ── */
const painTypeColors: Record<
  string,
  { activeBg: string; activeBorder: string; activeText: string }
> = {
  Nociceptivo: {
    activeBg: "bg-blue-100",
    activeBorder: "border-blue-500",
    activeText: "text-blue-800",
  },
  "Neuropático": {
    activeBg: "bg-violet-100",
    activeBorder: "border-violet-600",
    activeText: "text-violet-800",
  },
  "Nociplástico": {
    activeBg: "bg-amber-100",
    activeBorder: "border-amber-600",
    activeText: "text-amber-800",
  },
};

/* ── Shared input / textarea classes ── */
const inputCls =
  "w-full rounded-lg border border-[#CEC8BE] bg-white px-3 py-2 text-sm text-[#0B3D2E] placeholder:text-[#9C9687] focus:border-[#C8943A] focus:outline-none focus:ring-1 focus:ring-[#C8943A]/40 transition";
const textareaCls = `${inputCls} min-h-[72px] resize-y`;

/* ══════════════════════════════════════════════════════════════
   KinesiologyTab
   ══════════════════════════════════════════════════════════════ */
export default function KinesiologyTab({ plan, onChange, sessions = [], isAdmin = false, onNewSession }: KinesiologyTabProps) {
  const [sec, setSec] = useState<SubTab>("eval");
  const [sfmaExp, setSfmaExp] = useState<Record<string, boolean>>({});

  const kp = plan;

  /* ── Immutable-update helpers that call onChange ── */
  const setKP = <K extends keyof KinePlan>(field: K, value: KinePlan[K]) => {
    onChange({ ...kp, [field]: value });
  };

  const setFms = (
    test: string,
    field: "score" | "notes",
    value: number | null | string,
  ) => {
    onChange({
      ...kp,
      fms: {
        ...kp.fms,
        [test]: { ...kp.fms[test], [field]: value },
      },
    });
  };

  const setSfmaMain = (
    key: string,
    field: "cls" | "tipo" | "notes",
    value: SfmaClassification | string,
  ) => {
    onChange({
      ...kp,
      sfma: {
        ...kp.sfma,
        [key]: { ...kp.sfma[key], [field]: value },
      },
    });
  };

  const setSfmaSub = (
    key: string,
    sub: string,
    field: "cls" | "tipo",
    value: SfmaClassification | string,
  ) => {
    const current = kp.sfma[key];
    onChange({
      ...kp,
      sfma: {
        ...kp.sfma,
        [key]: {
          ...current,
          sub: {
            ...current.sub,
            [sub]: {
              ...(current.sub?.[sub] || { cls: null, tipo: "" }),
              [field]: value,
            },
          },
        },
      },
    });
  };

  const setBlk = (
    block: BlockType,
    field: "desc" | "obj",
    value: string,
  ) => {
    onChange({
      ...kp,
      blocks: {
        ...kp.blocks,
        [block]: { ...kp.blocks[block], [field]: value },
      },
    });
  };

  const addObj = () => {
    onChange({
      ...kp,
      objectives: [...kp.objectives, { id: uid(), text: "" }],
    });
  };

  const updObj = (id: string, text: string) => {
    onChange({
      ...kp,
      objectives: kp.objectives.map((o) => (o.id === id ? { ...o, text } : o)),
    });
  };

  const delObj = (id: string) => {
    onChange({
      ...kp,
      objectives: kp.objectives.filter((o) => o.id !== id),
    });
  };

  const toggleCheckedObjective = (objId: string) => {
    const current = kp.checkedObjectives?.[objId] || false;
    onChange({
      ...kp,
      checkedObjectives: {
        ...kp.checkedObjectives,
        [objId]: !current,
      },
    });
  };

  /* ── Computed ── */
  const fmsTotal = Object.values(kp.fms).reduce(
    (acc, v) => acc + (v.score ?? 0),
    0,
  );

  /* ── Sub-tab config ── */
  const tabs: { key: SubTab; label: string }[] = [
    { key: "eval", label: "Evaluacion" },
    { key: "plan", label: "Plan" },
    { key: "sessions", label: "Sesiones" },
  ];

  /* ── Render helpers ── */

  /** SFMA classification pill button */
  const SfmaPill = ({
    cls,
    active,
    onClick,
    small,
  }: {
    cls: string;
    active: boolean;
    onClick: () => void;
    small?: boolean;
  }) => {
    const s = sfmaClsStyles[cls];
    return (
      <button
        type="button"
        onClick={onClick}
        className={`rounded-md font-bold transition-all ${
          small ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
        } border-2 ${
          active
            ? s.active
            : "border-[#CEC8BE] bg-white text-[#9C9687]"
        }`}
      >
        {cls}
      </button>
    );
  };

  /** TPI / SMCD dysfunction-type button */
  const DysfButton = ({
    tipo,
    active,
    onClick,
    small,
  }: {
    tipo: "TPI" | "SMCD";
    active: boolean;
    onClick: () => void;
    small?: boolean;
  }) => {
    const isTPI = tipo === "TPI";
    return (
      <button
        type="button"
        onClick={onClick}
        className={`rounded-md font-bold transition-all border-2 ${
          small ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-[11px]"
        } ${
          active
            ? isTPI
              ? "border-red-600 bg-red-100 text-red-700"
              : "border-violet-600 bg-violet-100 text-violet-700"
            : "border-[#CEC8BE] bg-white text-[#9C9687]"
        }`}
      >
        {small ? tipo : tipo === "TPI" ? "TPI — Tejido" : "SMCD — Control motor"}
      </button>
    );
  };

  /* ══════════════════════════════════════════════
     RETURN
     ══════════════════════════════════════════════ */
  return (
    <div className="animate-in fade-in duration-200">
      {/* ── Sub-tab bar ── */}
      <div className="flex overflow-x-auto border-b-2 border-[#CEC8BE] mb-4 -mx-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setSec(t.key)}
            className={`shrink-0 px-5 py-2.5 text-sm font-semibold transition-colors ${
              sec === t.key
                ? "border-b-2 border-[#0B3D2E] text-[#0B3D2E]"
                : "text-[#9C9687] hover:text-[#0B3D2E]/70"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          EVALUACION TAB
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {sec === "eval" && (
        <div className="space-y-3">
          {/* ── Anamnesis Card ── */}
          <div className="rounded-xl border border-[#CEC8BE] bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-[#0B3D2E] mb-3">
              Motivo de Consulta / Objetivo del Paciente
            </h3>
            <textarea
              className={textareaCls}
              value={kp.motivo}
              onChange={(e) => setKP("motivo", e.target.value)}
              placeholder="Motivo / objetivo del paciente..."
            />

            <h3 className="text-sm font-bold text-[#0B3D2E] mt-4 mb-3">
              Anamnesis
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold text-[#9C9687] mb-1">
                  Ocupacion
                </label>
                <input
                  className={inputCls}
                  value={kp.ocupacion || ""}
                  onChange={(e) => setKP("ocupacion", e.target.value)}
                  placeholder="Trabajo o actividad principal..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#9C9687] mb-1">
                  Actividad fisica
                </label>
                <input
                  className={inputCls}
                  value={kp.actividadFisica || ""}
                  onChange={(e) => setKP("actividadFisica", e.target.value)}
                  placeholder="Tipo, frecuencia, intensidad..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#9C9687] mb-1">
                  Enfermedades cardiovasculares o metabolicas
                </label>
                <input
                  className={inputCls}
                  value={kp.enfermedades || ""}
                  onChange={(e) => setKP("enfermedades", e.target.value)}
                  placeholder="HTA, diabetes, dislipidemia..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#9C9687] mb-1">
                  Calidad de sueno
                </label>
                <input
                  className={inputCls}
                  value={kp.calidadSueno || ""}
                  onChange={(e) => setKP("calidadSueno", e.target.value)}
                  placeholder="Horas, calidad, apnea..."
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#9C9687] mb-1">
                  Otros antecedentes
                </label>
                <textarea
                  className={`${textareaCls} !min-h-[60px]`}
                  value={kp.anamnesis}
                  onChange={(e) => setKP("anamnesis", e.target.value)}
                  placeholder="Otros antecedentes relevantes..."
                />
              </div>
            </div>

            {/* ── Pain characteristics ── */}
            <h3 className="text-sm font-bold text-[#0B3D2E] mt-4 mb-3">
              Caracteristicas del Dolor
            </h3>
            <div className="mb-3">
              <label className="block text-xs font-semibold text-[#9C9687] mb-2">
                Tipo de dolor
              </label>
              <div className="flex flex-wrap gap-2">
                {(["Nociceptivo", "Neuropático", "Nociplástico"] as const).map(
                  (tipo) => {
                    const arr = Array.isArray(kp.tipoDolor)
                      ? kp.tipoDolor
                      : [];
                    const selected = arr.includes(tipo);
                    const col = painTypeColors[tipo];
                    return (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() =>
                          setKP(
                            "tipoDolor",
                            selected
                              ? arr.filter((t) => t !== tipo)
                              : [...arr, tipo],
                          )
                        }
                        className={`rounded-lg px-4 py-2 text-[13px] font-semibold border-2 transition-all ${
                          selected
                            ? `${col.activeBg} ${col.activeBorder} ${col.activeText}`
                            : "bg-white border-[#CEC8BE] text-[#9C9687]"
                        }`}
                      >
                        {selected ? "✓ " : ""}
                        {tipo}
                      </button>
                    );
                  },
                )}
              </div>
            </div>
            <label className="block text-xs font-semibold text-[#9C9687] mb-1">
              Descripcion del dolor
            </label>
            <textarea
              className={textareaCls}
              value={kp.caracteristicasDolor}
              onChange={(e) => setKP("caracteristicasDolor", e.target.value)}
              placeholder="Localizacion, irradiacion, tipo, factores agravantes/atenuantes, evolucion..."
            />

            {/* ── Musculoskeletal eval ── */}
            <h3 className="text-sm font-bold text-[#0B3D2E] mt-4 mb-3">
              Evaluacion Musculo Esqueletica / Test Ortopedicos
            </h3>
            <textarea
              className={textareaCls}
              value={kp.evalMusculo}
              onChange={(e) => setKP("evalMusculo", e.target.value)}
              placeholder="Hallazgos musculoesqueleticos, tests ortopedicos..."
            />
          </div>

          {/* ── Treatment Objectives Card ── */}
          <div className="rounded-xl border-[1.5px] border-[#C8943A]/20 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-bold text-[#0B3D2E]">
                Objetivos de tratamiento
              </span>
              <span className="text-[11px] text-[#9C9687]">
                &mdash; Marcar segun hallazgos de evaluacion
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {OBJECTIVES.map((obj) => {
                const checked = kp.checkedObjectives?.[obj.id] || false;
                return (
                  <label
                    key={obj.id}
                    className={`flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 border-[1.5px] transition-all text-xs ${
                      checked
                        ? "bg-[#C8943A]/10 border-[#C8943A] font-bold text-[#0B3D2E]"
                        : "bg-[#FAFAF8] border-[#CEC8BE] text-[#0B3D2E]/80"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCheckedObjective(obj.id)}
                      className="size-4 accent-[#C8943A] shrink-0"
                    />
                    <span>
                      {obj.icon} {obj.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* ── FMS Card ── */}
          <div className="rounded-xl border border-[#CEC8BE] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#0B3D2E]">
                FMS &mdash; Functional Movement Screen
              </h3>
              <span
                className={`rounded-full px-3 py-0.5 text-[13px] font-bold border ${
                  fmsTotal < 14
                    ? "bg-amber-50 text-amber-600 border-amber-300"
                    : "bg-emerald-50 text-emerald-600 border-emerald-300"
                }`}
              >
                {fmsTotal}/21
              </span>
            </div>

            <div className="space-y-1.5">
              {FMS_TESTS.map((t) => {
                const v = kp.fms[t];
                return (
                  <div
                    key={t}
                    className="grid grid-cols-[1fr_auto_1.2fr] gap-2 items-center rounded-lg bg-[#FAFAF8] border border-[#CEC8BE] px-3 py-2"
                  >
                    <span className="text-xs font-medium text-[#0B3D2E] truncate">
                      {t}
                    </span>
                    <div className="flex gap-1.5">
                      {([0, 1, 2, 3] as const).map((sc) => {
                        const isActive = v.score === sc;
                        const col = fmsScoreColors[sc];
                        return (
                          <button
                            key={sc}
                            type="button"
                            onClick={() => setFms(t, "score", sc)}
                            className={`size-7 rounded-full text-xs font-bold border-2 transition-all ${
                              isActive
                                ? `${col.bg} ${col.border} ${col.text}`
                                : "bg-white border-[#CEC8BE] text-[#9C9687]"
                            }`}
                          >
                            {sc}
                          </button>
                        );
                      })}
                    </div>
                    <input
                      className={`${inputCls} !text-xs`}
                      value={v.notes}
                      onChange={(e) => setFms(t, "notes", e.target.value)}
                      placeholder="Notas..."
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-[#9C9687] mb-1">
                Notas evaluacion / Valoracion manual
              </label>
              <textarea
                className={textareaCls}
                value={kp.evalNotes}
                onChange={(e) => setKP("evalNotes", e.target.value)}
                placeholder="Hallazgos de valoracion manual, restricciones osteopaticas..."
              />
            </div>
          </div>

          {/* ── SFMA Card ── */}
          <div className="rounded-xl border border-[#CEC8BE] bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-[#0B3D2E] mb-1">
              SFMA &mdash; Selective Functional Movement Assessment
            </h3>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-[11px] text-[#9C9687] mb-4">
              <span>
                <span className="inline-block rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 font-semibold mr-1">
                  FN
                </span>
                Funcional No doloroso
              </span>
              <span>
                <span className="inline-block rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 font-semibold mr-1">
                  DN
                </span>
                Disfuncional No doloroso
              </span>
              <span>
                <span className="inline-block rounded-full bg-red-100 text-red-600 px-2 py-0.5 font-semibold mr-1">
                  FP
                </span>
                Funcional Doloroso
              </span>
              <span>
                <span className="inline-block rounded-full bg-rose-200 text-rose-800 px-2 py-0.5 font-semibold mr-1">
                  DP
                </span>
                Disfuncional Doloroso
              </span>
            </div>

            <div className="space-y-3">
              {SFMA_DETAIL.map((pat) => {
                const v = kp.sfma?.[pat.key] || {
                  cls: null,
                  tipo: "",
                  notes: "",
                  sub: {},
                };
                const isDysf = v.cls === "DN" || v.cls === "DP";
                const isOpen = sfmaExp[pat.key];

                /* Dynamic border color based on classification */
                const borderColor = isDysf
                  ? "border-amber-300"
                  : v.cls === "FP"
                    ? "border-red-300"
                    : v.cls === "FN"
                      ? "border-emerald-300"
                      : "border-[#CEC8BE]";

                /* Dynamic header bg */
                const headerBg = isDysf
                  ? "bg-amber-50"
                  : v.cls === "FP"
                    ? "bg-red-50"
                    : v.cls === "FN"
                      ? "bg-green-50"
                      : "bg-[#FAFAF8]";

                return (
                  <div
                    key={pat.key}
                    className={`rounded-lg border-[1.5px] overflow-hidden ${borderColor}`}
                  >
                    {/* Pattern header */}
                    <div className={`px-3 py-2.5 ${headerBg}`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-bold text-[#0B3D2E] flex-1 min-w-[140px]">
                          {pat.name}
                        </span>
                        <div className="flex gap-1.5">
                          {(["FN", "DN", "FP", "DP"] as const).map((cls) => (
                            <SfmaPill
                              key={cls}
                              cls={cls}
                              active={v.cls === cls}
                              onClick={() =>
                                setSfmaMain(
                                  pat.key,
                                  "cls",
                                  v.cls === cls ? null : cls,
                                )
                              }
                            />
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setSfmaExp((prev) => ({
                              ...prev,
                              [pat.key]: !prev[pat.key],
                            }))
                          }
                          className="text-xs text-[#9C9687] px-2 py-0.5 hover:text-[#0B3D2E] transition-colors"
                        >
                          {isOpen ? "▲ ocultar" : "▼ sub-tests"}
                        </button>
                      </div>

                      {/* TPI / SMCD */}
                      {isDysf && (
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-[11px] font-bold text-[#9C9687]">
                            Tipo de disfuncion:
                          </span>
                          {(["TPI", "SMCD"] as const).map((t) => (
                            <DysfButton
                              key={t}
                              tipo={t}
                              active={v.tipo === t}
                              onClick={() =>
                                setSfmaMain(
                                  pat.key,
                                  "tipo",
                                  v.tipo === t ? "" : t,
                                )
                              }
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Expandable sub-tests */}
                    {isOpen && (
                      <div className="px-3 py-2.5 border-t border-[#CEC8BE] bg-white">
                        <div className="text-[11px] font-bold text-[#9C9687] uppercase tracking-wider mb-2">
                          Sub-tests
                        </div>
                        <div className="space-y-1.5">
                          {pat.subtests.map((sub) => {
                            const sv = v.sub?.[sub] || {
                              cls: null,
                              tipo: "",
                            };
                            const subDysf =
                              sv.cls === "DN" || sv.cls === "DP";

                            const subBorder = subDysf
                              ? "border-amber-300"
                              : sv.cls === "FP"
                                ? "border-red-300"
                                : sv.cls === "FN"
                                  ? "border-green-200"
                                  : "border-[#CEC8BE]";

                            const subBg = subDysf
                              ? "bg-amber-50"
                              : sv.cls === "FP"
                                ? "bg-red-50"
                                : sv.cls === "FN"
                                  ? "bg-green-50"
                                  : "bg-[#FAFAF8]";

                            return (
                              <div
                                key={sub}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg flex-wrap border ${subBorder} ${subBg}`}
                              >
                                <span className="text-xs font-medium text-[#0B3D2E] flex-1 min-w-[160px]">
                                  {sub}
                                </span>
                                <div className="flex gap-1">
                                  {(["FN", "DN", "FP", "DP"] as const).map(
                                    (cls) => (
                                      <SfmaPill
                                        key={cls}
                                        cls={cls}
                                        active={sv.cls === cls}
                                        onClick={() =>
                                          setSfmaSub(
                                            pat.key,
                                            sub,
                                            "cls",
                                            sv.cls === cls ? null : cls,
                                          )
                                        }
                                        small
                                      />
                                    ),
                                  )}
                                </div>
                                {subDysf && (
                                  <div className="flex gap-1">
                                    {(["TPI", "SMCD"] as const).map((t) => (
                                      <DysfButton
                                        key={t}
                                        tipo={t}
                                        active={sv.tipo === t}
                                        onClick={() =>
                                          setSfmaSub(
                                            pat.key,
                                            sub,
                                            "tipo",
                                            sv.tipo === t ? "" : t,
                                          )
                                        }
                                        small
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    <div className="px-3 py-2 border-t border-[#CEC8BE] bg-white">
                      <textarea
                        className={`${textareaCls} !min-h-[52px]`}
                        value={v.notes || ""}
                        onChange={(e) =>
                          setSfmaMain(pat.key, "notes", e.target.value)
                        }
                        placeholder="Observaciones, compensaciones, hallazgos clinicos..."
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PLAN CLINICO TAB
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {sec === "plan" && (
        <div className="space-y-3">
          {/* ── Clinical Objectives ── */}
          <div className="rounded-xl border border-[#CEC8BE] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#0B3D2E]">
                Objetivos clinicos
              </h3>
              <button
                type="button"
                onClick={addObj}
                className="rounded-lg bg-[#C8943A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#B07F2F] transition-colors"
              >
                + Agregar
              </button>
            </div>

            {kp.objectives.length === 0 ? (
              <div className="py-4 text-center text-xs text-[#9C9687]">
                Agrega el primer objetivo clinico del paciente.
              </div>
            ) : (
              <div className="space-y-2">
                {kp.objectives.map((o) => (
                  <div key={o.id} className="flex items-center gap-2">
                    <div className="size-2 shrink-0 rounded-full bg-[#C8943A]" />
                    <input
                      className={`${inputCls} flex-1`}
                      value={o.text}
                      onChange={(e) => updObj(o.id, e.target.value)}
                      placeholder="Ej: Mejorar rotacion interna hombro derecho..."
                    />
                    <button
                      type="button"
                      onClick={() => delObj(o.id)}
                      className="text-[#9C9687] hover:text-red-500 transition-colors text-base leading-none"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Three blocks ── */}
          {(
            [
              {
                key: "mobilization" as const,
                label: "Bloque 1 — Movilizacion articular",
                icon: "🔄",
                hint: "Tecnicas manuales, movilizacion, stretching...",
              },
              {
                key: "motorControl" as const,
                label: "Bloque 2 — Control motor",
                icon: "⚙",
                hint: "Estabilizacion, patrones de movimiento, propiocepcion...",
              },
              {
                key: "load" as const,
                label: "Bloque 3 — Carga progresiva",
                icon: "💪",
                hint: "Fuerza, resistencia, potencia. Ejercicios base...",
              },
            ] as const
          ).map((blk) => {
            /* Suggested exercises from checked objectives for this block */
            const suggestedExercises = OBJECTIVES.filter(
              (o) => o.block === blk.key && kp.checkedObjectives?.[o.id],
            ).flatMap((o) =>
              o.exercises.map((ex) => ({
                ex,
                objLabel: o.label,
                icon: o.icon,
              })),
            );

            return (
              <div
                key={blk.key}
                className="rounded-xl border border-[#CEC8BE] bg-white p-4 shadow-sm"
              >
                <h3 className="text-[13px] font-bold text-[#0B3D2E] mb-3">
                  {blk.icon} {blk.label}
                </h3>

                {/* Suggested exercises */}
                {suggestedExercises.length > 0 && (
                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-[#9C9687] mb-1.5">
                      Ejercicios sugeridos (segun objetivos marcados)
                    </label>
                    <div className="space-y-1">
                      {suggestedExercises.map(({ ex, objLabel, icon }, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 px-3 py-1.5"
                        >
                          <span className="text-xs font-medium text-[#0B3D2E]">
                            {icon} {ex}
                          </span>
                          <span className="text-[10px] text-[#9C9687] italic ml-2 shrink-0">
                            {objLabel}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#9C9687] mb-1">
                      Objetivo clinico vinculado
                    </label>
                    <select
                      className={inputCls}
                      value={kp.blocks[blk.key].obj}
                      onChange={(e) =>
                        setBlk(blk.key, "obj", e.target.value)
                      }
                    >
                      <option value="">Sin objetivo vinculado</option>
                      {kp.objectives.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.text || "(sin texto)"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#9C9687] mb-1">
                      Descripcion / Ejercicios a trabajar
                    </label>
                    <textarea
                      className={textareaCls}
                      value={kp.blocks[blk.key].desc}
                      onChange={(e) =>
                        setBlk(blk.key, "desc", e.target.value)
                      }
                      placeholder={blk.hint}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SESSIONS TAB
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {sec === "sessions" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-bold text-[#0B3D2E]">Plan 10 sesiones</div>
              <div className="text-xs text-[#9C9687]">{sessions.length}/10 realizadas</div>
            </div>
            {sessions.length < 10 && onNewSession && (
              <button
                type="button"
                onClick={onNewSession}
                className="text-xs font-bold text-white bg-[#C8943A] px-3 py-1.5 rounded-lg hover:bg-[#C8943A]/90 transition-colors"
              >
                + Registrar sesión
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div className="bg-gray-200 rounded-full h-[7px] mb-4">
            <div
              className="bg-[#C8943A] h-full rounded-full transition-all duration-400"
              style={{ width: `${(sessions.length / 10) * 100}%` }}
            />
          </div>

          {sessions.length === 0 ? (
            <div className="rounded-xl border border-[#CEC8BE] bg-white p-7 text-center shadow-sm">
              <div className="text-2xl mb-2">📅</div>
              <p className="text-xs text-[#9C9687]">Sin sesiones registradas.</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {sessions.map((s, i) => (
                <SessionCard key={s.id} session={s} isAdmin={isAdmin} index={i} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
