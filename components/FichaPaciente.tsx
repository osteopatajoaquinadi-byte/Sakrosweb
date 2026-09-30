"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import KinesiologyTab from "./fichas/KinesiologyTab";
import OsteopathyTab from "./fichas/OsteopathyTab";
import PosturologyTab from "./fichas/PosturologyTab";
import {
  type KinePlan,
  type OsteoPlan,
  type PosturoPlan,
  type ClinicalPlans,
  blankKine,
  blankOsteo,
  blankPosturo,
  RED_FLAGS,
  YELLOW_FLAGS,
  OBJECTIVES,
  PACKS,
  PAYMENT_METHODS,
  PAYMENT_TYPES,
  SERVICE_TYPES,
  PROFESSIONALS,
  USERS,
  fmtCLP,
} from "./fichas/constants";

/* ══════════════════════════════════════════════════════════
   Types
   ══════════════════════════════════════════════════════════ */

type ClinicalPlansExt = ClinicalPlans & {
  services?: string[];
  flagNotes?: string;
};

type Patient = {
  id: string;
  rut: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  date_of_birth: string | null;
  occupation: string | null;
  sport: string | null;
  reason: string | null;
  sex: string | null;
  address: string | null;
  red_flags: string[] | null;
  yellow_flags: string[] | null;
  notes: string | null;
  clinical_plans: ClinicalPlansExt | null;
  created_at: string;
};

type Session = {
  id: string;
  professional: string;
  service_type: string;
  session_date: string;
  eva_score: number | null;
  notes: string | null;
  clinical_data: Record<string, unknown> | null;
  created_at: string;
};

type Payment = {
  id: string;
  amount: number;
  method: string;
  payment_type: string;
  pack_name: string | null;
  sessions_purchased: number;
  service_type: string | null;
  reference: string | null;
  notes: string | null;
  registered_by: string;
  created_at: string;
};

type Balance = {
  patient_id: string;
  patient_name: string;
  total_remaining: number;
  balance_detail: { service_type: string; remaining: number }[] | null;
};

type TabId = "profile" | "kinesiology" | "osteopathy" | "posturology" | "history" | "payments";

/* ── Service mapping ── */
const SVC_MAP: Record<string, string> = {
  kinesiology: "Kinesiología",
  osteopathy: "Osteopatía",
  posturology: "Posturología Clínica",
};
const SVC_MAP_REV: Record<string, string> = Object.fromEntries(
  Object.entries(SVC_MAP).map(([k, v]) => [v, k])
);

function svcColor(svc: string): string {
  if (svc === "kinesiology" || svc === "Kinesiología") return "bg-blue-100 text-blue-800";
  if (svc === "osteopathy" || svc === "Osteopatía") return "bg-green-100 text-green-800";
  return "bg-purple-100 text-purple-800";
}

/* ══════════════════════════════════════════════════════════
   BalanceBanner
   ══════════════════════════════════════════════════════════ */

function BalanceBanner({ balance }: { balance: Balance | null }) {
  if (!balance) return null;
  const r = balance.total_remaining;
  const bg = r <= 0 ? "bg-red-50 border-red-200" : r <= 1 ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200";
  const color = r <= 0 ? "text-red-800" : r <= 1 ? "text-amber-800" : "text-green-800";
  const icon = r <= 0 ? "⚠️" : r <= 1 ? "⚡" : "✓";
  const text =
    r <= 0
      ? "Sin sesiones disponibles — pago pendiente"
      : r === 1
        ? "Última sesión — debe renovar"
        : `${r} sesiones disponibles`;
  const details = balance.balance_detail ?? [];
  return (
    <div className={`flex flex-wrap items-center gap-2.5 rounded-xl border p-3 mb-4 ${bg}`}>
      <span className="text-lg">{icon}</span>
      <span className={`text-[13px] font-bold ${color}`}>{text}</span>
      {details.map((d, i) => (
        <span key={i} className={`text-[11px] ${color} bg-white/50 rounded-md px-2 py-0.5`}>
          {d.service_type}: {d.remaining}
        </span>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ProfileTab
   ══════════════════════════════════════════════════════════ */

function ProfileTab({
  patient,
  plans,
  sessions,
  onSavePatient,
  onToggleService,
  onUpdatePlans,
}: {
  patient: Patient;
  plans: ClinicalPlansExt;
  sessions: Session[];
  onSavePatient: (data: Record<string, unknown>) => Promise<void>;
  onToggleService: (svc: string) => void;
  onUpdatePlans: (p: ClinicalPlansExt) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: patient.name || "",
    rut: patient.rut || "",
    phone: patient.phone || "",
    email: patient.email || "",
    date_of_birth: patient.date_of_birth || "",
    occupation: patient.occupation || "",
    sport: patient.sport || "",
    sex: patient.sex || "",
    address: patient.address || "",
    reason: patient.reason || "",
    notes: patient.notes || "",
  });
  const [saving, setSaving] = useState(false);

  const svcs = plans.services ?? [];
  const redArr = patient.red_flags ?? [];
  const yellowArr = patient.yellow_flags ?? [];

  const handleSave = async () => {
    setSaving(true);
    await onSavePatient(form);
    setSaving(false);
    setEditing(false);
  };

  const toggleRedFlag = (flag: string) => {
    const cur = patient.red_flags ?? [];
    const next = cur.includes(flag) ? cur.filter((f) => f !== flag) : [...cur, flag];
    onSavePatient({ red_flags: next });
  };
  const toggleYellowFlag = (flag: string) => {
    const cur = patient.yellow_flags ?? [];
    const next = cur.includes(flag) ? cur.filter((f) => f !== flag) : [...cur, flag];
    onSavePatient({ yellow_flags: next });
  };

  return (
    <div className="space-y-4 animate-[fadeSlide_0.2s_ease-out]">
      {/* Personal info */}
      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#0B3D2E] uppercase tracking-wide">Datos personales</h3>
          {editing ? (
            <div className="flex gap-2">
              <button onClick={() => { setForm({ name: patient.name||"", rut: patient.rut||"", phone: patient.phone||"", email: patient.email||"", date_of_birth: patient.date_of_birth||"", occupation: patient.occupation||"", sport: patient.sport||"", sex: patient.sex||"", address: patient.address||"", reason: patient.reason||"", notes: patient.notes||"" }); setEditing(false); }}
                className="text-xs text-gray-500 hover:text-gray-700 font-semibold">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.name.trim()}
                className="text-xs bg-[#0B3D2E] text-white px-3 py-1 rounded-lg font-semibold hover:bg-[#0B3D2E]/90 disabled:opacity-50">
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)}
              className="text-xs text-[#C8943A] hover:text-[#C8943A]/80 font-semibold">✏ Editar</button>
          )}
        </div>

        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Nombre", key: "name", type: "text", full: true },
              { label: "RUT", key: "rut", type: "text" },
              { label: "Teléfono", key: "phone", type: "tel" },
              { label: "F. Nacimiento", key: "date_of_birth", type: "date" },
              { label: "Email", key: "email", type: "email" },
              { label: "Ocupación", key: "occupation", type: "text" },
              { label: "Deporte", key: "sport", type: "text" },
              { label: "Dirección", key: "address", type: "text" },
            ].map((f) => (
              <div key={f.key} className={f.full ? "sm:col-span-2" : ""}>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">{f.label}</label>
                <input type={f.type} value={(form as Record<string, string>)[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#0B3D2E]/40 focus:ring-1 focus:ring-[#0B3D2E]/10 focus:outline-none" />
              </div>
            ))}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Sexo</label>
              <select value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#0B3D2E]/40 focus:ring-1 focus:ring-[#0B3D2E]/10 focus:outline-none">
                <option value="">—</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Motivo de consulta</label>
              <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={2}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#0B3D2E]/40 focus:ring-1 focus:ring-[#0B3D2E]/10 focus:outline-none resize-y" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Notas</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#0B3D2E]/40 focus:ring-1 focus:ring-[#0B3D2E]/10 focus:outline-none resize-y" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {[
              { l: "Nombre", v: patient.name },
              { l: "RUT", v: patient.rut || "—" },
              { l: "Teléfono", v: patient.phone || "—" },
              { l: "F. Nacimiento", v: patient.date_of_birth ? new Date(patient.date_of_birth + "T12:00:00").toLocaleDateString("es-CL") : "—" },
              { l: "Email", v: patient.email || "—" },
              { l: "Sexo", v: patient.sex === "M" ? "Masculino" : patient.sex === "F" ? "Femenino" : patient.sex === "O" ? "Otro" : "—" },
              { l: "Ocupación", v: patient.occupation || "—" },
              { l: "Deporte", v: patient.sport || "—" },
              { l: "Dirección", v: patient.address || "—" },
            ].map((f) => (
              <div key={f.l}>
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400">{f.l}</span>
                <span className="font-medium text-gray-800">{f.v}</span>
              </div>
            ))}
            {patient.reason && (
              <div className="col-span-2 mt-1">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Motivo de consulta</span>
                <span className="text-gray-800">{patient.reason}</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Services toggle */}
      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-bold text-[#0B3D2E] uppercase tracking-wide mb-3">Servicios activos</h3>
        <div className="flex flex-wrap gap-2">
          {(["kinesiology", "osteopathy", "posturology"] as const).map((svc) => {
            const active = svcs.includes(svc);
            return (
              <button key={svc} onClick={() => onToggleService(svc)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border-2
                  ${active
                    ? "bg-[#0B3D2E] text-white border-[#0B3D2E]"
                    : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                  }`}>
                {SVC_MAP[svc]}
              </button>
            );
          })}
        </div>
      </section>

      {/* Flags */}
      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-bold text-[#0B3D2E] uppercase tracking-wide mb-3">Señales de alerta</h3>

        <p className="text-[11px] font-semibold text-red-600 mb-2">🚩 Banderas rojas</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-4">
          {RED_FLAGS.map((f) => {
            const checked = redArr.includes(f);
            return (
              <label key={f} className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg text-xs transition-colors
                ${checked ? "bg-red-50 border border-red-200" : "bg-[#FAFAF8] border border-gray-100"}`}>
                <input type="checkbox" checked={checked} onChange={() => toggleRedFlag(f)}
                  className="accent-red-600 shrink-0" />
                <span className={checked ? "text-red-700 font-medium" : "text-gray-600"}>{f}</span>
              </label>
            );
          })}
        </div>

        <p className="text-[11px] font-semibold text-amber-600 mb-2">⚠ Banderas amarillas</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-4">
          {YELLOW_FLAGS.map((f) => {
            const checked = yellowArr.includes(f);
            return (
              <label key={f} className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg text-xs transition-colors
                ${checked ? "bg-amber-50 border border-amber-200" : "bg-[#FAFAF8] border border-gray-100"}`}>
                <input type="checkbox" checked={checked} onChange={() => toggleYellowFlag(f)}
                  className="accent-amber-600 shrink-0" />
                <span className={checked ? "text-amber-700 font-medium" : "text-gray-600"}>{f}</span>
              </label>
            );
          })}
        </div>

        <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Notas de alerta</label>
        <textarea value={plans.flagNotes ?? ""} rows={2}
          onChange={(e) => onUpdatePlans({ ...plans, flagNotes: e.target.value })}
          onBlur={() => onUpdatePlans(plans)}
          placeholder="Observaciones adicionales sobre alertas..."
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#0B3D2E]/40 focus:ring-1 focus:ring-[#0B3D2E]/10 focus:outline-none resize-y min-h-[56px]" />
      </section>

      {/* Payment summary by service */}
      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-bold text-[#0B3D2E] uppercase tracking-wide mb-3">💳 Resumen de sesiones</h3>
        <div className="grid gap-2">
          {svcs.map((svc) => {
            const svcLabel = SVC_MAP[svc] ?? svc;
            const svcSessions = sessions.filter((s) => s.service_type === svcLabel);
            const total = svcSessions.length;
            return (
              <div key={svc} className="p-3 bg-[#FAFAF8] rounded-lg border border-gray-100">
                <div className="text-xs font-bold text-[#0B3D2E] mb-1">{svcLabel}</div>
                <div className="text-sm font-semibold text-gray-800">{total} sesion{total !== 1 ? "es" : ""} registrada{total !== 1 ? "s" : ""}</div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   HistoryTab
   ══════════════════════════════════════════════════════════ */

function HistoryTab({ sessions }: { sessions: Session[] }) {
  const sorted = [...sessions].sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime());

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm text-center py-12 px-4">
        <div className="text-3xl mb-2">🕐</div>
        <p className="text-sm text-gray-400">Sin historial de sesiones.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0 animate-[fadeSlide_0.2s_ease-out]">
      {sorted.map((ses, i) => {
        const svcKey = SVC_MAP_REV[ses.service_type] ?? "";
        return (
          <div key={ses.id} className="flex gap-3 items-start">
            <div className="flex flex-col items-center gap-1 pt-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#0B3D2E] shrink-0" />
              {i < sorted.length - 1 && <div className="w-0.5 h-9 bg-gray-200" />}
            </div>
            <div className="flex-1 pb-3">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className="text-[13px] font-bold text-gray-800">
                  {new Date(ses.session_date).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${svcColor(svcKey)}`}>
                  {ses.service_type}
                </span>
                <span className="text-[11px] text-gray-400">#{sorted.length - i} · {ses.professional}</span>
                {ses.eva_score !== null && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full
                    ${ses.eva_score <= 3 ? "bg-green-100 text-green-800" : ses.eva_score <= 6 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>
                    EVA {ses.eva_score}
                  </span>
                )}
              </div>
              {ses.notes && (
                <div className="text-[11px] text-gray-500 bg-[#FAFAF8] rounded-md border border-gray-100 px-2.5 py-1.5 mt-1">
                  {ses.notes}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PaymentsTab
   ══════════════════════════════════════════════════════════ */

function PaymentsTab({
  payments,
  balance,
  pin,
  patientId,
  onRefresh,
}: {
  payments: Payment[];
  balance: Balance | null;
  pin: string;
  patientId: string;
  onRefresh: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    amount: "",
    method: PAYMENT_METHODS[0].value as string,
    payment_type: PAYMENT_TYPES[0].value as string,
    pack_name: "",
    sessions_purchased: "1",
    service_type: SERVICE_TYPES[0] as string,
    reference: "",
    notes: "",
  });

  const selectPack = (pack: (typeof PACKS)[number]) => {
    setForm({
      ...form,
      amount: String(pack.price),
      payment_type: "pack",
      pack_name: pack.name,
      sessions_purchased: String(pack.sessions),
      service_type: pack.service,
    });
  };

  const handleSubmit = async () => {
    if (!form.amount) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/fichas/payments", {
        method: "POST",
        headers: { "x-equipo-pin": pin, "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          amount: parseInt(form.amount),
          method: form.method,
          payment_type: form.payment_type,
          pack_name: form.pack_name || null,
          sessions_purchased: parseInt(form.sessions_purchased) || 1,
          service_type: form.service_type || null,
          reference: form.reference || null,
          notes: form.notes || null,
          registered_by: "equipo",
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Error al registrar pago.");
      } else {
        setShowForm(false);
        setForm({ amount: "", method: PAYMENT_METHODS[0].value, payment_type: PAYMENT_TYPES[0].value, pack_name: "", sessions_purchased: "1", service_type: SERVICE_TYPES[0], reference: "", notes: "" });
        onRefresh();
      }
    } catch {
      setError("Error de conexión.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-[fadeSlide_0.2s_ease-out]">
      <BalanceBanner balance={balance} />

      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#0B3D2E] uppercase tracking-wide">Pagos</h3>
          <button onClick={() => setShowForm(!showForm)}
            className="text-xs bg-[#0B3D2E] text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-[#0B3D2E]/90">
            {showForm ? "Cancelar" : "+ Registrar pago"}
          </button>
        </div>

        {showForm && (
          <div className="bg-[#FAFAF8] rounded-xl border border-gray-100 p-4 mb-4 animate-[fadeSlide_0.2s_ease-out]">
            {/* Packs rápidos */}
            <p className="text-[11px] font-bold text-[#0B3D2E] mb-2">Packs rápidos</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {PACKS.map((pk) => (
                <button key={pk.name} onClick={() => selectPack(pk)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border-2 cursor-pointer transition-all
                    ${form.pack_name === pk.name
                      ? "bg-green-50 border-[#0B3D2E] text-[#0B3D2E]"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}>
                  {pk.name} · {fmtCLP(pk.price)}
                </button>
              ))}
            </div>

            <div className="h-px bg-gray-200 mb-4" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">Monto ($)</label>
                <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0B3D2E]/40 focus:ring-1 focus:ring-[#0B3D2E]/10 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">Método</label>
                <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0B3D2E]/40 focus:outline-none">
                  {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">Tipo</label>
                <select value={form.payment_type} onChange={(e) => setForm({ ...form, payment_type: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0B3D2E]/40 focus:outline-none">
                  {PAYMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">Sesiones</label>
                <input type="number" min="1" value={form.sessions_purchased} onChange={(e) => setForm({ ...form, sessions_purchased: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0B3D2E]/40 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">Servicio</label>
                <select value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0B3D2E]/40 focus:outline-none">
                  {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">Nº comprobante</label>
                <input type="text" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0B3D2E]/40 focus:outline-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">Notas</label>
                <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0B3D2E]/40 focus:outline-none" />
              </div>
            </div>

            {error && <p className="text-red-600 text-xs mt-2">{error}</p>}

            <div className="mt-3 text-right">
              <button onClick={handleSubmit} disabled={saving || !form.amount}
                className="bg-[#0B3D2E] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#0B3D2E]/90 disabled:opacity-50">
                {saving ? "Guardando..." : "Guardar pago"}
              </button>
            </div>
          </div>
        )}

        {/* Payment history */}
        {payments.length === 0 ? (
          <p className="text-gray-400 text-center text-sm py-6">Sin pagos registrados.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3">
                <div>
                  <span className="text-sm font-bold text-[#0B3D2E]">{fmtCLP(p.amount)}</span>
                  <span className="text-[11px] text-gray-400 ml-2">
                    {PAYMENT_METHODS.find((m) => m.value === p.method)?.label ?? p.method}
                  </span>
                  {p.pack_name && (
                    <span className="ml-2 inline-block rounded-full bg-green-100 text-green-800 px-2 py-0.5 text-[10px] font-semibold">
                      {p.pack_name}
                    </span>
                  )}
                  {p.sessions_purchased > 1 && (
                    <span className="text-[11px] text-gray-400 ml-2">{p.sessions_purchased} sesiones</span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-gray-400">
                    {new Date(p.created_at).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                  <div className="text-[10px] text-gray-300">{p.registered_by}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SessionModal
   ══════════════════════════════════════════════════════════ */

function SessionModal({
  patient,
  service,
  sessions,
  plans,
  onSave,
  onClose,
}: {
  patient: Patient;
  service: string; // "kinesiology" | "osteopathy" | "posturology"
  sessions: Session[];
  plans: ClinicalPlansExt;
  onSave: (session: Record<string, unknown>, payment: Record<string, unknown> | null) => Promise<void>;
  onClose: () => void;
}) {
  const svcLabel = SVC_MAP[service] ?? service;
  const prev = sessions
    .filter((s) => s.service_type === svcLabel)
    .sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime());
  const num = prev.length + 1;

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [professional, setProfessional] = useState<string>(PROFESSIONALS[0]);
  const [eva, setEva] = useState<number | null>(null);
  const [comparison, setComparison] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  // Kine blocks
  const [blocks, setBlocks] = useState<Record<string, { content: string; exercises: string }>>({
    mobilization: { content: "", exercises: "" },
    motorControl: { content: "", exercises: "" },
    load: { content: "", exercises: "" },
  });
  const setBlk = (key: string, field: "content" | "exercises", val: string) =>
    setBlocks((p) => ({ ...p, [key]: { ...p[key], [field]: val } }));

  // Osteo / Posturo
  const [osteoNotes, setOsteoNotes] = useState("");
  const [posturoNotes, setPosturoNotes] = useState("");

  // Payment
  const [paid, setPaid] = useState(false);
  const [payMethod, setPayMethod] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payNotes, setPayNotes] = useState("");

  const isKine = service === "kinesiology";

  const handleSave = async () => {
    setSaving(true);
    const clinicalData: Record<string, unknown> = {};
    if (comparison) clinicalData.comparison = comparison;
    if (isKine) clinicalData.blocks = blocks;
    if (service === "osteopathy" && osteoNotes) clinicalData.osteoNotes = osteoNotes;
    if (service === "posturology" && posturoNotes) clinicalData.posturoNotes = posturoNotes;
    if (clinicalNotes) clinicalData.clinicalNotes = clinicalNotes;
    if (feedback) clinicalData.feedback = feedback;

    const sessionData: Record<string, unknown> = {
      professional,
      service_type: svcLabel,
      session_date: date,
      eva_score: eva,
      notes: clinicalNotes || null,
      clinical_data: Object.keys(clinicalData).length > 0 ? clinicalData : null,
    };

    const paymentData = paid && payAmount
      ? { method: payMethod, amount: parseInt(payAmount), notes: payNotes || null }
      : null;

    await onSave(sessionData, paymentData);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-[640px] w-full max-h-[92vh] overflow-y-auto animate-[fadeSlide_0.2s_ease-out]">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-[15px] font-extrabold text-[#0B3D2E]">Sesión #{num} — {svcLabel}</h2>
            <p className="text-[11px] text-gray-400">{patient.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer">✕</button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Date & Professional */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">Fecha</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0B3D2E]/40 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">Profesional</label>
              <select value={professional} onChange={(e) => setProfessional(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0B3D2E]/40 focus:outline-none">
                {USERS.map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}
              </select>
            </div>
          </div>

          {/* EVA */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 mb-2">EVA — Dolor (0–10)</label>
            <div className="flex gap-1.5 flex-wrap">
              {[...Array(11)].map((_, i) => {
                const col = i <= 3 ? "bg-green-500" : i <= 6 ? "bg-amber-500" : "bg-red-600";
                const sel = eva === i;
                return (
                  <button key={i} onClick={() => setEva(i)}
                    className={`w-9 h-9 rounded-lg text-xs font-bold cursor-pointer transition-all border-2
                      ${sel ? `${col} text-white border-transparent shadow-md scale-110` : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}>
                    {i}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comparison with previous */}
          {prev.length > 0 && (
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                Comparación vs sesión #{num - 1} ({new Date(prev[0].session_date).toLocaleDateString("es-CL", { day: "numeric", month: "short" })})
              </label>
              <textarea value={comparison} onChange={(e) => setComparison(e.target.value)}
                placeholder="Evolución respecto a sesión anterior..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[52px] resize-y focus:border-[#0B3D2E]/40 focus:outline-none" />
            </div>
          )}

          {/* ── Kine blocks ── */}
          {isKine && (
            <>
              <h4 className="text-xs font-bold text-[#0B3D2E] uppercase tracking-wide">Bloques de trabajo</h4>
              {([
                { key: "mobilization", label: "Bloque 1 — Movilización articular", icon: "🔄" },
                { key: "motorControl", label: "Bloque 2 — Control motor", icon: "⚙️" },
                { key: "load", label: "Bloque 3 — Carga / Fuerza / Potencia", icon: "💪" },
              ] as const).map((blk) => {
                const kp = plans.kinePlan ?? blankKine();
                const suggested = OBJECTIVES
                  .filter((o) => o.block === blk.key && kp.checkedObjectives?.[o.id])
                  .flatMap((o) => o.exercises.map((ex) => ({ ex, icon: o.icon })));

                return (
                  <div key={blk.key} className="bg-[#FAFAF8] rounded-xl border border-gray-100 p-3">
                    <p className="text-xs font-bold text-[#0B3D2E] mb-2">{blk.icon} {blk.label}</p>

                    {suggested.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] font-semibold text-gray-400 mb-1.5">Ejercicios sugeridos del plan</p>
                        <div className="flex flex-wrap gap-1.5">
                          {suggested.map(({ ex, icon }, idx) => (
                            <button key={idx}
                              onClick={() => {
                                const cur = blocks[blk.key].exercises;
                                setBlk(blk.key, "exercises", cur ? cur + "\n" + ex : ex);
                              }}
                              className="px-2.5 py-1 rounded-full border border-[#C8943A]/40 bg-[#C8943A]/5 text-[#0B3D2E] text-[11px] font-medium cursor-pointer hover:bg-[#C8943A]/15 transition-colors"
                              title="Clic para agregar">
                              {icon} {ex} +
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 mb-1">Descripción / Técnica</label>
                        <textarea value={blocks[blk.key].content} onChange={(e) => setBlk(blk.key, "content", e.target.value)}
                          placeholder="Técnica aplicada..."
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[48px] resize-y focus:border-[#0B3D2E]/40 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 mb-1">Ejercicios (series × reps)</label>
                        <textarea value={blocks[blk.key].exercises} onChange={(e) => setBlk(blk.key, "exercises", e.target.value)}
                          placeholder="Ej: Rot. interna banda — 3×12..."
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[48px] resize-y focus:border-[#0B3D2E]/40 focus:outline-none" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* ── Osteo notes ── */}
          {service === "osteopathy" && (
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">Hallazgos y técnicas osteopáticas</label>
              <textarea value={osteoNotes} onChange={(e) => setOsteoNotes(e.target.value)}
                placeholder="Regionales tratadas, técnicas, respuesta del paciente..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[80px] resize-y focus:border-[#0B3D2E]/40 focus:outline-none" />
            </div>
          )}

          {/* ── Posturo notes ── */}
          {service === "posturology" && (
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">Trabajo de sesión</label>
              <textarea value={posturoNotes} onChange={(e) => setPosturoNotes(e.target.value)}
                placeholder="Reflejos trabajados, oculomotricidad, cambios observados..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[80px] resize-y focus:border-[#0B3D2E]/40 focus:outline-none" />
            </div>
          )}

          {/* Clinical notes */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 mb-1">Notas clínicas / Observaciones</label>
            <textarea value={clinicalNotes} onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Observaciones generales, alertas, cambios de plan..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[60px] resize-y focus:border-[#0B3D2E]/40 focus:outline-none" />
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 mb-1">Feedback del paciente</label>
            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)}
              placeholder="¿Qué reporta el paciente?"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[52px] resize-y focus:border-[#0B3D2E]/40 focus:outline-none" />
          </div>

          {/* ── Payment section ── */}
          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-xs font-bold text-[#0B3D2E] uppercase tracking-wide mb-3">💳 Pago de sesión</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 mb-1">¿Pagó?</label>
                <div className="flex gap-2">
                  {(["Sí", "No"] as const).map((v) => {
                    const act = (paid && v === "Sí") || (!paid && v === "No");
                    return (
                      <button key={v} onClick={() => setPaid(v === "Sí")}
                        className={`flex-1 py-2 rounded-lg text-[13px] font-bold cursor-pointer transition-all border-2
                          ${act ? "bg-[#0B3D2E] text-white border-[#0B3D2E]" : "bg-white text-gray-400 border-gray-200"}`}>
                        {v}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 mb-1">Método</label>
                <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} disabled={!paid}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0B3D2E]/40 focus:outline-none disabled:opacity-40">
                  <option value="">Seleccionar...</option>
                  {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 mb-1">Monto ($)</label>
                <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} disabled={!paid}
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0B3D2E]/40 focus:outline-none disabled:opacity-40" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 mb-1">Notas de pago</label>
                <input type="text" value={payNotes} onChange={(e) => setPayNotes(e.target.value)} disabled={!paid}
                  placeholder="Observaciones..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0B3D2E]/40 focus:outline-none disabled:opacity-40" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 cursor-pointer">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-[#0B3D2E] hover:bg-[#0B3D2E]/90 disabled:opacity-50 cursor-pointer">
              {saving ? "Guardando..." : "Guardar Sesión"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN: FichaPaciente
   ══════════════════════════════════════════════════════════ */

export default function FichaPaciente({
  patientId,
  pin,
}: {
  patientId: string;
  pin: string;
}) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [sessionModal, setSessionModal] = useState<string | null>(null); // "kinesiology" | "osteopathy" | "posturology" | null

  // Clinical plans (local state + debounced save)
  const [plans, setPlans] = useState<ClinicalPlansExt>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const headers = { "x-equipo-pin": pin };

  /* ── Fetch ── */
  const fetchData = useCallback(() => {
    setLoading(true);
    fetch(`/api/fichas/patients/${patientId}`, { headers })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); return; }
        setPatient(d.patient);
        setSessions(d.sessions ?? []);
        setPayments(d.payments ?? []);
        setBalance(d.balance ?? null);
        if (d.patient?.clinical_plans) {
          setPlans(d.patient.clinical_plans);
        }
      })
      .catch(() => setError("Error de conexión."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, pin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Save patient data (profile edits, flags) ── */
  const savePatientData = async (data: Record<string, unknown>) => {
    setError("");
    try {
      const res = await fetch(`/api/fichas/patients/${patientId}`, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Error al actualizar.");
      } else {
        fetchData();
      }
    } catch {
      setError("Error de conexión.");
    }
  };

  /* ── Debounced clinical plans save ── */
  const updatePlans = (updated: ClinicalPlansExt) => {
    setPlans(updated);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetch(`/api/fichas/patients/${patientId}`, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ clinical_plans: updated }),
      }).catch(() => {});
    }, 1500);
  };

  /* ── Toggle service ── */
  const toggleService = (svc: string) => {
    const cur = plans.services ?? [];
    const next = cur.includes(svc) ? cur.filter((s) => s !== svc) : [...cur, svc];
    updatePlans({ ...plans, services: next });
  };

  /* ── Plan change handlers ── */
  const handleKineChange = (kp: KinePlan) => updatePlans({ ...plans, kinePlan: kp });
  const handleOsteoChange = (op: OsteoPlan) => updatePlans({ ...plans, osteoPlan: op });
  const handlePosturoChange = (pp: PosturoPlan) => updatePlans({ ...plans, posturoPlan: pp });

  /* ── Save session (+ optional in-session payment) ── */
  const handleSaveSession = async (
    sessionData: Record<string, unknown>,
    paymentData: Record<string, unknown> | null,
  ) => {
    setError("");
    try {
      const res = await fetch("/api/fichas/sessions", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: patientId, ...sessionData }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Error al guardar sesión.");
        return;
      }
      // Optional payment
      if (paymentData) {
        await fetch("/api/fichas/payments", {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({
            patient_id: patientId,
            amount: paymentData.amount,
            method: paymentData.method,
            payment_type: "sesion",
            sessions_purchased: 1,
            service_type: sessionData.service_type,
            notes: paymentData.notes || null,
            registered_by: "equipo",
          }),
        });
      }
      setSessionModal(null);
      fetchData();
    } catch {
      setError("Error de conexión.");
    }
  };

  /* ── Render ── */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-[#0B3D2E] border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-sm text-gray-500">Cargando ficha...</span>
      </div>
    );
  }

  if (!patient) {
    return <p className="text-red-600 text-center py-8">Paciente no encontrado.</p>;
  }

  const svcs = plans.services ?? [];
  const hasRed = (patient.red_flags ?? []).length > 0;
  const hasYellow = (patient.yellow_flags ?? []).length > 0;

  // Dynamic tab list based on patient services
  const tabs: { id: TabId; label: string }[] = [
    { id: "profile", label: "👤 Perfil" },
    ...(svcs.includes("kinesiology") ? [{ id: "kinesiology" as TabId, label: "🦴 Kinesiología" }] : []),
    ...(svcs.includes("osteopathy") ? [{ id: "osteopathy" as TabId, label: "🤲 Osteopatía" }] : []),
    ...(svcs.includes("posturology") ? [{ id: "posturology" as TabId, label: "👁 Posturología" }] : []),
    { id: "history", label: "📜 Historial" },
    { id: "payments", label: "💰 Pagos" },
  ];

  // Session creation dropdown options
  const sessionOptions = svcs.map((s) => ({ key: s, label: SVC_MAP[s] ?? s }));

  return (
    <div>
      {/* ── Patient header ── */}
      <div className="bg-[#0B3D2E] rounded-xl px-5 py-3 mb-4 shadow-md">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-xl bg-[#C8943A] flex items-center justify-center text-white font-extrabold text-lg shrink-0">
            {patient.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-extrabold text-base truncate">{patient.name}</h2>
            <div className="flex flex-wrap items-center gap-1.5">
              {patient.rut && <span className="text-white/60 text-[11px]">{patient.rut}</span>}
              {hasRed && (
                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-bold">🚩 Roja</span>
              )}
              {hasYellow && (
                <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold">⚠ Amarilla</span>
              )}
              {svcs.map((s) => (
                <span key={s} className="bg-white/15 text-white px-2 py-0.5 rounded-full text-[10px] font-semibold">
                  {SVC_MAP[s] ?? s}
                </span>
              ))}
            </div>
          </div>
          {/* New session button */}
          {sessionOptions.length > 0 && (
            <div className="relative group">
              <button className="shrink-0 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white font-semibold hover:bg-white/20 transition-colors cursor-pointer">
                + Sesión
              </button>
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-20 hidden group-hover:block min-w-[160px]">
                {sessionOptions.map((o) => (
                  <button key={o.key} onClick={() => setSessionModal(o.key)}
                    className="block w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-[#0B3D2E]/5 cursor-pointer">
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Balance banner ── */}
      {activeTab !== "payments" && <BalanceBanner balance={balance} />}

      {/* ── Tab navigation ── */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`whitespace-nowrap px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0
              ${activeTab === t.id
                ? "bg-[#0B3D2E] text-white shadow-sm"
                : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
              }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Error display ── */}
      {error && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {error}
          <button onClick={() => setError("")} className="ml-2 text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* ── Tab content ── */}
      {activeTab === "profile" && (
        <ProfileTab
          patient={patient}
          plans={plans}
          sessions={sessions}
          onSavePatient={savePatientData}
          onToggleService={toggleService}
          onUpdatePlans={updatePlans}
        />
      )}

      {activeTab === "kinesiology" && (
        <KinesiologyTab
          plan={plans.kinePlan ?? blankKine()}
          onChange={handleKineChange}
          sessions={sessions
            .filter((s) => s.service_type === "Kinesiología")
            .map((s) => ({
              id: s.id,
              date: s.session_date,
              vas: s.eva_score,
              professional: s.professional,
              service_type: s.service_type,
              notes: s.notes || undefined,
              clinical_data: s.clinical_data,
              session_date: s.session_date,
              eva_score: s.eva_score,
            }))}
          isAdmin={true}
          onNewSession={() => setSessionModal("kinesiology")}
          patient={patient ? {
            name: patient.name,
            rut: patient.rut,
            date_of_birth: patient.date_of_birth,
            sex: patient.sex,
            address: patient.address,
            occupation: patient.occupation,
            sport: patient.sport,
            reason: patient.reason,
            email: patient.email,
            phone: patient.phone,
          } : undefined}
        />
      )}

      {activeTab === "osteopathy" && (
        <OsteopathyTab
          plan={plans.osteoPlan ?? blankOsteo()}
          onChange={handleOsteoChange}
          sessions={sessions
            .filter((s) => s.service_type === "Osteopatía")
            .map((s) => ({
              id: s.id,
              date: s.session_date,
              vas: s.eva_score,
              professional: s.professional,
              service_type: s.service_type,
              notes: s.notes || undefined,
              clinical_data: s.clinical_data,
              session_date: s.session_date,
              eva_score: s.eva_score,
            }))}
          isAdmin={true}
          onNewSession={() => setSessionModal("osteopathy")}
          patientEmail={patient?.email || undefined}
        />
      )}

      {activeTab === "posturology" && (
        <PosturologyTab
          plan={plans.posturoPlan ?? blankPosturo()}
          onChange={handlePosturoChange}
          sessions={sessions
            .filter((s) => s.service_type === "Posturología Clínica")
            .map((s) => ({
              id: s.id,
              date: s.session_date,
              vas: s.eva_score,
              professional: s.professional,
              service_type: s.service_type,
              notes: s.notes || undefined,
              clinical_data: s.clinical_data,
              session_date: s.session_date,
              eva_score: s.eva_score,
            }))}
          isAdmin={true}
          onNewSession={() => setSessionModal("posturology")}
        />
      )}

      {activeTab === "history" && <HistoryTab sessions={sessions} />}

      {activeTab === "payments" && (
        <PaymentsTab
          payments={payments}
          balance={balance}
          pin={pin}
          patientId={patientId}
          onRefresh={fetchData}
        />
      )}

      {/* ── Session Modal overlay ── */}
      {sessionModal && (
        <SessionModal
          patient={patient}
          service={sessionModal}
          sessions={sessions}
          plans={plans}
          onSave={handleSaveSession}
          onClose={() => setSessionModal(null)}
        />
      )}
    </div>
  );
}
