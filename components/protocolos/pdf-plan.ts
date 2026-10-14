"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { siteConfig } from "@/lib/site-config";
import { getEjercicio } from "@/lib/protocolos/ejercicios";
import type { ItemPlan, PerfilProfesional } from "@/lib/protocolos/types";

export interface DatosPlan {
  paciente: string;
  fecha: string; // AAAA-MM-DD
  protocolo: string;
  indicaciones: string;
  items: ItemPlan[];
}

// Las fuentes estándar de jsPDF solo cubren Latin-1: los símbolos fuera de
// ese rango se reemplazan para que no salgan caracteres rotos.
function t(s: string): string {
  return s
    .replace(/≥/g, ">=")
    .replace(/≤/g, "<=")
    .replace(/[–—]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/→/g, "->")
    .replace(/…/g, "...")
    .replace(/[^\x00-\xFF]/g, "");
}

function fmtFecha(iso: string): string {
  const [y, m, d] = iso.split("-");
  return d && m && y ? `${d}/${m}/${y}` : iso;
}

function formato(dataUrl: string): "PNG" | "JPEG" {
  return dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
}

/** Dibuja una imagen ajustada a una caja, conservando la proporción. */
function imagenEnCaja(doc: jsPDF, dataUrl: string, x: number, y: number, maxW: number, maxH: number) {
  const props = doc.getImageProperties(dataUrl);
  const ratio = Math.min(maxW / props.width, maxH / props.height);
  const w = props.width * ratio;
  const h = props.height * ratio;
  doc.addImage(dataUrl, formato(dataUrl), x, y, w, h);
  return { w, h };
}

const DORADO: [number, number, number] = [200, 148, 58]; // #C8943A
const TEAL: [number, number, number] = [15, 118, 110];

export function generarPlanPdf(datos: DatosPlan, perfil: PerfilProfesional): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 14;

  // ── Encabezado: logo del profesional + datos ──
  let y = 12;
  if (perfil.logo) {
    try {
      imagenEnCaja(doc, perfil.logo, M, y, 50, 22);
    } catch {
      /* imagen inválida: se omite */
    }
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  [perfil.nombre, perfil.profesion, perfil.registro && `Registro: ${perfil.registro}`, perfil.centro, perfil.contacto]
    .filter(Boolean)
    .forEach((line, i) => doc.text(t(line as string), W - M, y + 4 + i * 4, { align: "right" }));
  doc.setDrawColor(...DORADO);
  doc.setLineWidth(0.5);
  doc.line(M, y + 26, W - M, y + 26);
  y += 34;

  // ── Título y paciente ──
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Plan de ejercicios personalizado", M, y);
  y += 7;
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text(t(`Paciente: ${datos.paciente || "-"}`), M, y);
  doc.text(t(`Fecha: ${fmtFecha(datos.fecha)}`), W - M, y, { align: "right" });
  y += 5;
  if (datos.protocolo) {
    doc.text(t(`Protocolo de referencia: ${datos.protocolo}`), M, y);
    y += 5;
  }

  if (datos.indicaciones.trim()) {
    y += 2;
    doc.setFont("helvetica", "bold");
    doc.text("Indicaciones", M, y);
    y += 4.5;
    doc.setFont("helvetica", "normal");
    const lineas = doc.splitTextToSize(t(datos.indicaciones.trim()), W - 2 * M);
    doc.text(lineas, M, y);
    y += lineas.length * 4.2;
  }
  y += 3;

  // ── Tabla de ejercicios, agrupada por fase ──
  const fases = [...new Set(datos.items.map((i) => i.fase || "Ejercicios"))];
  let n = 0;
  const body: (string | { content: string; colSpan?: number; styles?: object })[][] = [];
  const videos = new Map<number, string>();
  for (const fase of fases) {
    if (fases.length > 1) {
      body.push([{ content: t(fase), colSpan: 4, styles: { fillColor: [240, 247, 246], textColor: TEAL, fontStyle: "bold" } }]);
    }
    for (const it of datos.items.filter((i) => (i.fase || "Ejercicios") === fase)) {
      n++;
      const ej = getEjercicio(it.ejercicioId);
      const como = [ej?.ejecucion, it.notas && `Nota: ${it.notas}`].filter(Boolean).join("\n");
      if (ej?.video) videos.set(body.length, `${siteConfig.url}${ej.video}`);
      body.push([
        String(n),
        t(it.nombre) + (ej?.equipo && ej.equipo !== "Ninguno" && !it.nombre.includes(ej.equipo) ? `\n(${t(ej.equipo)})` : ""),
        t(como),
        t(it.dosis),
      ]);
    }
  }

  autoTable(doc, {
    startY: y,
    head: [["#", "Ejercicio", "Cómo hacerlo", "Dosis"]],
    body,
    margin: { left: M, right: M },
    rowPageBreak: "avoid",
    styles: { fontSize: 8.5, cellPadding: 2.2, valign: "top", overflow: "linebreak" },
    headStyles: { fillColor: TEAL, textColor: 255, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 42, fontStyle: "bold" },
      2: { cellWidth: "auto" },
      3: { cellWidth: 36 },
    },
    didDrawCell: (data) => {
      // Enlace "Ver video" bajo el nombre del ejercicio, si tiene video propio
      const url = videos.get(data.row.index);
      if (data.section === "body" && data.column.index === 1 && url) {
        doc.setFontSize(7.5);
        doc.setTextColor(...TEAL);
        doc.textWithLink("> Ver video", data.cell.x + 2.2, data.cell.y + data.cell.height - 2, { url });
        doc.setTextColor(30, 30, 30);
      }
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 1 && videos.has(data.row.index)) {
        data.cell.styles.minCellHeight = 16;
      }
    },
  });

  // ── Cierre: advertencia + firma ──
  type ConTabla = jsPDF & { lastAutoTable?: { finalY: number } };
  y = ((doc as ConTabla).lastAutoTable?.finalY ?? y) + 8;
  if (y > H - 60) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(8);
  doc.setTextColor(110, 110, 110);
  const aviso = doc.splitTextToSize(
    t(
      "Realiza los ejercicios con molestia tolerable (hasta 3-4 de 10) que desaparezca en menos de 24 horas. " +
        "Si aparece dolor intenso, hinchazón, fiebre u otro síntoma nuevo, suspende y contacta a tu profesional.",
    ),
    W - 2 * M,
  );
  doc.text(aviso, M, y);
  y += aviso.length * 3.8 + 10;

  const cx = W - M - 35;
  if (perfil.firma) {
    try {
      const { h } = imagenEnCaja(doc, perfil.firma, cx - 25, y, 50, 20);
      y += h + 1;
    } catch {
      y += 20;
    }
  } else {
    y += 18;
  }
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.3);
  doc.line(cx - 30, y, cx + 30, y);
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "bold");
  doc.text(t(perfil.nombre || "Profesional tratante"), cx, y + 4.5, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  [perfil.profesion, perfil.registro && `Registro: ${perfil.registro}`]
    .filter(Boolean)
    .forEach((l, i) => doc.text(t(l as string), cx, y + 8.5 + i * 3.8, { align: "center" }));

  // Pie de página en todas las hojas
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(t(`${perfil.centro || perfil.nombre} · Página ${p} de ${total}`), W / 2, H - 6, { align: "center" });
  }
  return doc;
}

export function nombreArchivo(datos: DatosPlan): string {
  const base = (datos.paciente || "paciente")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `plan-ejercicios-${base}-${datos.fecha}.pdf`;
}
