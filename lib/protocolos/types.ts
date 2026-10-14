/* ══════════════════════════════════════════════════════════
   Protocolos Sakros — tipos compartidos (cliente y servidor)
   ══════════════════════════════════════════════════════════ */

export type Area = "kinesiologia" | "osteopatia";

/** Certeza de la evidencia, en lenguaje GRADE simplificado. */
export type Certeza = "alta" | "moderada" | "baja" | "muy baja";

export type RegionEjercicio =
  | "rodilla"
  | "cadera"
  | "tobillo"
  | "hombro"
  | "cervical"
  | "lumbar"
  | "core"
  | "respiracion"
  | "general";

export interface Ejercicio {
  id: string;
  nombre: string;
  /** Nombre en inglés: se usa para buscarlo en ExRx, HEP2go y Rehab Hero. */
  en: string;
  region: RegionEjercicio;
  equipo: string;
  descripcion: string;
  ejecucion: string;
  dosis: string;
  /** Video propio de Sakros (ruta pública), si existe. */
  video?: string;
}

export interface EjercicioEnFase {
  id: string;
  /** Dosis específica para la fase; si falta se usa la del ejercicio. */
  dosis?: string;
}

export interface Fase {
  nombre: string;
  semanas: string;
  objetivos: string[];
  precauciones: string[];
  criteriosAvance: string[];
  ejercicios: EjercicioEnFase[];
}

export interface Hallazgo {
  texto: string;
  certeza: Certeza;
}

export interface Referencia {
  pmid: string;
  doi?: string;
  cita: string;
}

export interface Protocolo {
  id: string;
  titulo: string;
  area: Area;
  /** Términos con los que se encuentra en el buscador. */
  sinonimos: string[];
  descripcion: string;
  /** Búsqueda PubMed (en inglés) para traer la evidencia más reciente. */
  pubmed: string;
  /** Mes de la última revisión de la evidencia (AAAA-MM). */
  actualizado: string;
  /** "base" = curado en el código con referencias verificadas; "ia" = generado al vuelo. */
  origen: "base" | "ia";
  /** true cuando un profesional del equipo validó el contenido clínico. */
  revisado: boolean;
  evidencia: Hallazgo[];
  banderasRojas: string[];
  escalas: string[];
  fases: Fase[];
  referencias: Referencia[];
}

/** Ejercicio elegido para el plan de un paciente (editable por el profesional). */
export interface ItemPlan {
  uid: string;
  ejercicioId: string;
  nombre: string;
  dosis: string;
  notas: string;
  fase: string;
}

export interface PerfilProfesional {
  nombre: string;
  profesion: string;
  registro: string;
  centro: string;
  contacto: string;
  /** data URL (PNG/JPG) */
  logo: string | null;
  /** data URL (PNG/JPG) */
  firma: string | null;
}
