"use client";

import jsPDF from "jspdf";
import { siteConfig } from "@/lib/site-config";
import { CREDITO_IMAGENES, getEjercicio } from "@/lib/protocolos/ejercicios";
import type { ItemPlan, PerfilProfesional } from "@/lib/protocolos/types";

export interface DatosPlan {
  paciente: string;
  fecha: string; // AAAA-MM-DD
  protocolo: string;
  indicaciones: string;
  items: ItemPlan[];
}

/** Fotos ya cargadas como data URL, por ruta pública (/images/ejercicios/...). */
export type ImagenesCargadas = Map<string, string>;

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

/** Descarga las fotos de los ejercicios del plan (en el navegador). */
export async function cargarImagenes(items: ItemPlan[]): Promise<ImagenesCargadas> {
  const rutas = [...new Set(items.flatMap((i) => getEjercicio(i.ejercicioId)?.imagenes ?? []))];
  const out: ImagenesCargadas = new Map();
  await Promise.all(
    rutas.map(async (ruta) => {
      try {
        const blob = await (await fetch(ruta)).blob();
        const data = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onloadend = () => resolve(r.result as string);
          r.onerror = reject;
          r.readAsDataURL(blob);
        });
        out.set(ruta, data);
      } catch {
        /* sin foto: la ficha queda solo con texto */
      }
    }),
  );
  return out;
}

const DORADO: [number, number, number] = [200, 148, 58]; // #C8943A
const TEAL: [number, number, number] = [15, 118, 110];
const TEXTO: [number, number, number] = [40, 40, 40];
const GRIS: [number, number, number] = [110, 110, 110];

export function generarPlanPdf(datos: DatosPlan, perfil: PerfilProfesional, imagenes: ImagenesCargadas = new Map()): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 14;
  const ANCHO = W - 2 * M;
  const LIMITE = H - 16;
  const LH = 3.9; // alto de línea a 8.5 pt

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
  doc.setTextColor(...GRIS);
  [perfil.nombre, perfil.profesion, perfil.registro && `Registro: ${perfil.registro}`, perfil.centro, perfil.contacto]
    .filter(Boolean)
    .forEach((line, i) => doc.text(t(line as string), W - M, y + 4 + i * 4, { align: "right" }));
  doc.setDrawColor(...DORADO);
  doc.setLineWidth(0.5);
  doc.line(M, y + 26, W - M, y + 26);
  y += 34;

  // ── Título y paciente ──
  doc.setTextColor(...TEXTO);
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
    const lineas = doc.splitTextToSize(t(datos.indicaciones.trim()), ANCHO);
    doc.text(lineas, M, y);
    y += lineas.length * 4.2;
  }
  y += 4;

  // ── Fichas de ejercicios, agrupadas por fase ──
  const fases = [...new Set(datos.items.map((i) => i.fase || ""))];
  let n = 0;
  for (const fase of fases) {
    if (fase && fases.length > 1) {
      if (y + 30 > LIMITE) {
        doc.addPage();
        y = 16;
      }
      doc.setFillColor(240, 247, 246);
      doc.rect(M, y - 4.5, ANCHO, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...TEAL);
      doc.text(t(fase), M + 2, y);
      y += 7;
    }

    for (const it of datos.items.filter((i) => (i.fase || "") === fase)) {
      n++;
      const ej = getEjercicio(it.ejercicioId);
      const fotos = (ej?.imagenes ?? []).map((r) => imagenes.get(r)).filter((x): x is string => !!x);
      const conFotos = fotos.length > 0;
      const FOTO_W = 36;
      const FOTO_H = 24;
      const xTexto = conFotos ? M + FOTO_W + 4 : M;
      const anchoTexto = W - M - xTexto;

      // Armar líneas de texto antes de dibujar, para medir la ficha
      type Linea = { txt: string[]; estilo: "titulo" | "dosis" | "etiqueta" | "normal" | "nota" };
      const bloques: Linea[] = [];
      const add = (txt: string, estilo: Linea["estilo"], ancho = anchoTexto) => {
        doc.setFont("helvetica", estilo === "titulo" || estilo === "etiqueta" ? "bold" : "normal");
        doc.setFontSize(estilo === "titulo" ? 10.5 : 8.5);
        bloques.push({ txt: doc.splitTextToSize(t(txt), ancho), estilo });
      };
      add(`${n}. ${it.nombre}`, "titulo");
      add(`Dosis: ${it.dosis}${ej?.equipo && ej.equipo !== "Ninguno" ? `   ·   Material: ${ej.equipo}` : ""}`, "dosis");
      if (ej) {
        add("Posición inicial", "etiqueta");
        add(ej.posicion, "normal");
        add("Cómo hacerlo", "etiqueta");
        ej.pasos.forEach((p, i) => add(`${i + 1}) ${p}`, "normal"));
        if (ej.claves.length) add(`Clave: ${ej.claves.join(" ")}`, "normal");
        if (ej.evitar.length) add(`Evita: ${ej.evitar.join(" ")}`, "normal");
      }
      if (it.notas) add(`Nota de tu profesional: ${it.notas}`, "nota");

      const altoTexto = bloques.reduce((h, b) => h + b.txt.length * (b.estilo === "titulo" ? 4.8 : LH) + (b.estilo === "etiqueta" ? 0.8 : 0), 0);
      const altoFotos = conFotos ? fotos.length * (FOTO_H + 2) + (ej?.video ? 5 : 0) : 0;
      const alto = Math.max(altoTexto, altoFotos) + 5;

      if (y + Math.min(alto, LIMITE - 20) > LIMITE) {
        doc.addPage();
        y = 16;
      }
      const yInicio = y;

      // Fotos (inicio y final) a la izquierda
      if (conFotos) {
        let yf = y - 3;
        for (const f of fotos) {
          try {
            imagenEnCaja(doc, f, M, yf, FOTO_W, FOTO_H);
          } catch {
            /* foto inválida */
          }
          yf += FOTO_H + 2;
        }
      }

      // Texto a la derecha
      for (const b of bloques) {
        if (y + LH > LIMITE) {
          doc.addPage();
          y = 16;
        }
        switch (b.estilo) {
          case "titulo":
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10.5);
            doc.setTextColor(...TEXTO);
            break;
          case "dosis":
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(...TEAL);
            break;
          case "etiqueta":
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.5);
            doc.setTextColor(...TEXTO);
            y += 0.8;
            break;
          case "nota":
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.5);
            doc.setTextColor(...DORADO);
            break;
          default:
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(60, 60, 60);
        }
        doc.text(b.txt, xTexto, y);
        y += b.txt.length * (b.estilo === "titulo" ? 4.8 : LH);
      }

      // Enlace al video propio, si existe (bajo las fotos o al final del texto)
      if (ej?.video) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...TEAL);
        const url = `${siteConfig.url}${ej.video}`;
        if (conFotos) {
          doc.textWithLink("> Ver video", M, yInicio - 3 + fotos.length * (FOTO_H + 2) + 2.5, { url });
        } else {
          doc.textWithLink("> Ver video del ejercicio", xTexto, y + 1, { url });
          y += 5;
        }
      }

      y = Math.max(y, yInicio + altoFotos) + 3;
      doc.setDrawColor(225, 225, 225);
      doc.setLineWidth(0.2);
      doc.line(M, y - 1.5, W - M, y - 1.5);
      y += 4;
    }
  }

  // ── Cierre: advertencia + firma ──
  if (y > H - 62) {
    doc.addPage();
    y = 20;
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRIS);
  const aviso = doc.splitTextToSize(
    t(
      "Realiza los ejercicios con molestia tolerable (hasta 3-4 de 10) que desaparezca en menos de 24 horas. " +
        "Si aparece dolor intenso, hinchazón, fiebre u otro síntoma nuevo, suspende y contacta a tu profesional.",
    ),
    ANCHO,
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
  doc.setTextColor(...TEXTO);
  doc.setFont("helvetica", "bold");
  doc.text(t(perfil.nombre || "Profesional tratante"), cx, y + 4.5, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  [perfil.profesion, perfil.registro && `Registro: ${perfil.registro}`]
    .filter(Boolean)
    .forEach((l, i) => doc.text(t(l as string), cx, y + 8.5 + i * 3.8, { align: "center" }));

  // Pie de página en todas las hojas
  const total = doc.getNumberOfPages();
  const hayFotos = imagenes.size > 0;
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(t(`${perfil.centro || perfil.nombre} · Página ${p} de ${total}`), W / 2, H - 6, { align: "center" });
    if (hayFotos && p === total) doc.text(t(CREDITO_IMAGENES), M, H - 6);
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
