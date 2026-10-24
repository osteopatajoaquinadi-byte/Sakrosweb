"use client";

import { useEffect, useState } from "react";
import type jsPDF from "jspdf";
import type { KinePlan } from "./constants";
import {
  certificadoFilename,
  checkInformeMissing,
  generateCertificado,
  generateInforme,
  informeFilename,
  type PatientInfo,
  type SessionInfo,
} from "./pdf-kine";

type Cita = { date: string; time: string };
type Modo = "reales" | "seguidas";
type Servicio = "Kinesiología" | "Osteopatía";

const inputCls =
  "w-full rounded-lg border border-[#CEC8BE] bg-white px-3 py-2 text-sm text-[#0B3D2E] focus:border-[#C8943A] focus:outline-none focus:ring-1 focus:ring-[#C8943A]/40";
const btnPrimario =
  "rounded-lg bg-[#0B3D2E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0B3D2E]/90 disabled:opacity-40 disabled:cursor-not-allowed";
const btnSecundario =
  "rounded-lg border border-[#0B3D2E] px-4 py-2 text-xs font-semibold text-[#0B3D2E] hover:bg-[#0B3D2E]/5 disabled:opacity-40 disabled:cursor-not-allowed";

const FIRMANTES = ["Joaquín Adi A.", "Anikken Arentsen", "Camilo Zamora", "Edison"];
const norm = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(" ")[0];

const fecha = (d: string) => {
  const [y, m, dd] = d.split("-");
  return `${dd}/${m}/${y}`;
};

// Certificado (sesiones reales o seguidas) e informe kinésico:
// descargar en PDF o enviar directo al correo del paciente.
export default function DocumentosKine({
  patient,
  patientId,
  plan,
  sessions,
  professional,
  servicioInicial = "Kinesiología",
  conInforme = true,
}: {
  patient: PatientInfo;
  patientId?: string;
  plan?: KinePlan;
  sessions?: SessionInfo[];
  professional: string;
  servicioInicial?: Servicio;
  // false: solo el certificado (pestaña Documentos de la ficha)
  conInforme?: boolean;
}) {
  const [servicio, setServicio] = useState<Servicio>(servicioInicial);
  const [certDate, setCertDate] = useState("");
  const [modo, setModo] = useState<Modo>("reales");
  const [cantidad, setCantidad] = useState("10");
  const [cargando, setCargando] = useState<string | null>(null);
  const [informeWarnings, setInformeWarnings] = useState<string[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [firma, setFirma] = useState(professional);
  // Firma digital (imagen) del profesional con la sesión abierta, si tiene
  const [firmaDigital, setFirmaDigital] = useState<{ nombre: string; img: string } | null>(null);

  // La firma parte con el profesional que tiene la sesión abierta.
  useEffect(() => {
    let vigente = true;
    fetch("/api/equipo/firma")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (vigente && d?.firma && d?.nombre) setFirmaDigital({ nombre: d.nombre, img: d.firma });
      })
      .catch(() => {});
    fetch("/api/equipo/me")
      .then((r) => r.json())
      .then((d) => {
        const nombre = d?.user?.display_name as string | undefined;
        const match = nombre && FIRMANTES.find((f) => norm(f) === norm(nombre));
        if (vigente && match) setFirma(match);
      })
      .catch(() => {});
    return () => {
      vigente = false;
    };
  }, []);

  // Sesiones de Kinesiología realizadas en el calendario desde la fecha de pago
  const [citas, setCitas] = useState<{ key: string; lista: Cita[] | null; error: string } | null>(null);
  const citasKey = `${patientId}|${certDate}|${servicio}`;
  useEffect(() => {
    if (!patientId || !certDate || modo !== "reales") return;
    let vigente = true;
    const q = new URLSearchParams({ patient_id: patientId, from: certDate, service: servicio });
    fetch(`/api/fichas/payments/calendario?${q}`)
      .then((r) => r.json())
      .then((d) => {
        if (!vigente) return;
        if (d.error) setCitas({ key: citasKey, lista: null, error: d.error });
        else setCitas({ key: citasKey, lista: (d.done ?? []).map((c: Cita) => ({ date: c.date, time: c.time })), error: "" });
      })
      .catch(() => vigente && setCitas({ key: citasKey, lista: null, error: "Error de conexión." }));
    return () => {
      vigente = false;
    };
  }, [patientId, certDate, modo, citasKey, servicio]);

  const citasActuales = citas?.key === citasKey ? citas : null;
  const nSeguidas = Math.max(1, Math.min(60, parseInt(cantidad) || 10));
  const certListo =
    !!certDate && (modo === "seguidas" || (!!citasActuales?.lista && citasActuales.lista.length > 0));
  const correo = patient.email?.trim() || "";

  async function crearCertificado() {
    return generateCertificado(
      patient,
      certDate,
      firma,
      {
        ...(modo === "reales" ? { sesiones: citasActuales?.lista ?? [] } : { cantidad: nSeguidas }),
        servicio,
        firmaImg: usaFirmaDigital ? firmaDigital!.img : null,
      },
    );
  }

  const usaFirmaDigital = !!firmaDigital && firmaDigital.nombre === firma;

  function sesionesInforme() {
    if (!plan || !sessions) return false;
    const missing = checkInformeMissing(patient, plan, sessions);
    setInformeWarnings(missing);
    return missing.length === 0;
  }

  async function enviarPorCorreo(doc: jsPDF, filename: string, subject: string, message: string) {
    if (!patientId) return;
    const res = await fetch(`/api/fichas/patients/${patientId}/correo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject,
        message,
        attachment: { filename, content: doc.output("datauristring").split(",")[1], type: "application/pdf" },
      }),
    });
    const d = await res.json().catch(() => ({}));
    setMsg(res.ok ? { ok: true, text: `Enviado a ${d.to || correo}.` } : { ok: false, text: d.error || "No se pudo enviar el correo." });
  }

  async function accion(tipo: "cert" | "informe", destino: "descargar" | "correo") {
    setMsg(null);
    if (tipo === "informe" && !sesionesInforme()) return;
    if (destino === "correo" && !confirm(`¿Enviar el ${tipo === "cert" ? "certificado" : "informe"} a ${correo}?`)) return;
    setCargando(`${tipo}-${destino}`);
    try {
      const doc = tipo === "cert" ? await crearCertificado() : await generateInforme(patient, plan!, sessions!, firma);
      const filename = tipo === "cert" ? certificadoFilename(patient.name, servicio) : informeFilename(patient.name);
      if (destino === "descargar") {
        doc.save(filename);
      } else if (tipo === "cert") {
        await enviarPorCorreo(
          doc,
          filename,
          servicio === "Osteopatía" ? "Certificado de atenciones de osteopatía" : "Certificado de atenciones kinésicas",
          `Te enviamos adjunto tu certificado de atenciones ${servicio === "Osteopatía" ? "de osteopatía" : "kinésicas"} en Clínica Sakros.\n\nSi necesitas algún dato adicional, responde este correo.`,
        );
      } else {
        await enviarPorCorreo(
          doc,
          filename,
          "Informe de atención kinésica",
          "Te enviamos adjunto tu informe de atención kinésica, para presentarlo en tu Isapre o Fonasa.\n\nSi necesitas algún dato adicional, responde este correo.",
        );
      }
    } catch (err) {
      console.error("Documento kinésico:", err);
      setMsg({ ok: false, text: "No se pudo generar el documento." });
    } finally {
      setCargando(null);
    }
  }

  const sinCorreo = !correo || !patientId;

  return (
    <div className="mt-6 rounded-xl border border-[#CEC8BE] bg-white p-4 shadow-sm">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-[#0B3D2E]">Documentos</h3>
        <label className="flex items-center gap-2 text-[11px] font-semibold text-[#9C9687]">
          Firma
          <select value={firma} onChange={(e) => setFirma(e.target.value)} className="rounded-lg border border-[#CEC8BE] bg-white px-2 py-1 text-xs text-[#0B3D2E]">
            {(FIRMANTES.includes(firma) ? FIRMANTES : [firma, ...FIRMANTES]).map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </label>
      </div>
      <p className="mb-3 text-[11px] text-[#9C9687]">
        {sinCorreo ? "El paciente no tiene correo en su ficha: agrégalo con Editar para poder enviarlos." : `Se envían a ${correo}.`}
      </p>

      {/* Certificado */}
      <div className="rounded-lg border border-[#CEC8BE] bg-[#FAFAF8] p-3 mb-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold text-[#0B3D2E]">
            Certificado de Atenciones {servicio === "Osteopatía" ? "de Osteopatía" : "Kinésicas"}
          </p>
          <select value={servicio} onChange={(e) => setServicio(e.target.value as Servicio)}
            className="rounded-lg border border-[#CEC8BE] bg-white px-2 py-1 text-xs text-[#0B3D2E]">
            <option value="Osteopatía">Osteopatía</option>
            <option value="Kinesiología">Kinesiología</option>
          </select>
        </div>
        {usaFirmaDigital && <p className="mb-2 text-[11px] font-semibold text-emerald-700">✓ Lleva tu firma digital</p>}

        <div className="mb-2 flex flex-col gap-1.5 text-xs text-[#0B3D2E]">
          <label className="flex items-center gap-2">
            <input type="radio" name="modo-cert" checked={modo === "reales"} onChange={() => setModo("reales")} />
            Sesiones reales del calendario (fechas y horas en que vino)
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="modo-cert" checked={modo === "seguidas"} onChange={() => setModo("seguidas")} />
            Sesiones seguidas (días hábiles, lunes a viernes)
          </label>
        </div>

        <div className="flex items-end gap-2 flex-wrap">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-[11px] font-semibold text-[#9C9687] mb-1">Fecha de pago (inicio)</label>
            <input type="date" value={certDate} onChange={(e) => setCertDate(e.target.value)} className={inputCls} />
          </div>
          {modo === "seguidas" && (
            <div className="w-28">
              <label className="block text-[11px] font-semibold text-[#9C9687] mb-1">N° sesiones</label>
              <input type="number" min={1} max={60} value={cantidad} onChange={(e) => setCantidad(e.target.value)} className={inputCls} />
            </div>
          )}
        </div>

        {modo === "reales" && certDate && (
          <p className="mt-2 text-[11px] text-[#0B3D2E]">
            {!patientId
              ? "No se puede consultar el calendario."
              : !citasActuales
                ? "Buscando sesiones en el calendario…"
                : citasActuales.error
                  ? citasActuales.error
                  : citasActuales.lista!.length === 0
                    ? `No hay sesiones de ${servicio} realizadas desde esa fecha. Usa la opción de sesiones seguidas.`
                    : `${citasActuales.lista!.length} ${citasActuales.lista!.length === 1 ? "sesión realizada" : "sesiones realizadas"}: ${citasActuales.lista!.map((c) => fecha(c.date)).join(", ")}`}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => accion("cert", "descargar")} disabled={!certListo || !!cargando} className={btnPrimario}>
            {cargando === "cert-descargar" ? "Generando…" : "Descargar PDF"}
          </button>
          <button type="button" onClick={() => accion("cert", "correo")} disabled={!certListo || !!cargando || sinCorreo} className={btnSecundario}>
            {cargando === "cert-correo" ? "Enviando…" : "✉ Enviar por correo"}
          </button>
        </div>
      </div>

      {/* Informe */}
      {conInforme && plan && sessions && (
      <div className="rounded-lg border border-[#CEC8BE] bg-[#FAFAF8] p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-[#0B3D2E]">Informe de Atención Kinésica</span>
          <span className="text-[10px] text-[#9C9687]">(para Isapre / Fonasa)</span>
        </div>

        {informeWarnings.length > 0 && (
          <div className="rounded-lg bg-amber-50 border border-amber-300 p-2.5 mb-2">
            <p className="text-xs font-semibold text-amber-700 mb-1">Información faltante — completa antes de generar:</p>
            <ul className="list-disc list-inside text-xs text-amber-600 space-y-0.5">
              {informeWarnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => accion("informe", "descargar")} disabled={!!cargando} className={btnPrimario}>
            {cargando === "informe-descargar" ? "Generando…" : "Descargar Informe PDF"}
          </button>
          <button type="button" onClick={() => accion("informe", "correo")} disabled={!!cargando || sinCorreo} className={btnSecundario}>
            {cargando === "informe-correo" ? "Enviando…" : "✉ Enviar por correo"}
          </button>
        </div>
      </div>

      )}

      {msg && <p className={`mt-3 text-xs font-semibold ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.ok ? "✓ " : ""}{msg.text}</p>}
    </div>
  );
}
