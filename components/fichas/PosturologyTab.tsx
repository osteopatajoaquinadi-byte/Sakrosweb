"use client";

import { REFLEXES, blankPosturo, type PosturoPlan, type Reflex } from "./constants";
import SessionCard, { type SessionForCard } from "./SessionCard";

/* ── Props ── */
interface PosturologyTabProps {
  plan: PosturoPlan;
  onChange: (updated: PosturoPlan) => void;
  sessions?: SessionForCard[];
  isAdmin?: boolean;
  onNewSession?: () => void;
}

/* ── Helpers ── */
function updateField(plan: PosturoPlan, field: keyof PosturoPlan, value: string): PosturoPlan {
  return { ...plan, [field]: value };
}

function updateReflexField(
  plan: PosturoPlan,
  reflexId: string,
  field: "pje",
  value: string,
): PosturoPlan {
  return {
    ...plan,
    reflexes: {
      ...plan.reflexes,
      [reflexId]: {
        ...plan.reflexes[reflexId],
        [field]: value,
      },
    },
  };
}

function updateReflexSide(
  plan: PosturoPlan,
  reflexId: string,
  side: string,
  value: string,
): PosturoPlan {
  return {
    ...plan,
    reflexes: {
      ...plan.reflexes,
      [reflexId]: {
        ...plan.reflexes[reflexId],
        sides: {
          ...plan.reflexes[reflexId]?.sides,
          [side]: value,
        },
      },
    },
  };
}

/* ── Section heading ── */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-bold text-[#4A1A6B] mb-2 tracking-wide uppercase">
      {children}
    </h3>
  );
}

/* ── Textarea field ── */
function FieldTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <textarea
      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm
                 placeholder:text-gray-400 focus:border-[#4A1A6B]/40 focus:ring-2
                 focus:ring-[#4A1A6B]/10 focus:outline-none resize-y min-h-[80px]
                 transition-colors"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
    />
  );
}

/* ── Reflex row (desktop table) ── */
function ReflexRow({
  reflex,
  index,
  data,
  onSideChange,
  onPjeChange,
}: {
  reflex: Reflex;
  index: number;
  data: { sides: Record<string, string>; pje: string };
  onSideChange: (side: string, value: string) => void;
  onPjeChange: (value: string) => void;
}) {
  const even = index % 2 === 0;

  return (
    <tr className={even ? "bg-[#F9F7FD]" : "bg-white"}>
      <td className="px-3 py-2 text-xs font-medium whitespace-nowrap text-gray-800">
        {index + 1}. {reflex.name}
      </td>
      <td className="px-3 py-1.5 text-center">
        {reflex.sides.length === 0 ? (
          <span className="text-[11px] italic text-gray-400">&mdash;</span>
        ) : (
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {reflex.sides.map((side) => (
              <label key={side} className="inline-flex items-center gap-1">
                <span className="text-[11px] font-bold text-gray-500">{side}:</span>
                <input
                  type="text"
                  className="w-16 rounded border border-gray-200 bg-white px-1.5 py-0.5
                             text-xs text-center focus:border-[#4A1A6B]/40 focus:ring-1
                             focus:ring-[#4A1A6B]/10 focus:outline-none"
                  value={data.sides?.[side] ?? ""}
                  onChange={(e) => onSideChange(side, e.target.value)}
                  placeholder="…"
                />
              </label>
            ))}
          </div>
        )}
      </td>
      <td className="px-3 py-1.5 text-center">
        <input
          type="text"
          className="w-14 rounded border border-gray-200 bg-white px-1.5 py-0.5
                     text-xs text-center focus:border-[#4A1A6B]/40 focus:ring-1
                     focus:ring-[#4A1A6B]/10 focus:outline-none"
          value={data.pje ?? ""}
          onChange={(e) => onPjeChange(e.target.value)}
          placeholder="Pje."
        />
      </td>
    </tr>
  );
}

/* ── Reflex card (mobile) ── */
function ReflexCard({
  reflex,
  index,
  data,
  onSideChange,
  onPjeChange,
}: {
  reflex: Reflex;
  index: number;
  data: { sides: Record<string, string>; pje: string };
  onSideChange: (side: string, value: string) => void;
  onPjeChange: (value: string) => void;
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-800">
          {index + 1}. {reflex.name}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase">Pje:</span>
          <input
            type="text"
            className="w-12 rounded border border-gray-200 bg-gray-50 px-1 py-0.5
                       text-xs text-center focus:border-[#4A1A6B]/40 focus:ring-1
                       focus:ring-[#4A1A6B]/10 focus:outline-none"
            value={data.pje ?? ""}
            onChange={(e) => onPjeChange(e.target.value)}
            placeholder="—"
          />
        </div>
      </div>
      {reflex.sides.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          {reflex.sides.map((side) => (
            <label key={side} className="inline-flex items-center gap-1">
              <span className="text-[11px] font-bold text-[#4A1A6B]/70">{side}:</span>
              <input
                type="text"
                className="w-16 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5
                           text-xs focus:border-[#4A1A6B]/40 focus:ring-1
                           focus:ring-[#4A1A6B]/10 focus:outline-none"
                value={data.sides?.[side] ?? ""}
                onChange={(e) => onSideChange(side, e.target.value)}
                placeholder="…"
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PosturologyTab — Clinical posturology evaluation
   ══════════════════════════════════════════════════════════ */
export default function PosturologyTab({ plan, onChange, sessions = [], isAdmin = false, onNewSession }: PosturologyTabProps) {
  const pp = plan ?? blankPosturo();

  const handleField = (field: keyof PosturoPlan, value: string) => {
    onChange(updateField(pp, field, value));
  };

  const handleRefSide = (reflexId: string, side: string, value: string) => {
    onChange(updateReflexSide(pp, reflexId, side, value));
  };

  const handleRefPje = (reflexId: string, value: string) => {
    onChange(updateReflexField(pp, reflexId, "pje", value));
  };

  return (
    <div className="space-y-4">
      {/* ── Examen Postural Global ── */}
      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <SectionHeading>Examen Postural Global</SectionHeading>
        <FieldTextarea
          value={pp.examenGlobal ?? ""}
          onChange={(v) => handleField("examenGlobal", v)}
          placeholder="Evaluación postural global, observaciones generales…"
        />
      </section>

      {/* ── Reflejos Primitivos ── */}
      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <SectionHeading>Evaluación Reflejos Primitivos</SectionHeading>

        {/* Desktop table — hidden on small screens */}
        <div className="hidden md:block overflow-x-auto -mx-1">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-[#F3F0FF]">
                <th className="px-3 py-2 text-left text-[11px] font-bold text-[#4A1A6B] whitespace-nowrap">
                  Reflejo
                </th>
                <th className="px-3 py-2 text-center text-[11px] font-bold text-[#4A1A6B]">
                  Lateralidad
                </th>
                <th className="px-3 py-2 text-center text-[11px] font-bold text-[#4A1A6B] whitespace-nowrap">
                  Pje.
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {REFLEXES.map((r, i) => {
                const rv = pp.reflexes?.[r.id] ?? { sides: {}, pje: "" };
                return (
                  <ReflexRow
                    key={r.id}
                    reflex={r}
                    index={i}
                    data={rv}
                    onSideChange={(side, val) => handleRefSide(r.id, side, val)}
                    onPjeChange={(val) => handleRefPje(r.id, val)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards — visible only on small screens */}
        <div className="md:hidden space-y-2">
          {REFLEXES.map((r, i) => {
            const rv = pp.reflexes?.[r.id] ?? { sides: {}, pje: "" };
            return (
              <ReflexCard
                key={r.id}
                reflex={r}
                index={i}
                data={rv}
                onSideChange={(side, val) => handleRefSide(r.id, side, val)}
                onPjeChange={(val) => handleRefPje(r.id, val)}
              />
            );
          })}
        </div>
      </section>

      {/* ── Oculomotricidad ── */}
      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <SectionHeading>Oculomotricidad</SectionHeading>
        <FieldTextarea
          value={pp.oculomot ?? ""}
          onChange={(v) => handleField("oculomot", v)}
          placeholder="Seguimiento, sacádicos, convergencia, divergencia, fijación…"
        />
      </section>

      {/* ── Captores Posturales ── */}
      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <SectionHeading>Captores Posturales</SectionHeading>
        <FieldTextarea
          value={pp.captores ?? ""}
          onChange={(v) => handleField("captores", v)}
          placeholder="Podal, ocular, mandibular, cutáneo, vestibular, propioceptivo…"
        />
      </section>

      {/* ── Evaluación General ── */}
      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <SectionHeading>Evaluación General</SectionHeading>
        <FieldTextarea
          value={pp.evalGeneral ?? ""}
          onChange={(v) => handleField("evalGeneral", v)}
          placeholder="Postura global, compensaciones, programa propuesto…"
        />
      </section>

      {/* ── Sesiones ── */}
      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <SectionHeading>Sesiones</SectionHeading>
          {onNewSession && (
            <button
              type="button"
              onClick={onNewSession}
              className="text-xs font-bold text-white bg-[#4A1A6B] px-3 py-1.5 rounded-lg hover:bg-[#4A1A6B]/90 transition-colors"
            >
              + Nueva sesión
            </button>
          )}
        </div>
        {sessions.length === 0 ? (
          <div className="text-center py-7">
            <div className="text-2xl mb-2">📅</div>
            <p className="text-xs text-gray-400">Sin sesiones registradas.</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {sessions.map((s, i) => (
              <SessionCard key={s.id} session={s} isAdmin={isAdmin} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
