"use client";

import { useState, useMemo } from "react";
import { EXERCISE_BANK, EXERCISE_CATEGORIES, type Exercise } from "./constants";

/* ── Category metadata ── */

const CATEGORY_META: Record<string, { icon: string; color: string }> = {
  respiracion:    { icon: "💨", color: "bg-blue-100 text-blue-700" },
  mov_cadera:     { icon: "🔄", color: "bg-green-100 text-green-700" },
  mov_tobillo:    { icon: "🔄", color: "bg-green-100 text-green-700" },
  mov_tspine:     { icon: "🔄", color: "bg-green-100 text-green-700" },
  ctrl_cervical:  { icon: "🔵", color: "bg-purple-100 text-purple-700" },
  ctrl_suelo:     { icon: "⚙️", color: "bg-yellow-100 text-yellow-700" },
  ctrl_estab:     { icon: "⚙️", color: "bg-yellow-100 text-yellow-700" },
  fuerza_bisagra: { icon: "💪", color: "bg-red-100 text-red-700" },
  fuerza_lunge:   { icon: "💪", color: "bg-red-100 text-red-700" },
  potencia:       { icon: "⚡",       color: "bg-gray-100 text-gray-700" },
};

const ALL_CATS = [
  { id: "all" as const, label: "Todos", icon: "📋" },
  ...EXERCISE_CATEGORIES.map((c) => ({
    id: c.id,
    label: c.label,
    icon: CATEGORY_META[c.id]?.icon ?? "💪",
  })),
];

function catLabel(id: string): string {
  return EXERCISE_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

function catIcon(id: string): string {
  return CATEGORY_META[id]?.icon ?? "💪";
}

function catBadgeClass(id: string): string {
  return CATEGORY_META[id]?.color ?? "bg-gray-100 text-gray-700";
}

/* ── Per-category exercise counts (static) ── */
const CAT_COUNTS: Record<string, number> = {};
for (const ex of EXERCISE_BANK) {
  CAT_COUNTS[ex.cat] = (CAT_COUNTS[ex.cat] ?? 0) + 1;
}

/* ── Component ── */

interface ExerciseBankProps {
  onBack?: () => void;
}

export default function ExerciseBank({ onBack }: ExerciseBankProps) {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return EXERCISE_BANK.filter((ex) => {
      const matchCat = activeCat === "all" || ex.cat === activeCat;
      const matchSearch =
        !q ||
        ex.name.toLowerCase().includes(q) ||
        ex.desc.toLowerCase().includes(q) ||
        ex.equip.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [search, activeCat]);

  function toggleCategory(id: string) {
    setActiveCat((prev) => (prev === id ? "all" : id));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <header className="bg-[#0B3D2E] px-5 py-3 flex items-center gap-3 shadow-md">
        {onBack && (
          <button
            onClick={onBack}
            className="shrink-0 rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20 transition-colors"
          >
            &larr; Volver
          </button>
        )}
        <div>
          <h1 className="text-white font-extrabold text-base leading-tight">
            Banco de Ejercicios
          </h1>
          <p className="text-white/60 text-[11px]">
            {EXERCISE_BANK.length} ejercicios &middot; Functional Movement
            Systems
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[1000px] px-4 py-5 sm:px-5">
        {/* ── Search ── */}
        <div className="mb-3.5">
          <input
            type="text"
            placeholder="Buscar ejercicio o equipamiento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-[360px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#0B3D2E] focus:ring-1 focus:ring-[#0B3D2E]/30 transition-colors"
          />
        </div>

        {/* ── Category filter pills ── */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {ALL_CATS.map((c) => (
            <button
              key={c.id}
              onClick={() => toggleCategory(c.id)}
              className={`
                rounded-full px-3 py-1.5 text-xs font-semibold transition-all shadow-sm cursor-pointer
                ${
                  activeCat === c.id
                    ? "bg-[#0B3D2E] text-white"
                    : "bg-white text-gray-500 hover:bg-gray-100"
                }
              `}
            >
              {c.icon} {c.label}
              {c.id !== "all" && (
                <span className="ml-1 text-[10px] opacity-70">
                  ({CAT_COUNTS[c.id] ?? 0})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Results count ── */}
        <p className="text-xs text-gray-400 mb-3">
          {filtered.length} ejercicio{filtered.length !== 1 ? "s" : ""}
          {activeCat !== "all" ? ` en ${catLabel(activeCat)}` : ""}
          {search ? ` que coinciden con "${search}"` : ""}
        </p>

        {/* ── Exercise cards ── */}
        <div className="grid gap-2">
          {filtered.map((ex) => {
            const isOpen = expandedId === ex.id;
            return (
              <div
                key={ex.id}
                className={`
                  rounded-xl bg-white shadow-sm overflow-hidden transition-colors
                  ${isOpen ? "border border-[#C8943A]" : "border border-gray-100"}
                `}
              >
                {/* Card header (collapsed row) */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isOpen ? null : ex.id)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Category icon circle */}
                    <span className="shrink-0 w-9 h-9 rounded-lg bg-[#0B3D2E]/[0.07] flex items-center justify-center text-base">
                      {catIcon(ex.cat)}
                    </span>

                    <div className="min-w-0">
                      <span className="block text-[13px] font-bold text-gray-800 truncate">
                        {ex.name}
                      </span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${catBadgeClass(ex.cat)}`}
                        >
                          {catLabel(ex.cat)}
                        </span>
                        {ex.equip && (
                          <span className="text-[11px] text-gray-400">
                            {ex.equip}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <span className="shrink-0 text-xs text-gray-400">
                    {isOpen ? "▲" : "▼"}
                  </span>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-gray-100 px-4 pb-4 pt-3.5 animate-[fadeSlide_0.2s_ease-out]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Objetivo */}
                      <div className="sm:col-span-2">
                        <Label>Objetivo</Label>
                        <p className="text-[13px] text-gray-800 font-medium">
                          {ex.desc}
                        </p>
                      </div>

                      {/* Ejecucion */}
                      <div className="sm:col-span-2">
                        <Label>Ejecucion</Label>
                        <div className="text-[13px] text-gray-800 leading-relaxed p-2.5 bg-[#FAFAF8] rounded-lg border border-gray-100">
                          {ex.exec}
                        </div>
                      </div>

                      {/* Series / Reps */}
                      <div>
                        <Label>Series / Reps sugeridas</Label>
                        <div className="text-[13px] font-semibold text-[#0B3D2E] px-3 py-1.5 bg-[#0B3D2E]/[0.04] rounded-lg border border-[#0B3D2E]/10">
                          {ex.reps}
                        </div>
                      </div>

                      {/* Equipamiento */}
                      <div>
                        <Label>Equipamiento</Label>
                        <div className="text-[13px] font-medium text-gray-800 px-3 py-1.5 bg-[#F8F5EF] rounded-lg border border-gray-100">
                          {ex.equip || "Sin equipamiento"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Empty state ── */}
        {filtered.length === 0 && (
          <div className="mt-4 rounded-xl bg-white border border-gray-100 shadow-sm text-center py-10 px-4">
            <div className="text-3xl mb-2">{"🔍"}</div>
            <p className="text-sm text-gray-400">
              No se encontraron ejercicios
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Tiny helper ── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">
      {children}
    </span>
  );
}
