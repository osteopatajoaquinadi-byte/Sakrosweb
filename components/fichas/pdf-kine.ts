"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { KinePlan } from "./constants";
import { FMS_TESTS, SFMA_DETAIL, OBJECTIVES } from "./constants";

/* ── Types ── */
export interface PatientInfo {
  name: string;
  rut: string | null;
  date_of_birth: string | null;
  sex: string | null;
  address: string | null;
  occupation: string | null;
  sport: string | null;
  reason: string | null;
  email: string | null;
  phone: string | null;
}

export interface SessionInfo {
  session_date: string;
  professional: string;
  eva_score: number | null;
  notes?: string;
  clinical_data?: Record<string, unknown> | null;
}

/* ── Helpers ── */
const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function fmtDateLong(iso: string): string {
  const dt = new Date(iso + "T12:00:00");
  const day = DAY_NAMES[dt.getDay()];
  const [y, m, d] = iso.split("-");
  return `${day} ${d}/${m}/${y}`;
}

function sexLabel(s: string | null): string {
  if (!s) return "";
  if (s === "M") return "Masculino";
  if (s === "F") return "Femenino";
  return "Otro";
}

function calcAge(dob: string | null): string {
  if (!dob) return "";
  const birth = new Date(dob + "T12:00:00");
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return `${age} anos`;
}

/** Calculate 10 business days (Mon-Fri) starting from startDate */
function getBusinessDays(startDate: string, count: number): string[] {
  const dates: string[] = [];
  const dt = new Date(startDate + "T12:00:00");
  while (dates.length < count) {
    const dow = dt.getDay();
    if (dow >= 1 && dow <= 5) {
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, "0");
      const d = String(dt.getDate()).padStart(2, "0");
      dates.push(`${y}-${m}-${d}`);
    }
    dt.setDate(dt.getDate() + 1);
  }
  return dates;
}

/** Load the Sakros logo as base64 data URL */
async function loadLogo(): Promise<string> {
  const res = await fetch("/images/logo-sakros.png");
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

/** Shared header: logo + clinic info */
function drawHeader(doc: jsPDF, logoData: string, y: number): number {
  // Logo — aspect ratio ~2.09:1, draw at 50x24
  doc.addImage(logoData, "PNG", 14, y, 50, 24);

  // Clinic info to the right
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  const info = [
    "Clinica Sakros",
    "Adi y Arentsen Limitada",
    "Vina del Mar, Chile",
    "+56 9 6847 7060",
    "contacto@sakros.cl",
  ];
  info.forEach((line, i) => {
    doc.text(line, 196, y + 6 + i * 4, { align: "right" });
  });

  // Line separator
  doc.setDrawColor(200, 148, 58); // #C8943A
  doc.setLineWidth(0.5);
  doc.line(14, y + 28, 196, y + 28);

  return y + 34;
}

/* ══════════════════════════════════════════════════════════
   1. CERTIFICADO DE ATENCIONES KINESICAS
   ══════════════════════════════════════════════════════════ */
export async function generateCertificado(
  patient: PatientInfo,
  startDate: string,
  professional: string,
): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const logoData = await loadLogo();
  const pageW = 216;

  let y = drawHeader(doc, logoData, 12);

  // Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 74, 107); // #1A4A6B
  doc.text("CERTIFICADO DE ATENCIONES KINESICAS", pageW / 2, y + 4, { align: "center" });
  y += 14;

  // Date of issue
  const today = new Date();
  const todayStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(`Fecha de emision: ${todayStr}`, 196, y, { align: "right" });
  y += 8;

  // Patient info
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  doc.text("DATOS DEL PACIENTE", 14, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const patientLines = [
    ["Nombre", patient.name],
    ["RUT", patient.rut || "No registrado"],
    ["Fecha de nacimiento", patient.date_of_birth ? `${fmtDate(patient.date_of_birth)} (${calcAge(patient.date_of_birth)})` : "No registrada"],
    ["Direccion", patient.address || "No registrada"],
  ];
  patientLines.forEach(([label, val]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}: `, 14, y);
    const labelW = doc.getTextWidth(`${label}: `);
    doc.setFont("helvetica", "normal");
    doc.text(val, 14 + labelW, y);
    y += 5.5;
  });
  y += 4;

  // Certificate body text
  const businessDays = getBusinessDays(startDate, 10);
  const firstDate = fmtDate(businessDays[0]);
  const lastDate = fmtDate(businessDays[9]);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 40, 40);

  const bodyText =
    `Por medio del presente certificado, se deja constancia que el/la paciente ` +
    `${patient.name}, RUT ${patient.rut || "no registrado"}, ha realizado un plan de ` +
    `tratamiento kinesico de 10 sesiones en Clinica Sakros, desde el ${firstDate} ` +
    `hasta el ${lastDate}.`;

  const lines = doc.splitTextToSize(bodyText, 170);
  doc.text(lines, 14, y);
  y += lines.length * 5 + 6;

  // Attendance table
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("DETALLE DE ATENCIONES", 14, y);
  y += 4;

  const tableData = businessDays.map((d, i) => [
    String(i + 1),
    fmtDateLong(d),
    "Kinesioterapia",
    "Realizada",
  ]);

  autoTable(doc, {
    startY: y,
    head: [["N", "Fecha", "Prestacion", "Estado"]],
    body: tableData,
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: {
      fillColor: [26, 74, 107],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [245, 245, 240] },
    columnStyles: {
      0: { halign: "center", cellWidth: 12 },
      1: { cellWidth: 55 },
      2: { cellWidth: 50 },
      3: { halign: "center", cellWidth: 28 },
    },
    margin: { left: 14, right: 14 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 10;

  // Payment note
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(`Fecha de pago: ${fmtDate(startDate)}`, 14, y);
  y += 5;
  doc.text("Valor total: Segun convenio y/o plan de tratamiento acordado.", 14, y);
  y += 12;

  // Closing
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text("Se extiende el presente certificado a solicitud del interesado/a.", 14, y);
  y += 20;

  // Signature line
  doc.setDrawColor(40, 40, 40);
  doc.line(14, y, 90, y);
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(professional, 14, y);
  y += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Kinesiologo/a - Clinica Sakros", 14, y);

  // Download
  doc.save(`Certificado_Kine_${patient.name.replace(/\s+/g, "_")}.pdf`);
}

/* ══════════════════════════════════════════════════════════
   2. INFORME DE ATENCION KINESICA (para ISAPRE)
   ══════════════════════════════════════════════════════════ */

/** Returns list of missing fields needed for the report */
export function checkInformeMissing(
  patient: PatientInfo,
  plan: KinePlan,
  sessions: SessionInfo[],
): string[] {
  const missing: string[] = [];
  if (!patient.rut) missing.push("RUT del paciente");
  if (!plan.motivo) missing.push("Diagnostico / Motivo de consulta");
  if (sessions.length === 0) missing.push("Al menos 1 sesion registrada");
  // Check if there's any evaluation data
  const hasEval =
    plan.evalMusculo ||
    plan.caracteristicasDolor ||
    plan.tipoDolor.length > 0 ||
    Object.values(plan.fms).some((t) => t.score !== null) ||
    Object.values(plan.sfma).some((p) => p.cls !== null);
  if (!hasEval) missing.push("Datos de evaluacion (FMS, SFMA o evaluacion muscular)");
  return missing;
}

export async function generateInforme(
  patient: PatientInfo,
  plan: KinePlan,
  sessions: SessionInfo[],
  professional: string,
): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const logoData = await loadLogo();
  const pageW = 216;
  const maxY = 260; // leave margin for footer

  let y = drawHeader(doc, logoData, 12);

  const checkPage = (needed: number) => {
    if (y + needed > maxY) {
      doc.addPage();
      y = drawHeader(doc, logoData, 12);
    }
  };

  // Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 74, 107);
  doc.text("INFORME DE ATENCION KINESICA", pageW / 2, y + 4, { align: "center" });
  y += 14;

  // Date
  const today = new Date();
  const todayStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(`Fecha de emision: ${todayStr}`, 196, y, { align: "right" });
  y += 8;

  /* ── Section helper ── */
  const sectionTitle = (title: string) => {
    checkPage(16);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 74, 107);
    doc.text(title, 14, y);
    y += 2;
    doc.setDrawColor(200, 148, 58);
    doc.setLineWidth(0.3);
    doc.line(14, y, 196, y);
    y += 5;
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
  };

  const fieldLine = (label: string, value: string) => {
    checkPage(6);
    doc.setFont("helvetica", "bold");
    doc.text(`${label}: `, 14, y);
    const lw = doc.getTextWidth(`${label}: `);
    doc.setFont("helvetica", "normal");
    const wrapped = doc.splitTextToSize(value || "No registrado", 170 - lw);
    doc.text(wrapped, 14 + lw, y);
    y += wrapped.length * 4.5 + 1.5;
  };

  const paragraph = (text: string) => {
    checkPage(10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(text, 172);
    doc.text(lines, 14, y);
    y += lines.length * 4.5 + 2;
  };

  /* ── 1. Patient Data ── */
  sectionTitle("1. ANTECEDENTES DEL PACIENTE");
  fieldLine("Nombre", patient.name);
  fieldLine("RUT", patient.rut || "No registrado");
  if (patient.date_of_birth)
    fieldLine("Fecha de nacimiento", `${fmtDate(patient.date_of_birth)} (${calcAge(patient.date_of_birth)})`);
  if (patient.sex) fieldLine("Sexo", sexLabel(patient.sex));
  if (patient.address) fieldLine("Direccion", patient.address);
  if (plan.ocupacion) fieldLine("Ocupacion", plan.ocupacion);
  if (plan.actividadFisica) fieldLine("Actividad fisica", plan.actividadFisica);
  y += 3;

  /* ── 2. Diagnosis ── */
  sectionTitle("2. DIAGNOSTICO KINESICO");
  fieldLine("Motivo de consulta", plan.motivo);
  if (plan.anamnesis) {
    fieldLine("Anamnesis", plan.anamnesis);
  }
  if (plan.enfermedades) {
    fieldLine("Antecedentes morbidos", plan.enfermedades);
  }
  if (plan.tipoDolor.length > 0) {
    fieldLine("Tipo de dolor", plan.tipoDolor.join(", "));
  }
  if (plan.caracteristicasDolor) {
    fieldLine("Caracteristicas del dolor", plan.caracteristicasDolor);
  }
  y += 3;

  /* ── 3. Evaluation ── */
  sectionTitle("3. EVALUACION KINESICA");

  // FMS
  const fmsScored = FMS_TESTS.filter((t) => plan.fms[t]?.score !== null);
  if (fmsScored.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("FMS (Functional Movement Screen)", 14, y);
    y += 4;

    const fmsData = fmsScored.map((t) => {
      const entry = plan.fms[t];
      return [t, String(entry.score ?? ""), entry.notes || ""];
    });
    const fmsTotal = fmsScored.reduce((s, t) => s + (plan.fms[t].score ?? 0), 0);
    fmsData.push(["TOTAL", String(fmsTotal) + "/21", ""]);

    autoTable(doc, {
      startY: y,
      head: [["Test", "Puntaje", "Observacion"]],
      body: fmsData,
      styles: { fontSize: 8, cellPadding: 1.5 },
      headStyles: { fillColor: [26, 74, 107], textColor: [255, 255, 255], fontStyle: "bold" },
      columnStyles: { 0: { cellWidth: 55 }, 1: { halign: "center", cellWidth: 22 } },
      margin: { left: 14, right: 14 },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 5;
  }

  // SFMA
  const sfmaScored = SFMA_DETAIL.filter((p) => plan.sfma[p.key]?.cls !== null);
  if (sfmaScored.length > 0) {
    checkPage(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("SFMA (Selective Functional Movement Assessment)", 14, y);
    y += 4;

    const sfmaLabels: Record<string, string> = {
      FN: "Funcional No doloroso",
      DN: "Disfuncional No doloroso",
      FP: "Funcional Doloroso",
      DP: "Disfuncional Doloroso",
    };
    const sfmaData = sfmaScored.map((p) => {
      const entry = plan.sfma[p.key];
      return [p.name, sfmaLabels[entry.cls!] || "", entry.tipo || "", entry.notes || ""];
    });
    autoTable(doc, {
      startY: y,
      head: [["Patron", "Clasificacion", "Tipo", "Obs."]],
      body: sfmaData,
      styles: { fontSize: 8, cellPadding: 1.5 },
      headStyles: { fillColor: [26, 74, 107], textColor: [255, 255, 255], fontStyle: "bold" },
      margin: { left: 14, right: 14 },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 5;
  }

  // Other eval notes
  if (plan.evalMusculo) {
    checkPage(10);
    fieldLine("Evaluacion muscular", plan.evalMusculo);
  }
  if (plan.evalNotes) {
    fieldLine("Observaciones de evaluacion", plan.evalNotes);
  }
  if (plan.metabolico) fieldLine("Evaluacion metabolica", plan.metabolico);
  if (plan.craneal) fieldLine("Evaluacion craneal", plan.craneal);
  if (plan.calidadSueno) fieldLine("Calidad de sueno", plan.calidadSueno);
  y += 3;

  /* ── 4. Treatment Plan ── */
  sectionTitle("4. PLAN DE TRATAMIENTO");

  const activeObjectives = OBJECTIVES.filter((o) => plan.checkedObjectives[o.id]);
  if (activeObjectives.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("Objetivos terapeuticos:", 14, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    activeObjectives.forEach((o) => {
      checkPage(6);
      doc.text(`- ${o.label}`, 18, y);
      y += 4.5;
    });
    y += 2;
  }

  const blockLabels: Record<string, string> = {
    mobilization: "Movilizacion",
    motorControl: "Control Motor",
    load: "Carga",
  };
  (["mobilization", "motorControl", "load"] as const).forEach((bk) => {
    const block = plan.blocks[bk];
    if (block.desc || block.obj) {
      checkPage(12);
      doc.setFont("helvetica", "bold");
      doc.text(`${blockLabels[bk]}:`, 14, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      if (block.obj) { paragraph(`Objetivo: ${block.obj}`); }
      if (block.desc) { paragraph(block.desc); }
    }
  });

  if (plan.ejercicios) {
    fieldLine("Ejercicios indicados", plan.ejercicios);
  }
  y += 3;

  /* ── 5. Sessions ── */
  checkPage(20);
  sectionTitle("5. SESIONES REALIZADAS");

  if (sessions.length > 0) {
    const sessData = sessions.map((s, i) => [
      String(i + 1),
      fmtDate(s.session_date),
      s.professional,
      s.eva_score !== null ? `${s.eva_score}/10` : "-",
      s.notes || "",
    ]);
    autoTable(doc, {
      startY: y,
      head: [["N", "Fecha", "Profesional", "EVA", "Notas"]],
      body: sessData,
      styles: { fontSize: 8, cellPadding: 1.5 },
      headStyles: { fillColor: [26, 74, 107], textColor: [255, 255, 255], fontStyle: "bold" },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        1: { cellWidth: 24 },
        2: { cellWidth: 35 },
        3: { halign: "center", cellWidth: 16 },
      },
      margin: { left: 14, right: 14 },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 5;

    // EVA progression summary
    const evaScores = sessions
      .filter((s) => s.eva_score !== null)
      .map((s) => s.eva_score as number);
    if (evaScores.length >= 2) {
      checkPage(10);
      const first = evaScores[0];
      const last = evaScores[evaScores.length - 1];
      const diff = first - last;
      paragraph(
        `Evolucion del dolor (EVA): Inicio ${first}/10, final ${last}/10. ` +
        (diff > 0 ? `Reduccion de ${diff} puntos.` : diff === 0 ? "Sin cambios." : `Aumento de ${Math.abs(diff)} puntos.`),
      );
    }
  } else {
    paragraph("No se han registrado sesiones.");
  }
  y += 3;

  /* ── 6. Current Status ── */
  checkPage(30);
  sectionTitle("6. ESTADO ACTUAL DEL PACIENTE");
  paragraph(
    "Al momento de la reevaluacion, el/la paciente presenta la evolucion clinica " +
    "detallada en las sesiones anteriores. Se sugiere continuar con el plan de " +
    "tratamiento segun indicacion del profesional tratante.",
  );
  y += 3;

  /* ── Closing ── */
  checkPage(30);
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(80, 80, 80);
  paragraph("Se extiende el presente informe para ser presentado ante su ISAPRE/Fonasa.");
  y += 12;

  // Signature
  doc.setDrawColor(40, 40, 40);
  doc.line(14, y, 90, y);
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text(professional, 14, y);
  y += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Kinesiologo/a - Clinica Sakros", 14, y);

  // Download
  doc.save(`Informe_Kine_${patient.name.replace(/\s+/g, "_")}.pdf`);
}
