"use client";

import { useCallback, useState } from "react";
import type { ItemPlan, PerfilProfesional, Protocolo } from "@/lib/protocolos/types";

// Guardado local en el navegador del profesional. El logo, la firma, el
// borrador del plan y los protocolos generados quedan en este dispositivo;
// no se sube nada al servidor ni se guardan datos de pacientes.

const KEYS = {
  perfil: "sakros-protocolos-perfil",
  plan: "sakros-protocolos-plan",
  generados: "sakros-protocolos-ia",
};

function leer<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function leerLista<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function escribir(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Cuota llena (imágenes grandes) o almacenamiento bloqueado
    return false;
  }
}

export const PERFIL_VACIO: PerfilProfesional = {
  nombre: "",
  profesion: "",
  registro: "",
  centro: "",
  contacto: "",
  logo: null,
  firma: null,
};

export interface BorradorPlan {
  paciente: string;
  // Contacto del paciente elegido desde las fichas (para enviarle el PDF).
  pacienteEmail?: string;
  pacienteTelefono?: string;
  protocolo: string;
  indicaciones: string;
  items: ItemPlan[];
}

export const PLAN_VACIO: BorradorPlan = { paciente: "", protocolo: "", indicaciones: "", items: [] };

// Estos hooks solo se usan después del login del panel (render en el
// cliente), así que se puede leer localStorage en el estado inicial.
const enNavegador = () => typeof window !== "undefined";

/** Estado sincronizado con localStorage. */
function usePersistente<T extends object>(key: string, inicial: T) {
  const [valor, setValor] = useState<T>(() => (enNavegador() ? leer(key, inicial) : inicial));
  const guardar = useCallback(
    (v: T) => {
      setValor(v);
      return escribir(key, v);
    },
    [key],
  );
  return { valor, guardar };
}

export function usePerfil() {
  return usePersistente<PerfilProfesional>(KEYS.perfil, PERFIL_VACIO);
}

export function usePlan() {
  return usePersistente<BorradorPlan>(KEYS.plan, PLAN_VACIO);
}

export function useGenerados() {
  const [lista, setLista] = useState<Protocolo[]>(() => (enNavegador() ? leerLista<Protocolo>(KEYS.generados) : []));
  const guardar = useCallback((p: Protocolo) => {
    setLista((prev) => {
      const next = [p, ...prev.filter((x) => x.id !== p.id)].slice(0, 20);
      escribir(KEYS.generados, next);
      return next;
    });
  }, []);
  const eliminar = useCallback((id: string) => {
    setLista((prev) => {
      const next = prev.filter((x) => x.id !== id);
      escribir(KEYS.generados, next);
      return next;
    });
  }, []);
  return { lista, guardar, eliminar };
}

/** Lee un archivo de imagen y lo reduce para que quepa en localStorage. */
export function imagenADataUrl(file: File, maxLado = 600): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Formato de imagen no soportado."));
      img.onload = () => {
        const escala = Math.min(1, maxLado / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        // PNG conserva la transparencia de logos y firmas
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
