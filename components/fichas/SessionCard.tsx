"use client";

import { useState } from "react";
import { userName, fmtCLP } from "./constants";

/* ── Types ── */
export type SessionForCard = {
  id: string;
  sessionNum?: number;
  date: string;
  vas: number | null;
  professionalId?: string;
  professional?: string;
  service?: string;
  service_type?: string;
  comparison?: string;
  clinicalNotes?: string;
  notes?: string;
  blocks?: Record<string, { content?: string; exercises?: string }>;
  clinical_data?: Record<string, unknown> | null;
  osteoNotes?: string;
  posturoNotes?: string;
  feedback?: string;
  payment?: { paid?: boolean; amount?: number; method?: string };
  eva_score?: number | null;
  session_date?: string;
};

/* ── Badge ── */
function Badge({ color, children }: { color: "green" | "red"; children: React.ReactNode }) {
  const cls =
    color === "green"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200";
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${cls}`}>
      {children}
    </span>
  );
}

/* ── SessionCard ── */
export default function SessionCard({
  session,
  isAdmin,
  index,
}: {
  session: SessionForCard;
  isAdmin: boolean;
  index?: number;
}) {
  const [open, setOpen] = useState(false);

  // Normalize fields (support both original shape and DB shape)
  const date = session.date || session.session_date || "";
  const vas = session.vas ?? session.eva_score ?? null;
  const profId = session.professionalId || session.professional || "";
  const profName = userName(profId);
  const service = session.service || session.service_type || "";
  const isKine = service === "kinesiology" || service === "Kinesiología";
  const notes = session.clinicalNotes || session.notes || "";
  const comparison = session.comparison || (session.clinical_data?.comparison as string) || "";
  const feedback = session.feedback || (session.clinical_data?.feedback as string) || "";
  const osteoNotes = session.osteoNotes || (session.clinical_data?.osteoNotes as string) || "";
  const posturoNotes = session.posturoNotes || (session.clinical_data?.posturoNotes as string) || "";
  const blocks = session.blocks || (session.clinical_data?.blocks as Record<string, { content?: string; exercises?: string }>) || {};

  const num = session.sessionNum ?? (index != null ? index + 1 : null);
  const fmtDate = date
    ? new Date(date + (date.length === 10 ? "T12:00:00" : "")).toLocaleDateString("es-CL")
    : "—";

  // EVA color
  const evaColor =
    vas !== null
      ? vas <= 3
        ? "bg-green-100 text-green-800"
        : vas <= 6
          ? "bg-amber-100 text-amber-800"
          : "bg-red-100 text-red-800"
      : "";

  return (
    <div className="rounded-xl border border-gray-100 bg-[#FAFAF8] overflow-hidden shadow-sm">
      {/* Header — clickable */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 cursor-pointer text-left"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] font-bold text-[#0B3D2E]">
            {num != null ? `Sesión #${num} — ` : ""}
            {fmtDate}
          </span>
          {vas !== null && (
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${evaColor}`}>
              EVA {vas}
            </span>
          )}
          <span className="text-[11px] text-gray-500">{profName}</span>
          {isAdmin && session.payment?.paid && (
            <Badge color="green">
              ✓ {fmtCLP(Number(session.payment.amount || 0))}
              {session.payment.method ? ` · ${session.payment.method}` : ""}
            </Badge>
          )}
          {isAdmin && session.payment && !session.payment.paid && (
            <Badge color="red">Sin pago</Badge>
          )}
        </div>
        <span className="text-gray-400 text-[13px] shrink-0">{open ? "▲" : "▼"}</span>
      </button>

      {/* Expandable detail */}
      {open && (
        <div className="px-3.5 pb-3.5 border-t border-gray-100 animate-[fadeSlide_0.15s_ease-out]">
          {/* Comparison */}
          {comparison && (
            <div className="mt-2.5 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs">
              <strong className="text-blue-800">vs anterior: </strong>
              <span className="text-blue-700">{comparison}</span>
            </div>
          )}

          {/* Clinical notes */}
          {notes && (
            <div className="mt-2">
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-0.5">
                Notas clínicas
              </span>
              <p className="text-xs text-gray-700">{notes}</p>
            </div>
          )}

          {/* Kine blocks */}
          {isKine && (
            <div className="mt-2 grid gap-1.5">
              {[
                { k: "mobilization", l: "🔄 Movilización" },
                { k: "motorControl", l: "⚙ Control motor" },
                { k: "load", l: "💪 Carga" },
              ].map((b) => {
                const v = blocks[b.k];
                if (!v?.content && !v?.exercises) return null;
                return (
                  <div
                    key={b.k}
                    className="px-2.5 py-1.5 bg-[#FAFAF8] rounded-lg border border-gray-100 text-xs"
                  >
                    <strong className="text-[#0B3D2E]">{b.l}: </strong>
                    {v.content}{" "}
                    {v.exercises && <span className="text-gray-500">· {v.exercises}</span>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Osteo / posturo notes */}
          {(osteoNotes || posturoNotes) && (
            <p className="mt-2 text-xs text-gray-700">{osteoNotes || posturoNotes}</p>
          )}

          {/* Feedback */}
          {feedback && (
            <div className="mt-2">
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-0.5">
                Feedback
              </span>
              <p className="text-xs text-gray-500 italic">&ldquo;{feedback}&rdquo;</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
