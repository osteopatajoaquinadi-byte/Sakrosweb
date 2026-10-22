// Inventario de Incapacidad de Tinnitus (THI), versión en español usada en Sakros.
// Sí = 4, A veces = 2, No = 0. Puntaje total 0–100.

export type RespuestaTHI = "si" | "a_veces" | "no";
export type Subescala = "F" | "E" | "C";

export const THI_PREGUNTAS: { n: number; tipo: Subescala; texto: string }[] = [
  { n: 1, tipo: "F", texto: "¿Le cuesta concentrarse por culpa del ruido o zumbido en el oído?" },
  { n: 2, tipo: "F", texto: "¿Le cuesta escuchar a los demás debido a que el zumbido es muy fuerte?" },
  { n: 3, tipo: "F", texto: "¿Lo pone de mal humor el zumbido en el oído?" },
  { n: 4, tipo: "F", texto: "¿Se siente confundido por culpa del zumbido en el oído?" },
  { n: 5, tipo: "C", texto: "¿Se desespera con el ruido o zumbido del oído?" },
  { n: 6, tipo: "E", texto: "¿Se queja mucho por tener el zumbido en el oído?" },
  { n: 7, tipo: "F", texto: "¿Le cuesta quedarse dormido en la noche por culpa del zumbido del oído?" },
  { n: 8, tipo: "C", texto: "¿Cree que el problema de su zumbido es algo sin solución?" },
  { n: 9, tipo: "F", texto: "¿El zumbido de oído le impide disfrutar de la vida, como por ejemplo ir al cine o salir a cenar?" },
  { n: 10, tipo: "E", texto: "¿Se siente desilusionado por culpa del zumbido del oído?" },
  { n: 11, tipo: "C", texto: "¿Cree que tiene una enfermedad incurable?" },
  { n: 12, tipo: "F", texto: "¿El zumbido del oído le impide disfrutar de la vida?" },
  { n: 13, tipo: "F", texto: "¿Interfiere el zumbido del oído en su trabajo o en las labores de la casa?" },
  { n: 14, tipo: "F", texto: "¿Se siente a menudo de mal humor por culpa del zumbido del oído?" },
  { n: 15, tipo: "F", texto: "¿Le cuesta entender lo que lee por culpa del zumbido del oído?" },
  { n: 16, tipo: "E", texto: "¿Se siente alterado por el zumbido del oído?" },
  { n: 17, tipo: "E", texto: "¿Siente que el zumbido de oído le crea tensiones o interfiere en las relaciones con sus familiares y amigos?" },
  { n: 18, tipo: "F", texto: "¿Le cuesta sacarse de la cabeza el zumbido y concentrarse en otra cosa?" },
  { n: 19, tipo: "C", texto: "¿Siente que no puede controlar el zumbido de oído?" },
  { n: 20, tipo: "F", texto: "¿Se siente a menudo cansado por culpa del zumbido de oído?" },
  { n: 21, tipo: "E", texto: "¿Se siente deprimido por causa del zumbido de oído?" },
  { n: 22, tipo: "E", texto: "¿Lo pone nervioso el zumbido de oído?" },
  { n: 23, tipo: "C", texto: "¿Siente que ya no puede hacerle frente al zumbido de oído?" },
  { n: 24, tipo: "F", texto: "¿Empeora el zumbido de oído cuando está estresado?" },
  { n: 25, tipo: "E", texto: "¿Se siente inseguro por culpa del zumbido de oído?" },
];

export const THI_OPCIONES: { value: RespuestaTHI; label: string; puntos: number; ayuda: string }[] = [
  { value: "si", label: "Sí", puntos: 4, ayuda: "Es permanente" },
  { value: "a_veces", label: "A veces", puntos: 2, ayuda: "En algunas ocasiones" },
  { value: "no", label: "No", puntos: 0, ayuda: "No me pasa" },
];

export const THI_SUBESCALAS: Record<Subescala, string> = {
  F: "Funcional",
  E: "Emocional",
  C: "Catastrófica",
};

export const THI_SEVERIDAD: { max: number; label: string; grado: number }[] = [
  { max: 16, label: "Leve", grado: 1 },
  { max: 36, label: "Mediano", grado: 2 },
  { max: 56, label: "Moderado", grado: 3 },
  { max: 76, label: "Severo", grado: 4 },
  { max: 100, label: "Catastrófico", grado: 5 },
];

export type ResultadoTHI = {
  puntaje: number;
  severidad: string;
  subescalas: Record<Subescala, number>;
};

/** Valida que estén las 25 respuestas. Devuelve las respuestas limpias o null. */
export function validarTHI(input: unknown): Record<string, RespuestaTHI> | null {
  if (!input || typeof input !== "object") return null;
  const r = input as Record<string, unknown>;
  const out: Record<string, RespuestaTHI> = {};
  for (const p of THI_PREGUNTAS) {
    const v = r[String(p.n)];
    if (v !== "si" && v !== "a_veces" && v !== "no") return null;
    out[String(p.n)] = v;
  }
  return out;
}

export function puntuarTHI(respuestas: Record<string, RespuestaTHI>): ResultadoTHI {
  const subescalas: Record<Subescala, number> = { F: 0, E: 0, C: 0 };
  let puntaje = 0;
  for (const p of THI_PREGUNTAS) {
    const pts = THI_OPCIONES.find((o) => o.value === respuestas[String(p.n)])?.puntos ?? 0;
    puntaje += pts;
    subescalas[p.tipo] += pts;
  }
  const severidad = THI_SEVERIDAD.find((s) => puntaje <= s.max)?.label ?? "Catastrófico";
  return { puntaje, severidad, subescalas };
}

/** Puntaje máximo de cada subescala (4 puntos por pregunta). */
export const THI_MAX_SUBESCALA: Record<Subescala, number> = THI_PREGUNTAS.reduce(
  (acc, p) => ({ ...acc, [p.tipo]: acc[p.tipo] + 4 }),
  { F: 0, E: 0, C: 0 } as Record<Subescala, number>,
);
