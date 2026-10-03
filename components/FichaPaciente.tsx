"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ClinicalEvalForm, { ClinicalDataDisplay } from "./ClinicalEvalForm";
import KinesiologyTab from "./fichas/KinesiologyTab";
import { blankKine, type KinePlan } from "./fichas/constants";
import type { Permission } from "@/lib/equipo-auth";

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
  red_flags: string[] | null;
  yellow_flags: string[] | null;
  notes: string | null;
  sex?: string | null;
  address?: string | null;
  // Planes clínicos por servicio (jsonb). kinePlan: ficha kinésica completa.
  clinical_plans?: { kinePlan?: KinePlan; [k: string]: unknown } | null;
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

type BalanceRow = {
  payment_id: string;
  sessions_total: number;
  sessions_used: number;
  expires_at: string | null;
};

type PaymentEditForm = {
  amount: string;
  method: string;
  payment_type: string;
  pack_name: string;
  sessions_purchased: string;
  sessions_used: string;
  service_type: string;
  reference: string;
  notes: string;
};

type Balance = {
  patient_id: string;
  patient_name: string;
  total_remaining: number;
  balance_detail: { service_type: string; remaining: number }[] | null;
};

const PROFESSIONALS = [
  "Joaquín Adi A.",
  "Anikken Arentsen",
  "Camilo Zamora",
  "Edison",
];

const SERVICE_TYPES = [
  "Osteopatía",
  "Kinesiología",
  "Posturología Clínica",
  "Estudio Biomecánico",
  "Actividad Física Dirigida",
];

/* Métodos y tipos de pago con valores que coinciden con los CHECK constraints de la BD */
const PAYMENT_METHODS: { value: string; label: string }[] = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "webpay", label: "Webpay (Débito/Crédito)" },
  { value: "otro", label: "Otro" },
];
const PAYMENT_TYPES: { value: string; label: string }[] = [
  { value: "sesion", label: "Sesión individual" },
  { value: "pack", label: "Bono / Pack" },
];

function hoyLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export type SessionDefaults = {
  professional?: string; // nombre como viene de la agenda
  service_type?: string; // nombre del servicio como viene de la agenda
  session_date?: string; // YYYY-MM-DD
};

// Ajusta los datos de una cita a las opciones del formulario de sesión
function sesionInicial(defaults?: SessionDefaults) {
  const norm = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const servicio =
    SERVICE_TYPES.find((s) => defaults?.service_type && norm(s).startsWith(norm(defaults.service_type).split(" ")[0])) ??
    SERVICE_TYPES[0];
  const primerNombre = defaults?.professional ? norm(defaults.professional).split(" ")[0] : "";
  const profesional = PROFESSIONALS.find((p) => primerNombre && norm(p).startsWith(primerNombre)) ?? PROFESSIONALS[0];
  return {
    professional: profesional,
    service_type: servicio,
    session_date: defaults?.session_date ?? hoyLocal(),
    eva_score: "",
    notes: "",
  };
}

export default function FichaPaciente({
  patientId,
  permissions,
  sessionDefaults,
}: {
  patientId: string;
  permissions: Permission[];
  sessionDefaults?: SessionDefaults;
}) {
  const clinico = permissions.includes("clinico");
  const puedePagos = permissions.includes("pagos");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [balanceRows, setBalanceRows] = useState<BalanceRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Subvistas
  const [activeSection, setActiveSection] = useState<"sesiones" | "kine" | "pagos">(clinico ? "sesiones" : "pagos");
  const [showNewSession, setShowNewSession] = useState(false);
  const [showNewPayment, setShowNewPayment] = useState(false);
  const [editing, setEditing] = useState(false);

  // Formulario de sesión
  const [sessionForm, setSessionForm] = useState(() => sesionInicial(sessionDefaults));
  const [clinicalData, setClinicalData] = useState<Record<string, unknown>>({});
  // EVA y notas libres quedan plegadas: la ficha de evaluación del servicio va primero
  const [showEvaNotas, setShowEvaNotas] = useState(false);
  const [savingSession, setSavingSession] = useState(false);

  // Formulario de pago
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: PAYMENT_METHODS[0].value,
    payment_type: PAYMENT_TYPES[0].value,
    pack_name: "",
    sessions_purchased: "1",
    service_type: SERVICE_TYPES[0],
    reference: "",
    notes: "",
  });
  const [savingPayment, setSavingPayment] = useState(false);

  // Edición de pagos existentes
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [paymentEdit, setPaymentEdit] = useState<PaymentEditForm | null>(null);

  // Formulario de edición de paciente
  const [editForm, setEditForm] = useState({
    name: "", rut: "", phone: "", email: "", date_of_birth: "",
    occupation: "", sport: "", reason: "", notes: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const [error, setError] = useState("");

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch(`/api/fichas/patients/${patientId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) return;
        setPatient(d.patient);
        setSessions(d.sessions ?? []);
        setPayments(d.payments ?? []);
        setBalance(d.balance ?? null);
        setBalanceRows(d.balance_rows ?? []);
        // Poblar formulario de edición
        if (d.patient) {
          setEditForm({
            name: d.patient.name || "",
            rut: d.patient.rut || "",
            phone: d.patient.phone || "",
            email: d.patient.email || "",
            date_of_birth: d.patient.date_of_birth || "",
            occupation: d.patient.occupation || "",
            sport: d.patient.sport || "",
            reason: d.patient.reason || "",
            notes: d.patient.notes || "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [patientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSaveSession(e: React.FormEvent) {
    e.preventDefault();
    setSavingSession(true);
    setError("");
    try {
      // Filtrar clinical_data: solo incluir campos que tengan contenido
      const filteredClinical: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(clinicalData)) {
        if (v === null || v === undefined || v === "") continue;
        if (Array.isArray(v) && v.length === 0) continue;
        filteredClinical[k] = v;
      }
      const hasClinical = Object.keys(filteredClinical).length > 0;

      const res = await fetch("/api/fichas/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          professional: sessionForm.professional,
          service_type: sessionForm.service_type,
          session_date: sessionForm.session_date,
          eva_score: sessionForm.eva_score ? parseInt(sessionForm.eva_score) : null,
          notes: sessionForm.notes || null,
          clinical_data: hasClinical ? filteredClinical : null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Error al guardar sesión.");
      } else {
        setShowNewSession(false);
        setShowEvaNotas(false);
        setClinicalData({});
        setSessionForm(sesionInicial(sessionDefaults));
        fetchData();
      }
    } catch {
      setError("Error de conexión.");
    } finally {
      setSavingSession(false);
    }
  }

  async function handleSavePayment(e: React.FormEvent) {
    e.preventDefault();
    setSavingPayment(true);
    setError("");
    try {
      const res = await fetch("/api/fichas/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          amount: parseInt(paymentForm.amount),
          method: paymentForm.method,
          payment_type: paymentForm.payment_type,
          pack_name: paymentForm.pack_name || null,
          sessions_purchased: parseInt(paymentForm.sessions_purchased) || 1,
          service_type: paymentForm.service_type,
          reference: paymentForm.reference || null,
          notes: paymentForm.notes || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Error al registrar pago.");
      } else {
        setShowNewPayment(false);
        setPaymentForm({
          amount: "",
          method: PAYMENT_METHODS[0].value,
          payment_type: PAYMENT_TYPES[0].value,
          pack_name: "",
          sessions_purchased: "1",
          service_type: SERVICE_TYPES[0],
          reference: "",
          notes: "",
        });
        fetchData();
      }
    } catch {
      setError("Error de conexión.");
    } finally {
      setSavingPayment(false);
    }
  }

  function startEditPayment(p: Payment) {
    const row = balanceRows.find((b) => b.payment_id === p.id);
    setEditingPaymentId(p.id);
    setPaymentEdit({
      amount: String(p.amount),
      method: p.method,
      payment_type: p.payment_type,
      pack_name: p.pack_name || "",
      sessions_purchased: String(p.sessions_purchased),
      sessions_used: String(row?.sessions_used ?? 0),
      service_type: p.service_type || "",
      reference: p.reference || "",
      notes: p.notes || "",
    });
  }

  async function handleUpdatePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPaymentId || !paymentEdit) return;
    setSavingPayment(true);
    setError("");
    try {
      const res = await fetch("/api/fichas/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPaymentId,
          amount: parseInt(paymentEdit.amount),
          method: paymentEdit.method,
          payment_type: paymentEdit.payment_type,
          pack_name: paymentEdit.pack_name || null,
          sessions_purchased: parseInt(paymentEdit.sessions_purchased) || 0,
          sessions_used: parseInt(paymentEdit.sessions_used) || 0,
          service_type: paymentEdit.service_type || null,
          reference: paymentEdit.reference || null,
          notes: paymentEdit.notes || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Error al actualizar pago.");
      } else {
        setEditingPaymentId(null);
        setPaymentEdit(null);
        fetchData();
      }
    } catch {
      setError("Error de conexión.");
    } finally {
      setSavingPayment(false);
    }
  }

  async function handleDeletePayment(id: string) {
    if (!confirm("¿Eliminar este pago? También se eliminan las sesiones que acreditó.")) return;
    setError("");
    try {
      const res = await fetch(`/api/fichas/payments?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Error al eliminar pago.");
      } else {
        fetchData();
      }
    } catch {
      setError("Error de conexión.");
    }
  }

  // Ficha kinésica: se guarda en clinical_plans.kinePlan con un pequeño retraso
  // para no enviar una petición por cada tecla.
  const kineSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function handleKineChange(kp: KinePlan) {
    if (!patient) return;
    const clinical_plans = { ...(patient.clinical_plans ?? {}), kinePlan: kp };
    setPatient({ ...patient, clinical_plans });
    if (kineSaveTimer.current) clearTimeout(kineSaveTimer.current);
    kineSaveTimer.current = setTimeout(() => {
      fetch(`/api/fichas/patients/${patientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinical_plans }),
      })
        .then((r) => { if (!r.ok) setError("No se pudo guardar la ficha kinésica."); })
        .catch(() => setError("Error de conexión al guardar la ficha kinésica."));
    }, 800);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    setSavingEdit(true);
    setError("");
    try {
      const res = await fetch(`/api/fichas/patients/${patientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Error al actualizar.");
      } else {
        setEditing(false);
        fetchData();
      }
    } catch {
      setError("Error de conexión.");
    } finally {
      setSavingEdit(false);
    }
  }

  if (loading) {
    return <p className="text-slate-500 text-center py-8">Cargando ficha...</p>;
  }

  if (!patient) {
    return <p className="text-red-600 text-center py-8">Paciente no encontrado.</p>;
  }

  const age = patient.date_of_birth
    ? Math.floor(
        (Date.now() - new Date(patient.date_of_birth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  return (
    <div>
      {/* Encabezado del paciente */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{patient.name}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
              {patient.rut && <span>RUT: {patient.rut}</span>}
              {age !== null && <span>{age} años</span>}
              {clinico && patient.occupation && <span>{patient.occupation}</span>}
              {clinico && patient.sport && <span>Deporte: {patient.sport}</span>}
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="text-sm text-teal-700 hover:text-teal-900 font-medium"
          >
            {editing ? "Cancelar" : "Editar"}
          </button>
        </div>

        {/* Contacto */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 mb-3">
          {patient.phone && (
            <a href={`tel:${patient.phone}`} className="hover:text-teal-700">
              📞 {patient.phone}
            </a>
          )}
          {patient.email && (
            <a href={`mailto:${patient.email}`} className="hover:text-teal-700">
              ✉ {patient.email}
            </a>
          )}
        </div>

        {clinico && patient.reason && (
          <p className="text-sm text-slate-600">
            <span className="font-medium">Motivo:</span> {patient.reason}
          </p>
        )}
        {clinico && patient.notes && (
          <p className="text-sm text-slate-500 mt-1">
            <span className="font-medium">Notas:</span> {patient.notes}
          </p>
        )}

        {/* Balance */}
        <div className="mt-4 p-3 rounded-lg bg-teal-50 border border-teal-200">
            <p className="text-sm font-semibold text-teal-800">
              Sesiones restantes: {balance?.total_remaining ?? 0}
            </p>
            {balance?.balance_detail && balance.balance_detail.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-1">
                {balance.balance_detail.map((b, i) => (
                  <span key={i} className="text-xs text-teal-700">
                    {b.service_type}: {b.remaining}
                  </span>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* Formulario de edición */}
      {editing && (
        <form onSubmit={handleSaveEdit} className="rounded-xl border border-slate-200 bg-white p-6 mb-6">
          <h3 className="font-semibold text-slate-900 mb-4">Editar paciente</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
              <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">RUT</label>
              <input type="text" value={editForm.rut} onChange={(e) => setEditForm({ ...editForm, rut: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
              <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de nacimiento</label>
              <input type="date" value={editForm.date_of_birth} onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
            </div>
            {clinico && (<>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ocupación</label>
              <input type="text" value={editForm.occupation} onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Deporte</label>
              <input type="text" value={editForm.sport} onChange={(e) => setEditForm({ ...editForm, sport: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Motivo de consulta</label>
              <textarea value={editForm.reason} onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })} rows={2}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
              <textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} rows={2}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
            </div>
            </>)}
          </div>
          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
          <button type="submit" disabled={savingEdit || !editForm.name.trim()}
            className="mt-4 rounded-full bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50">
            {savingEdit ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      )}

      {/* Tabs sesiones / pagos */}
      <div className="flex gap-1 mb-4">
        {clinico && (
        <button
          onClick={() => setActiveSection("sesiones")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            activeSection === "sesiones"
              ? "bg-teal-700 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Sesiones ({sessions.length})
        </button>
        )}
        {clinico && (
        <button
          onClick={() => setActiveSection("kine")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            activeSection === "kine"
              ? "bg-teal-700 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Plan kinésico
        </button>
        )}
        {puedePagos && (
        <button
          onClick={() => setActiveSection("pagos")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            activeSection === "pagos"
              ? "bg-teal-700 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Pagos ({payments.length})
        </button>
        )}
      </div>

      {error && !editing && <p className="text-red-600 text-sm mb-3">{error}</p>}

      {/* === SESIONES === */}
      {clinico && activeSection === "sesiones" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Historial de sesiones</h3>
            <button
              onClick={() => setShowNewSession(!showNewSession)}
              className="rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
            >
              {showNewSession ? "Cancelar" : "+ Nueva sesión"}
            </button>
          </div>

          {showNewSession && (
            <form onSubmit={handleSaveSession} className="rounded-xl border border-slate-200 bg-white p-5 mb-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Profesional *</label>
                  <select value={sessionForm.professional} onChange={(e) => setSessionForm({ ...sessionForm, professional: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none">
                    {PROFESSIONALS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Servicio *</label>
                  <select
                    value={sessionForm.service_type}
                    onChange={(e) => {
                      setSessionForm({ ...sessionForm, service_type: e.target.value });
                      setClinicalData({}); // Reset al cambiar servicio
                    }}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none">
                    {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                  <input type="date" value={sessionForm.session_date} onChange={(e) => setSessionForm({ ...sessionForm, session_date: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
                </div>
              </div>

              {/* Ficha de evaluación del servicio elegido, directo */}
              <div className="mt-5 p-4 rounded-lg bg-teal-50/50 border border-teal-100">
                <ClinicalEvalForm
                  key={sessionForm.service_type}
                  serviceType={sessionForm.service_type}
                  value={clinicalData}
                  onChange={setClinicalData}
                  patientName={patient?.name}
                  patientEmail={patient?.email}
                />
              </div>

              {/* EVA y notas libres, opcionales */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowEvaNotas(!showEvaNotas)}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700"
                >
                  <span className={`transition-transform ${showEvaNotas ? "rotate-90" : ""}`}>▸</span>
                  {showEvaNotas ? "Ocultar EVA y notas" : "Agregar EVA y notas"}
                </button>
                {showEvaNotas && (
                  <div className="mt-3 grid gap-4 sm:grid-cols-[140px_1fr]">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">EVA (0-10)</label>
                      <input type="number" min="0" max="10" value={sessionForm.eva_score}
                        onChange={(e) => setSessionForm({ ...sessionForm, eva_score: e.target.value })}
                        placeholder="Dolor"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Notas clínicas</label>
                      <textarea value={sessionForm.notes} onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })} rows={3}
                        placeholder="Hallazgos, técnicas utilizadas, evolución..."
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" disabled={savingSession}
                className="mt-4 rounded-full bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50">
                {savingSession ? "Guardando..." : "Registrar sesión"}
              </button>
            </form>
          )}

          {sessions.length === 0 ? (
            <p className="text-slate-400 text-center py-6">Sin sesiones registradas.</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => (
                <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {new Date(s.session_date).toLocaleDateString("es-CL", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-medium">
                        {s.service_type}
                      </span>
                    </div>
                    {s.eva_score !== null && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        s.eva_score <= 3 ? "bg-green-100 text-green-800" :
                        s.eva_score <= 6 ? "bg-amber-100 text-amber-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        EVA: {s.eva_score}/10
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{s.professional}</p>
                  {s.notes && (
                    <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{s.notes}</p>
                  )}
                  {s.clinical_data && Object.keys(s.clinical_data).length > 0 && (
                    <ClinicalDataDisplay
                      serviceType={s.service_type}
                      data={s.clinical_data}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* === PLAN KINÉSICO === */}
      {clinico && activeSection === "kine" && patient && (
        <KinesiologyTab
          plan={patient.clinical_plans?.kinePlan ?? blankKine()}
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
          isAdmin
          onNewSession={() => {
            setSessionForm((f) => ({ ...f, service_type: "Kinesiología" }));
            setClinicalData({});
            setActiveSection("sesiones");
            setShowNewSession(true);
          }}
          patient={{
            name: patient.name,
            rut: patient.rut,
            date_of_birth: patient.date_of_birth,
            sex: patient.sex ?? null,
            address: patient.address ?? null,
            occupation: patient.occupation,
            sport: patient.sport,
            reason: patient.reason,
            email: patient.email,
            phone: patient.phone,
          }}
        />
      )}

      {/* === PAGOS === */}
      {puedePagos && activeSection === "pagos" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Historial de pagos</h3>
            <button
              onClick={() => setShowNewPayment(!showNewPayment)}
              className="rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
            >
              {showNewPayment ? "Cancelar" : "+ Nuevo pago"}
            </button>
          </div>

          {showNewPayment && (
            <form onSubmit={handleSavePayment} className="rounded-xl border border-slate-200 bg-white p-5 mb-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Monto (CLP) *</label>
                  <input type="number" min="1" value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    placeholder="25000"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Método *</label>
                  <select value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none">
                    {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo *</label>
                  <select value={paymentForm.payment_type} onChange={(e) => setPaymentForm({ ...paymentForm, payment_type: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none">
                    {PAYMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Servicio</label>
                  <select value={paymentForm.service_type} onChange={(e) => setPaymentForm({ ...paymentForm, service_type: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none">
                    {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del pack</label>
                  <input type="text" value={paymentForm.pack_name}
                    onChange={(e) => setPaymentForm({ ...paymentForm, pack_name: e.target.value })}
                    placeholder="Ej: Bono 5 sesiones kine"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sesiones compradas</label>
                  <input type="number" min="1" value={paymentForm.sessions_purchased}
                    onChange={(e) => setPaymentForm({ ...paymentForm, sessions_purchased: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Referencia</label>
                  <input type="text" value={paymentForm.reference}
                    onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                    placeholder="N° transferencia, boleta..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
                  <input type="text" value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
                </div>
              </div>
              <button type="submit" disabled={savingPayment || !paymentForm.amount}
                className="mt-4 rounded-full bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50">
                {savingPayment ? "Guardando..." : "Registrar pago"}
              </button>
            </form>
          )}

          {payments.length === 0 ? (
            <p className="text-slate-400 text-center py-6">Sin pagos registrados.</p>
          ) : (
            <div className="space-y-3">
              {payments.map((p) => {
                const row = balanceRows.find((b) => b.payment_id === p.id);
                if (editingPaymentId === p.id && paymentEdit) {
                  return (
                    <form key={p.id} onSubmit={handleUpdatePayment}
                      className="rounded-xl border border-teal-300 bg-white p-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="text-sm text-slate-700">Monto (CLP)
                          <input type="number" min="0" value={paymentEdit.amount}
                            onChange={(e) => setPaymentEdit({ ...paymentEdit, amount: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
                        </label>
                        <label className="text-sm text-slate-700">Método
                          <select value={paymentEdit.method}
                            onChange={(e) => setPaymentEdit({ ...paymentEdit, method: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none">
                            {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                          </select>
                        </label>
                        <label className="text-sm text-slate-700">Tipo
                          <select value={paymentEdit.payment_type}
                            onChange={(e) => setPaymentEdit({ ...paymentEdit, payment_type: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none">
                            {PAYMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </label>
                        <label className="text-sm text-slate-700">Servicio
                          <select value={paymentEdit.service_type}
                            onChange={(e) => setPaymentEdit({ ...paymentEdit, service_type: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none">
                            <option value="">Cualquier servicio</option>
                            {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </label>
                        <label className="text-sm text-slate-700">Sesiones compradas
                          <input type="number" min="0" value={paymentEdit.sessions_purchased}
                            onChange={(e) => setPaymentEdit({ ...paymentEdit, sessions_purchased: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
                        </label>
                        <label className="text-sm text-slate-700">Sesiones usadas
                          <input type="number" min="0" value={paymentEdit.sessions_used}
                            onChange={(e) => setPaymentEdit({ ...paymentEdit, sessions_used: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
                        </label>
                        <label className="text-sm text-slate-700">Nombre del pack
                          <input type="text" value={paymentEdit.pack_name}
                            onChange={(e) => setPaymentEdit({ ...paymentEdit, pack_name: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
                        </label>
                        <label className="text-sm text-slate-700">Referencia
                          <input type="text" value={paymentEdit.reference}
                            onChange={(e) => setPaymentEdit({ ...paymentEdit, reference: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
                        </label>
                        <label className="text-sm text-slate-700 sm:col-span-2">Notas
                          <input type="text" value={paymentEdit.notes}
                            onChange={(e) => setPaymentEdit({ ...paymentEdit, notes: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
                        </label>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button type="submit" disabled={savingPayment}
                          className="rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50">
                          {savingPayment ? "Guardando..." : "Guardar cambios"}
                        </button>
                        <button type="button" onClick={() => { setEditingPaymentId(null); setPaymentEdit(null); }}
                          className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:border-teal-700">
                          Cancelar
                        </button>
                      </div>
                    </form>
                  );
                }
                return (
                <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        ${p.amount.toLocaleString("es-CL")}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                        {PAYMENT_TYPES.find((t) => t.value === p.payment_type)?.label || p.payment_type}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(p.created_at).toLocaleDateString("es-CL", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 text-xs text-slate-500">
                    <span>{PAYMENT_METHODS.find((m) => m.value === p.method)?.label || p.method}</span>
                    {p.service_type && <span>{p.service_type}</span>}
                    {p.pack_name && <span>{p.pack_name}</span>}
                    {p.sessions_purchased > 1 && <span>{p.sessions_purchased} sesiones</span>}
                    {p.reference && <span>Ref: {p.reference}</span>}
                  </div>
                  {p.notes && <p className="text-sm text-slate-600 mt-1">{p.notes}</p>}
                  {row && (
                    <p className="text-xs text-slate-600 mt-1">
                      Sesiones usadas: {row.sessions_used} de {row.sessions_total}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[11px] text-slate-400">Registrado por: {p.registered_by}</p>
                    <div className="flex gap-3 text-xs font-semibold">
                      <button type="button" onClick={() => startEditPayment(p)}
                        className="text-teal-700 hover:underline">Editar</button>
                      <button type="button" onClick={() => handleDeletePayment(p.id)}
                        className="text-red-600 hover:underline">Eliminar</button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
