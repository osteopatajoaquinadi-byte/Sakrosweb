"use client";

import { useState, useEffect, useCallback } from "react";

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

const PAYMENT_METHODS = ["Efectivo", "Transferencia", "Débito", "Crédito", "Otro"];
const PAYMENT_TYPES = ["Sesión individual", "Bono / Pack", "Programa FONASA", "Programa ISAPRE", "Otro"];

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

  // Subvistas
  const [activeSection, setActiveSection] = useState<"sesiones" | "pagos">("sesiones");
  const [showNewSession, setShowNewSession] = useState(false);
  const [showNewPayment, setShowNewPayment] = useState(false);
  const [editing, setEditing] = useState(false);

  // Formulario de sesión
  const [sessionForm, setSessionForm] = useState({
    professional: PROFESSIONALS[0],
    service_type: SERVICE_TYPES[0],
    session_date: new Date().toISOString().split("T")[0],
    eva_score: "",
    notes: "",
  });
  const [savingSession, setSavingSession] = useState(false);

  // Formulario de pago
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: PAYMENT_METHODS[0],
    payment_type: PAYMENT_TYPES[0],
    pack_name: "",
    sessions_purchased: "1",
    service_type: SERVICE_TYPES[0],
    reference: "",
    notes: "",
  });
  const [savingPayment, setSavingPayment] = useState(false);

  // Formulario de edición de paciente
  const [editForm, setEditForm] = useState({
    name: "", rut: "", phone: "", email: "", date_of_birth: "",
    occupation: "", sport: "", reason: "", notes: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const [error, setError] = useState("");
  const headers = { "x-equipo-pin": pin };

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch(`/api/fichas/patients/${patientId}`, { headers })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) return;
        setPatient(d.patient);
        setSessions(d.sessions ?? []);
        setPayments(d.payments ?? []);
        setBalance(d.balance ?? null);
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
  }, [patientId, pin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSaveSession(e: React.FormEvent) {
    e.preventDefault();
    setSavingSession(true);
    setError("");
    try {
      const res = await fetch("/api/fichas/sessions", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          professional: sessionForm.professional,
          service_type: sessionForm.service_type,
          session_date: sessionForm.session_date,
          eva_score: sessionForm.eva_score ? parseInt(sessionForm.eva_score) : null,
          notes: sessionForm.notes || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Error al guardar sesión.");
      } else {
        setShowNewSession(false);
        setSessionForm({
          professional: PROFESSIONALS[0],
          service_type: SERVICE_TYPES[0],
          session_date: new Date().toISOString().split("T")[0],
          eva_score: "",
          notes: "",
        });
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
        headers: { ...headers, "Content-Type": "application/json" },
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
          registered_by: "equipo",
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Error al registrar pago.");
      } else {
        setShowNewPayment(false);
        setPaymentForm({
          amount: "",
          method: PAYMENT_METHODS[0],
          payment_type: PAYMENT_TYPES[0],
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

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    setSavingEdit(true);
    setError("");
    try {
      const res = await fetch(`/api/fichas/patients/${patientId}`, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
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
              {patient.occupation && <span>{patient.occupation}</span>}
              {patient.sport && <span>Deporte: {patient.sport}</span>}
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

        {patient.reason && (
          <p className="text-sm text-slate-600">
            <span className="font-medium">Motivo:</span> {patient.reason}
          </p>
        )}
        {patient.notes && (
          <p className="text-sm text-slate-500 mt-1">
            <span className="font-medium">Notas:</span> {patient.notes}
          </p>
        )}

        {/* Balance */}
        {balance && balance.total_remaining > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-teal-50 border border-teal-200">
            <p className="text-sm font-semibold text-teal-800">
              Sesiones restantes: {balance.total_remaining}
            </p>
            {balance.balance_detail && balance.balance_detail.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-1">
                {balance.balance_detail.map((b, i) => (
                  <span key={i} className="text-xs text-teal-700">
                    {b.service_type}: {b.remaining}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
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
      </div>

      {error && !editing && <p className="text-red-600 text-sm mb-3">{error}</p>}

      {/* === SESIONES === */}
      {activeSection === "sesiones" && (
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Profesional *</label>
                  <select value={sessionForm.professional} onChange={(e) => setSessionForm({ ...sessionForm, professional: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none">
                    {PROFESSIONALS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Servicio *</label>
                  <select value={sessionForm.service_type} onChange={(e) => setSessionForm({ ...sessionForm, service_type: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none">
                    {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                  <input type="date" value={sessionForm.session_date} onChange={(e) => setSessionForm({ ...sessionForm, session_date: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">EVA (0-10)</label>
                  <input type="number" min="0" max="10" value={sessionForm.eva_score}
                    onChange={(e) => setSessionForm({ ...sessionForm, eva_score: e.target.value })}
                    placeholder="Dolor percibido"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notas clínicas</label>
                  <textarea value={sessionForm.notes} onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })} rows={3}
                    placeholder="Hallazgos, técnicas utilizadas, evolución..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none" />
                </div>
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
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* === PAGOS === */}
      {activeSection === "pagos" && (
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
                    {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo *</label>
                  <select value={paymentForm.payment_type} onChange={(e) => setPaymentForm({ ...paymentForm, payment_type: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-700 focus:outline-none">
                    {PAYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
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
              {payments.map((p) => (
                <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        ${p.amount.toLocaleString("es-CL")}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                        {p.payment_type}
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
                    <span>{p.method}</span>
                    {p.service_type && <span>{p.service_type}</span>}
                    {p.pack_name && <span>{p.pack_name}</span>}
                    {p.sessions_purchased > 1 && <span>{p.sessions_purchased} sesiones</span>}
                    {p.reference && <span>Ref: {p.reference}</span>}
                  </div>
                  {p.notes && <p className="text-sm text-slate-600 mt-1">{p.notes}</p>}
                  <p className="text-[11px] text-slate-400 mt-1">Registrado por: {p.registered_by}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
