"use client";

import { useState } from "react";

/* ── Tipos ── */
type FieldType = "text" | "textarea" | "select" | "multiselect" | "number";

type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
  min?: number;
  max?: number;
  section?: string;
};

type ClinicalData = Record<string, unknown>;

/* ── Esquemas clínicos por servicio ── */
const SCHEMAS: Record<string, FieldDef[]> = {
  Osteopatía: [
    { key: "motivo_actual", label: "Motivo de consulta actual", type: "textarea", placeholder: "Describir motivo principal de la sesión", section: "Anamnesis" },
    {
      key: "localizacion",
      label: "Localización del dolor",
      type: "multiselect",
      options: ["Cervical", "Dorsal", "Lumbar", "Pelvis", "Sacro", "MMSS derecho", "MMSS izquierdo", "MMII derecho", "MMII izquierdo", "Craneal", "Visceral", "ATM"],
      section: "Anamnesis",
    },
    {
      key: "tipo_dolor",
      label: "Tipo de dolor",
      type: "multiselect",
      options: ["Agudo", "Crónico", "Mecánico", "Inflamatorio", "Irradiado", "Referido", "Neuropático", "Difuso"],
      section: "Anamnesis",
    },
    {
      key: "inicio",
      label: "Inicio",
      type: "select",
      options: ["Agudo", "Insidioso", "Traumático", "Post-quirúrgico", "Recurrente"],
      section: "Anamnesis",
    },
    { key: "factores_agravantes", label: "Factores agravantes", type: "text", placeholder: "Ej: sedestación prolongada, flexión", section: "Anamnesis" },
    { key: "factores_atenuantes", label: "Factores atenuantes", type: "text", placeholder: "Ej: movimiento, calor, reposo", section: "Anamnesis" },
    {
      key: "tests_realizados",
      label: "Tests osteopáticos realizados",
      type: "textarea",
      placeholder: "Tests positivos / negativos relevantes",
      section: "Evaluación",
    },
    {
      key: "disfunciones",
      label: "Disfunciones somáticas encontradas",
      type: "textarea",
      placeholder: "Ej: ERS izquierda L4, restricción C0-C1 extensión",
      section: "Evaluación",
    },
    { key: "restricciones_movilidad", label: "Restricciones de movilidad", type: "textarea", placeholder: "Segmentos y direcciones restringidas", section: "Evaluación" },
    {
      key: "tecnicas_aplicadas",
      label: "Técnicas aplicadas",
      type: "multiselect",
      options: [
        "HVLA (thrust)",
        "Músculo-energía",
        "Liberación miofascial",
        "Técnica visceral",
        "Técnica craneal",
        "Funcional indirecta",
        "Articulatoria",
        "Strain-counterstrain",
        "Puntos gatillo",
        "Movilización neural",
      ],
      section: "Tratamiento",
    },
    { key: "respuesta_tratamiento", label: "Respuesta al tratamiento", type: "textarea", placeholder: "Cambios inmediatos post-tratamiento", section: "Tratamiento" },
    { key: "plan", label: "Plan / Indicaciones", type: "textarea", placeholder: "Frecuencia, ejercicios, recomendaciones", section: "Plan" },
  ],

  Kinesiología: [
    { key: "motivo_actual", label: "Motivo de consulta actual", type: "textarea", placeholder: "Motivo de derivación o consulta", section: "Anamnesis" },
    {
      key: "localizacion",
      label: "Zona afectada",
      type: "multiselect",
      options: ["Cervical", "Hombro D", "Hombro I", "Codo D", "Codo I", "Muñeca/Mano D", "Muñeca/Mano I", "Dorsal", "Lumbar", "Cadera D", "Cadera I", "Rodilla D", "Rodilla I", "Tobillo/Pie D", "Tobillo/Pie I"],
      section: "Anamnesis",
    },
    {
      key: "rom",
      label: "ROM evaluado (articulación y grados)",
      type: "textarea",
      placeholder: "Ej: Hombro D flexión 140°, ABD 120°. Rodilla I flexión 110°",
      section: "Evaluación",
    },
    {
      key: "fuerza_muscular",
      label: "Fuerza muscular (grupos y grados 0-5)",
      type: "textarea",
      placeholder: "Ej: Cuádriceps D 4/5, Glúteo medio I 3+/5",
      section: "Evaluación",
    },
    {
      key: "tests_funcionales",
      label: "Tests funcionales realizados",
      type: "textarea",
      placeholder: "Tests aplicados y resultados (positivo/negativo)",
      section: "Evaluación",
    },
    { key: "diagnostico_kinesico", label: "Diagnóstico kinésico", type: "textarea", placeholder: "Diagnóstico funcional", section: "Evaluación" },
    {
      key: "objetivos",
      label: "Objetivos de tratamiento",
      type: "textarea",
      placeholder: "Corto y mediano plazo",
      section: "Tratamiento",
    },
    {
      key: "modalidades",
      label: "Modalidades aplicadas",
      type: "multiselect",
      options: [
        "Ejercicio terapéutico",
        "Terapia manual",
        "Electroterapia",
        "Ultrasonido",
        "TENS",
        "Láser",
        "Termoterapia",
        "Crioterapia",
        "Vendaje neuromuscular (kinesiotape)",
        "Punción seca",
        "Ventosas",
        "Hidroterapia",
      ],
      section: "Tratamiento",
    },
    { key: "ejercicios_indicados", label: "Ejercicios indicados", type: "textarea", placeholder: "Ejercicios para domicilio, series y repeticiones", section: "Plan" },
    { key: "plan", label: "Plan / Indicaciones", type: "textarea", placeholder: "Frecuencia de sesiones, precauciones, derivaciones", section: "Plan" },
  ],

  "Posturología Clínica": [
    {
      key: "evaluacion_anterior",
      label: "Evaluación postural anterior",
      type: "textarea",
      placeholder: "Asimetrías, desviaciones, inclinaciones observadas",
      section: "Evaluación Postural",
    },
    {
      key: "evaluacion_lateral",
      label: "Evaluación postural lateral",
      type: "textarea",
      placeholder: "Curvas sagitales, antepulsión, retropulsión",
      section: "Evaluación Postural",
    },
    {
      key: "evaluacion_posterior",
      label: "Evaluación postural posterior",
      type: "textarea",
      placeholder: "Escoliosis, asimetrías escápulas/pelvis",
      section: "Evaluación Postural",
    },
    {
      key: "test_podal",
      label: "Test podal",
      type: "textarea",
      placeholder: "Resultado del test, apoyo plantar, asimetrías",
      section: "Tests Captores",
    },
    {
      key: "test_ocular",
      label: "Test ocular",
      type: "textarea",
      placeholder: "Convergencia, cover test, dominancia, forias",
      section: "Tests Captores",
    },
    {
      key: "test_mandibular",
      label: "Test mandibular / ATM",
      type: "textarea",
      placeholder: "Apertura, desviaciones, clicks, dolor, oclusión",
      section: "Tests Captores",
    },
    {
      key: "captores_alterados",
      label: "Captores posturales alterados",
      type: "multiselect",
      options: ["Pies", "Ojos", "Mandíbula / ATM", "Vestibular", "Cicatrices", "Piel", "Visceral"],
      section: "Diagnóstico",
    },
    {
      key: "cadenas_musculares",
      label: "Cadenas musculares alteradas",
      type: "textarea",
      placeholder: "Cadenas hipertónicas, acortamientos, desequilibrios",
      section: "Diagnóstico",
    },
    {
      key: "diagnostico_postural",
      label: "Diagnóstico posturológico",
      type: "textarea",
      placeholder: "Síntesis del análisis postural",
      section: "Diagnóstico",
    },
    {
      key: "plan_tratamiento",
      label: "Plan de tratamiento postural",
      type: "textarea",
      placeholder: "Abordaje de captores, plantillas, derivaciones, ejercicios",
      section: "Plan",
    },
  ],

  "Estudio Biomecánico": [
    {
      key: "tipo_pisada",
      label: "Tipo de pisada",
      type: "select",
      options: ["Neutra", "Pronadora leve", "Pronadora moderada", "Pronadora severa", "Supinadora leve", "Supinadora moderada", "Supinadora severa"],
      section: "Análisis Podal",
    },
    {
      key: "presiones_plantares",
      label: "Análisis de presiones plantares",
      type: "textarea",
      placeholder: "Distribución de cargas, zonas de hiperpresión",
      section: "Análisis Podal",
    },
    {
      key: "analisis_marcha",
      label: "Evaluación de la marcha",
      type: "textarea",
      placeholder: "Patrón de marcha, asimetrías, hallazgos",
      section: "Análisis Dinámico",
    },
    {
      key: "alineacion_mmii",
      label: "Alineación MMII",
      type: "textarea",
      placeholder: "Genu valgo/varo, rotaciones tibiales/femorales, ángulo Q",
      section: "Evaluación Estructural",
    },
    {
      key: "rom_cadera",
      label: "ROM cadera",
      type: "textarea",
      placeholder: "Flexión, extensión, RI, RE, ABD, ADD (grados D/I)",
      section: "Evaluación Articular",
    },
    {
      key: "rom_rodilla",
      label: "ROM rodilla",
      type: "textarea",
      placeholder: "Flexión, extensión (grados D/I)",
      section: "Evaluación Articular",
    },
    {
      key: "rom_tobillo",
      label: "ROM tobillo",
      type: "textarea",
      placeholder: "Dorsiflexión, plantiflexión, inversión, eversión (grados D/I)",
      section: "Evaluación Articular",
    },
    {
      key: "hallazgos",
      label: "Hallazgos relevantes",
      type: "textarea",
      placeholder: "Otros hallazgos biomecánicos significativos",
      section: "Síntesis",
    },
    {
      key: "calzado",
      label: "Recomendaciones de calzado",
      type: "textarea",
      placeholder: "Tipo de calzado recomendado, marcas/modelos",
      section: "Recomendaciones",
    },
    {
      key: "plantillas",
      label: "Indicación de plantillas",
      type: "select",
      options: ["No indicadas", "Plantillas correctivas", "Plantillas deportivas", "Plantillas de descarga", "Plantillas mixtas"],
      section: "Recomendaciones",
    },
    { key: "observaciones", label: "Observaciones generales", type: "textarea", placeholder: "Comentarios adicionales, derivaciones", section: "Recomendaciones" },
  ],

  "Actividad Física Dirigida": [
    {
      key: "objetivo",
      label: "Objetivo del programa",
      type: "multiselect",
      options: ["Rehabilitación", "Acondicionamiento general", "Rendimiento deportivo", "Bienestar / salud", "Pérdida de peso", "Ganancia de fuerza", "Flexibilidad", "Readaptación deportiva"],
      section: "Perfil",
    },
    {
      key: "nivel_actividad",
      label: "Nivel de actividad física actual",
      type: "select",
      options: ["Sedentario", "Bajo (1-2x semana)", "Moderado (3-4x semana)", "Alto (5+ semana)", "Deportista competitivo"],
      section: "Perfil",
    },
    {
      key: "evaluacion_funcional",
      label: "Evaluación funcional",
      type: "textarea",
      placeholder: "FMS, test sit-to-stand, sentadilla profunda, resultados",
      section: "Evaluación",
    },
    {
      key: "capacidad_cardiovascular",
      label: "Capacidad cardiovascular",
      type: "textarea",
      placeholder: "Test aplicado, FC basal, FC máxima, observaciones",
      section: "Evaluación",
    },
    {
      key: "flexibilidad",
      label: "Flexibilidad general",
      type: "textarea",
      placeholder: "Sit and reach, Thomas test, observaciones por segmento",
      section: "Evaluación",
    },
    {
      key: "fuerza_funcional",
      label: "Fuerza funcional",
      type: "textarea",
      placeholder: "Tests de fuerza aplicados, resultados",
      section: "Evaluación",
    },
    {
      key: "limitaciones",
      label: "Limitaciones o precauciones",
      type: "textarea",
      placeholder: "Lesiones previas, patologías, contraindicaciones",
      section: "Prescripción",
    },
    {
      key: "prescripcion_frecuencia",
      label: "Frecuencia prescrita",
      type: "select",
      options: ["1x semana", "2x semana", "3x semana", "4x semana", "5x semana", "Diario"],
      section: "Prescripción",
    },
    {
      key: "prescripcion_duracion",
      label: "Duración por sesión",
      type: "select",
      options: ["30 min", "45 min", "60 min", "75 min", "90 min"],
      section: "Prescripción",
    },
    {
      key: "prescripcion_intensidad",
      label: "Intensidad",
      type: "select",
      options: ["Baja (RPE 2-4)", "Moderada (RPE 5-6)", "Alta (RPE 7-8)", "Muy alta (RPE 9-10)", "Variable / intervalos"],
      section: "Prescripción",
    },
    {
      key: "ejercicios_programados",
      label: "Ejercicios programados",
      type: "textarea",
      placeholder: "Detalle de ejercicios, series, repeticiones, progresión",
      section: "Programa",
    },
  ],
};

/* ── Componente de formulario clínico ── */
export default function ClinicalEvalForm({
  serviceType,
  value,
  onChange,
}: {
  serviceType: string;
  value: ClinicalData;
  onChange: (data: ClinicalData) => void;
}) {
  const fields = SCHEMAS[serviceType];
  if (!fields) return null;

  // Agrupar por sección
  const sections: { name: string; fields: FieldDef[] }[] = [];
  let currentSection = "";
  for (const f of fields) {
    if (f.section && f.section !== currentSection) {
      currentSection = f.section;
      sections.push({ name: currentSection, fields: [] });
    }
    sections[sections.length - 1]?.fields.push(f);
  }

  function updateField(key: string, val: unknown) {
    onChange({ ...value, [key]: val });
  }

  function toggleMulti(key: string, opt: string) {
    const curr = (value[key] as string[]) || [];
    const next = curr.includes(opt)
      ? curr.filter((v) => v !== opt)
      : [...curr, opt];
    updateField(key, next);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2 h-2 rounded-full bg-teal-500" />
        <p className="text-sm font-semibold text-teal-800">
          Evaluación clínica — {serviceType}
        </p>
      </div>

      {sections.map((sec) => (
        <div key={sec.name}>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 border-b border-slate-100 pb-1">
            {sec.name}
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            {sec.fields.map((f) => {
              const fullWidth = f.type === "textarea" || f.type === "multiselect";
              return (
                <div key={f.key} className={fullWidth ? "sm:col-span-2" : ""}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {f.label}
                  </label>

                  {f.type === "text" && (
                    <input
                      type="text"
                      value={(value[f.key] as string) || ""}
                      onChange={(e) => updateField(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none"
                    />
                  )}

                  {f.type === "textarea" && (
                    <textarea
                      value={(value[f.key] as string) || ""}
                      onChange={(e) => updateField(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      rows={2}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none"
                    />
                  )}

                  {f.type === "number" && (
                    <input
                      type="number"
                      min={f.min}
                      max={f.max}
                      value={(value[f.key] as string) || ""}
                      onChange={(e) => updateField(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none"
                    />
                  )}

                  {f.type === "select" && f.options && (
                    <select
                      value={(value[f.key] as string) || ""}
                      onChange={(e) => updateField(f.key, e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none"
                    >
                      <option value="">— Seleccionar —</option>
                      {f.options.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  )}

                  {f.type === "multiselect" && f.options && (
                    <div className="flex flex-wrap gap-1.5">
                      {f.options.map((opt) => {
                        const selected = ((value[f.key] as string[]) || []).includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggleMulti(f.key, opt)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition
                              ${selected
                                ? "bg-teal-100 text-teal-800 border-teal-300"
                                : "bg-white text-slate-600 border-slate-200 hover:border-teal-400"
                              }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Componente para mostrar datos clínicos guardados ── */
export function ClinicalDataDisplay({
  serviceType,
  data,
}: {
  serviceType: string;
  data: Record<string, unknown>;
}) {
  const [expanded, setExpanded] = useState(false);
  const fields = SCHEMAS[serviceType];

  // Filtrar solo campos que tienen datos
  const filledFields = fields
    ? fields.filter((f) => {
        const val = data[f.key];
        if (val === null || val === undefined || val === "") return false;
        if (Array.isArray(val) && val.length === 0) return false;
        return true;
      })
    : [];

  if (filledFields.length === 0) {
    // Si no hay schema, mostrar datos raw
    const entries = Object.entries(data).filter(
      ([, v]) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0)
    );
    if (entries.length === 0) return null;

    return (
      <div className="mt-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-teal-700 hover:text-teal-900 font-medium"
        >
          {expanded ? "▾ Ocultar evaluación" : "▸ Ver evaluación clínica"}
        </button>
        {expanded && (
          <div className="mt-2 p-3 rounded-lg bg-slate-50 text-sm space-y-1">
            {entries.map(([k, v]) => (
              <div key={k}>
                <span className="font-medium text-slate-700">{k.replace(/_/g, " ")}:</span>{" "}
                <span className="text-slate-600">
                  {Array.isArray(v) ? (v as string[]).join(", ") : String(v)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Agrupar por sección para mejor visualización
  const sectionMap: Record<string, { field: FieldDef; val: unknown }[]> = {};
  for (const f of filledFields) {
    const sec = f.section || "General";
    if (!sectionMap[sec]) sectionMap[sec] = [];
    sectionMap[sec].push({ field: f, val: data[f.key] });
  }

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-teal-700 hover:text-teal-900 font-medium"
      >
        {expanded ? "▾ Ocultar evaluación" : `▸ Ver evaluación clínica (${filledFields.length} campos)`}
      </button>
      {expanded && (
        <div className="mt-2 p-3 rounded-lg bg-slate-50 space-y-3">
          {Object.entries(sectionMap).map(([secName, items]) => (
            <div key={secName}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {secName}
              </p>
              <div className="space-y-1">
                {items.map(({ field, val }) => (
                  <div key={field.key} className="text-sm">
                    <span className="font-medium text-slate-700">{field.label}:</span>{" "}
                    <span className="text-slate-600">
                      {Array.isArray(val) ? (val as string[]).join(", ") : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
