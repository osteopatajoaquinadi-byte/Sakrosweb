import type { Ejercicio, RegionEjercicio } from "./types";

/* ══════════════════════════════════════════════════════════
   Biblioteca de ejercicios de rehabilitación — Sakros

   Las descripciones son propias. ExRx, HEP2go y Rehab Hero se usan
   como referencia externa mediante enlaces de búsqueda: sus imágenes y
   videos tienen derechos reservados y no se copian a esta app.
   ══════════════════════════════════════════════════════════ */

export const REGIONES: { id: RegionEjercicio; label: string }[] = [
  { id: "rodilla", label: "Rodilla" },
  { id: "cadera", label: "Cadera" },
  { id: "tobillo", label: "Tobillo y pie" },
  { id: "hombro", label: "Hombro" },
  { id: "cervical", label: "Cervical" },
  { id: "lumbar", label: "Lumbar" },
  { id: "core", label: "Core" },
  { id: "respiracion", label: "Respiración" },
  { id: "general", label: "General / aeróbico" },
];

export const EJERCICIOS: Ejercicio[] = [
  // ── RODILLA ──
  { id: "quad-set", nombre: "Contracción isométrica de cuádriceps", en: "quad set", region: "rodilla", equipo: "Toalla", descripcion: "Reactiva el cuádriceps y trabaja la extensión completa de rodilla.", ejecucion: "Sentado o supino con la rodilla extendida y una toalla bajo el hueco poplíteo. Empuja la toalla hacia la camilla contrayendo el muslo y mantén la contracción.", dosis: "10 rep × 10 s, 3 veces al día" },
  { id: "slr", nombre: "Elevación de pierna recta", en: "straight leg raise", region: "rodilla", equipo: "Colchoneta", descripcion: "Fuerza de cuádriceps y flexores de cadera sin carga articular.", ejecucion: "Supino, pierna contraria flectada. Contrae el cuádriceps, bloquea la rodilla y eleva la pierna recta hasta la altura de la otra rodilla. Baja lento.", dosis: "3 × 10–15" },
  { id: "heel-slide", nombre: "Deslizamiento de talón", en: "heel slide", region: "rodilla", equipo: "Colchoneta", descripcion: "Recupera la flexión de rodilla de forma activa.", ejecucion: "Supino. Desliza el talón hacia el glúteo flectando la rodilla hasta una molestia tolerable. Vuelve lento a la extensión.", dosis: "2–3 × 15" },
  { id: "prone-hang", nombre: "Extensión pasiva en prono", en: "prone knee hang", region: "rodilla", equipo: "Camilla", descripcion: "Recupera la extensión completa de rodilla.", ejecucion: "Prono con la pierna fuera de la camilla desde la mitad del muslo. Deja que la gravedad extienda la rodilla. Puede agregarse un peso liviano en el tobillo.", dosis: "3–5 min, 3 veces al día" },
  { id: "mini-squat", nombre: "Mini sentadilla", en: "mini squat", region: "rodilla", equipo: "Ninguno / apoyo", descripcion: "Carga progresiva en cadena cerrada con rango limitado.", ejecucion: "De pie con apoyo si es necesario. Flecta rodillas a 30–45° con la carga repartida en ambos pies y las rodillas alineadas con el segundo dedo.", dosis: "3 × 12–15" },
  { id: "squat", nombre: "Sentadilla", en: "bodyweight squat", region: "rodilla", equipo: "Peso corporal / carga", descripcion: "Fuerza global de miembro inferior.", ejecucion: "Pies al ancho de caderas. Baja llevando la cadera hacia atrás hasta donde mantengas la técnica. Rodillas siguiendo la línea de los pies.", dosis: "3–4 × 8–12" },
  { id: "leg-press", nombre: "Prensa de piernas", en: "leg press", region: "rodilla", equipo: "Máquina de prensa", descripcion: "Fuerza de cuádriceps con carga controlada en cadena cerrada.", ejecucion: "Espalda apoyada, pies al ancho de caderas. Flecta hasta 90° (o el rango indicado) y extiende sin bloquear la rodilla.", dosis: "3–4 × 8–12 (RPE 7–8)" },
  { id: "knee-ext", nombre: "Extensión de rodilla en máquina", en: "leg extension", region: "rodilla", equipo: "Silla de cuádriceps / tobillera", descripcion: "Fortalecimiento del cuádriceps en cadena abierta.", ejecucion: "Sentado. Extiende la rodilla de forma controlada dentro del rango autorizado y baja en 3 s.", dosis: "3 × 10–15 (90°–45° en fases iniciales de LCA)" },
  { id: "step-up", nombre: "Subida a escalón", en: "step up", region: "rodilla", equipo: "Escalón / cajón", descripcion: "Fuerza unilateral funcional.", ejecucion: "Apoya el pie completo en el escalón y sube extendiendo cadera y rodilla sin impulsarte con la pierna de atrás. Baja lento.", dosis: "3 × 10 por lado" },
  { id: "step-down", nombre: "Bajada lateral de escalón", en: "lateral step down", region: "rodilla", equipo: "Escalón", descripcion: "Control excéntrico del cuádriceps y alineación de rodilla.", ejecucion: "De pie sobre el escalón. Baja el talón contrario hacia el suelo flectando la rodilla de apoyo, sin que se vaya hacia adentro.", dosis: "3 × 8–12 por lado" },
  { id: "split-squat", nombre: "Sentadilla búlgara / split squat", en: "split squat", region: "rodilla", equipo: "Banco / mancuernas", descripcion: "Fuerza unilateral de cuádriceps y glúteo.", ejecucion: "Pie trasero apoyado en un banco. Baja verticalmente hasta que la rodilla trasera se acerque al suelo y sube por el talón delantero.", dosis: "3 × 8 por lado" },
  { id: "hamstring-curl", nombre: "Curl femoral", en: "hamstring curl", region: "rodilla", equipo: "Banda / máquina / fitball", descripcion: "Fuerza de isquiotibiales.", ejecucion: "Flecta la rodilla contra resistencia de forma controlada y vuelve en 3 s. Si el injerto es de isquiotibiales, respeta los plazos del cirujano.", dosis: "3 × 10–12" },
  { id: "nordic", nombre: "Curl nórdico", en: "nordic hamstring curl", region: "rodilla", equipo: "Compañero / anclaje", descripcion: "Fuerza excéntrica de isquiotibiales; prevención de lesiones.", ejecucion: "De rodillas con los tobillos fijos. Inclínate hacia adelante lo más lento posible manteniendo cadera extendida. Ayúdate con las manos al final.", dosis: "2–3 × 4–6" },
  { id: "single-leg-balance", nombre: "Equilibrio monopodal", en: "single leg balance", region: "rodilla", equipo: "Ninguno / superficie inestable", descripcion: "Control neuromuscular y propiocepción.", ejecucion: "De pie sobre una pierna con la rodilla levemente flectada. Progresión: ojos cerrados, superficie inestable, perturbaciones, tareas duales.", dosis: "3–5 × 30 s por lado" },
  { id: "hop-progression", nombre: "Progresión de saltos (pliometría)", en: "single leg hop", region: "rodilla", equipo: "Ninguno", descripcion: "Potencia y absorción de impacto previo al retorno deportivo.", ejecucion: "Progresa de saltos bipodales en el lugar a saltos monopodales hacia adelante, laterales y en triple salto. Aterriza suave, con rodilla alineada y estabilizando 2 s.", dosis: "3–4 × 6–8 por variante" },
  { id: "running-prog", nombre: "Retorno progresivo a la carrera", en: "return to running program", region: "general", equipo: "Cinta / pista", descripcion: "Reintroducción gradual de carrera.", ejecucion: "Intervalos de caminar y trotar (ej.: 1 min trote / 1 min caminata × 10), aumentando el tiempo de trote si no hay dolor ni derrame al día siguiente.", dosis: "3 días por semana, en días no consecutivos" },
  { id: "agility", nombre: "Agilidad y cambios de dirección", en: "agility ladder drills", region: "general", equipo: "Conos / escalera", descripcion: "Preparación para el gesto deportivo con giros y frenadas.", ejecucion: "Desplazamientos laterales, frenadas, cortes a 45° y 90°, progresando de velocidad planificada a reactiva.", dosis: "15–20 min, 2–3 veces por semana" },

  // ── CADERA ──
  { id: "bridge", nombre: "Puente de glúteo", en: "glute bridge", region: "cadera", equipo: "Colchoneta", descripcion: "Activación y fuerza de glúteo mayor e isquiotibiales.", ejecucion: "Supino, rodillas flectadas. Eleva la pelvis apretando glúteos hasta alinear hombros, caderas y rodillas, sin arquear la zona lumbar.", dosis: "3 × 12–15", video: "/images/kine-puente.mp4" },
  { id: "single-bridge", nombre: "Puente de glúteo a una pierna", en: "single leg glute bridge", region: "cadera", equipo: "Colchoneta", descripcion: "Fuerza unilateral de glúteo y control pélvico.", ejecucion: "Igual que el puente, con una pierna extendida en el aire. La pelvis no debe rotar.", dosis: "3 × 8–10 por lado" },
  { id: "clamshell", nombre: "Almeja (clamshell)", en: "clamshell", region: "cadera", equipo: "Banda elástica", descripcion: "Fuerza del glúteo medio y rotadores externos.", ejecucion: "De lado con caderas y rodillas flectadas. Separa las rodillas manteniendo los pies juntos y la pelvis quieta.", dosis: "3 × 15 por lado" },
  { id: "side-plank", nombre: "Plancha lateral", en: "side plank", region: "cadera", equipo: "Colchoneta", descripcion: "Estabilidad lateral de tronco y glúteo medio.", ejecucion: "Apoyo en antebrazo y rodillas (o pies). Eleva la pelvis alineando hombros, caderas y rodillas.", dosis: "3 × 20–40 s por lado" },
  { id: "rdl", nombre: "Peso muerto rumano", en: "romanian deadlift", region: "cadera", equipo: "Mancuernas / barra", descripcion: "Fuerza de cadena posterior con patrón de bisagra.", ejecucion: "Rodillas levemente flectadas. Lleva la cadera atrás bajando la carga pegada a las piernas con espalda neutra. Sube apretando glúteos.", dosis: "3 × 8–10" },
  { id: "hip-flexor-stretch", nombre: "Elongación de flexores de cadera", en: "kneeling hip flexor stretch", region: "cadera", equipo: "Colchoneta", descripcion: "Movilidad de la cadera anterior.", ejecucion: "En posición de caballero. Retroversión pélvica y desplazamiento suave de la cadera hacia adelante hasta sentir la elongación anterior.", dosis: "3 × 30 s por lado" },

  // ── TOBILLO ──
  { id: "calf-raise", nombre: "Elevación de talones", en: "calf raise", region: "tobillo", equipo: "Escalón", descripcion: "Fuerza de tríceps sural.", ejecucion: "De pie en el borde de un escalón. Sube en punta de pies y baja en 3 s por debajo de la horizontal. Progresión a una pierna.", dosis: "3 × 15" },
  { id: "ankle-df-mob", nombre: "Movilidad de dorsiflexión en pared", en: "knee to wall ankle mobility", region: "tobillo", equipo: "Pared", descripcion: "Recupera la dorsiflexión del tobillo.", ejecucion: "Pie a unos centímetros de la pared. Lleva la rodilla hacia la pared sin levantar el talón.", dosis: "2 × 15 por lado" },

  // ── HOMBRO ──
  { id: "pendulum", nombre: "Pendulares de Codman", en: "pendulum exercise", region: "hombro", equipo: "Mesa de apoyo", descripcion: "Movilidad suave y descarga en fase dolorosa.", ejecucion: "Tronco inclinado apoyado en una mesa, brazo colgando relajado. Balancea el cuerpo para que el brazo describa círculos pequeños.", dosis: "1–2 min, 2–3 veces al día" },
  { id: "iso-er", nombre: "Isométrico de rotación externa", en: "isometric shoulder external rotation", region: "hombro", equipo: "Pared", descripcion: "Analgesia y activación del manguito en fase irritable.", ejecucion: "Codo a 90° pegado al cuerpo y dorso de la mano contra la pared. Empuja al 30–50 % de tu fuerza sin dolor relevante.", dosis: "5 × 30–45 s" },
  { id: "er-band", nombre: "Rotación externa con banda", en: "band external rotation", region: "hombro", equipo: "Banda elástica / toalla", descripcion: "Fuerza de infraespinoso y redondo menor.", ejecucion: "Codo a 90° con una toalla bajo el brazo. Rota el antebrazo hacia afuera contra la banda y vuelve en 3 s.", dosis: "3 × 12–15" },
  { id: "side-lying-er", nombre: "Rotación externa en decúbito lateral", en: "side lying external rotation", region: "hombro", equipo: "Mancuerna liviana", descripcion: "Fuerza del manguito con carga progresiva.", ejecucion: "De lado sobre el hombro sano, codo a 90° apoyado en la cadera. Rota la mancuerna hacia el techo y baja lento.", dosis: "3 × 10–15" },
  { id: "ir-band", nombre: "Rotación interna con banda", en: "band internal rotation", region: "hombro", equipo: "Banda elástica", descripcion: "Fuerza del subescapular.", ejecucion: "Codo a 90° pegado al cuerpo. Lleva la mano hacia el abdomen contra la banda.", dosis: "3 × 12–15" },
  { id: "scaption", nombre: "Elevación en plano escapular", en: "scaption", region: "hombro", equipo: "Mancuernas livianas", descripcion: "Fuerza de supraespinoso y deltoides.", ejecucion: "Brazos a 30° por delante del plano frontal, pulgares arriba. Eleva hasta la altura del hombro sin encoger.", dosis: "3 × 10–12" },
  { id: "row-band", nombre: "Remo con banda", en: "band row", region: "hombro", equipo: "Banda elástica", descripcion: "Fuerza de retractores escapulares.", ejecucion: "Tira la banda hacia el cuerpo llevando los codos atrás y juntando suavemente las escápulas.", dosis: "3 × 12–15" },
  { id: "wall-slide", nombre: "Deslizamiento en pared", en: "wall slide", region: "hombro", equipo: "Pared", descripcion: "Control escapular en elevación.", ejecucion: "Antebrazos apoyados en la pared. Desliza hacia arriba manteniendo el contacto y protrayendo suavemente las escápulas.", dosis: "3 × 10" },
  { id: "serratus-punch", nombre: "Puñetazo de serrato", en: "serratus punch", region: "hombro", equipo: "Banda / mancuerna", descripcion: "Fuerza del serrato anterior.", ejecucion: "Supino con el brazo al techo. Empuja la mano hacia el techo separando la escápula de la camilla sin flectar el codo.", dosis: "3 × 12–15" },
  { id: "sleeper", nombre: "Elongación del durmiente", en: "sleeper stretch", region: "hombro", equipo: "Camilla", descripcion: "Movilidad de rotación interna y cápsula posterior.", ejecucion: "De lado sobre el hombro afectado, codo a 90°. Con la otra mano lleva suavemente el antebrazo hacia la camilla.", dosis: "3 × 30 s" },
  { id: "overhead-press", nombre: "Press sobre la cabeza", en: "dumbbell overhead press", region: "hombro", equipo: "Mancuernas", descripcion: "Fuerza funcional en elevación completa.", ejecucion: "De pie con el core activo. Empuja las mancuernas sobre la cabeza sin arquear la zona lumbar.", dosis: "3 × 8–10" },

  // ── CERVICAL ──
  { id: "chin-tuck", nombre: "Retracción cervical (chin tuck)", en: "chin tuck", region: "cervical", equipo: "Ninguno", descripcion: "Control postural cervical y alivio de cefalea de origen cervical.", ejecucion: "Sentado o supino. Lleva el mentón hacia atrás creando una doble papada, sin flectar la cabeza hacia abajo.", dosis: "3 × 10 × 5 s" },
  { id: "ccf", nombre: "Flexión cráneo-cervical con biofeedback", en: "craniocervical flexion exercise", region: "cervical", equipo: "Toalla / manguito de presión", descripcion: "Entrenamiento de flexores profundos del cuello.", ejecucion: "Supino con una toalla o manguito bajo la nuca. Asiente suavemente (\"sí\") aumentando la presión por etapas, sin activar los músculos superficiales.", dosis: "10 × 10 s" },
  { id: "cervical-rot-snag", nombre: "Auto-SNAG de rotación cervical", en: "cervical snag self mobilization", region: "cervical", equipo: "Toalla", descripcion: "Automovilización para la restricción en rotación alta (C1–C2).", ejecucion: "Toalla bajo el occipucio, tomando los extremos. Rota la cabeza hacia el lado restringido mientras la toalla acompaña el deslizamiento.", dosis: "2 × 6–10 por lado" },
  { id: "upper-trap-stretch", nombre: "Elongación de trapecio superior", en: "upper trapezius stretch", region: "cervical", equipo: "Ninguno", descripcion: "Disminuye la tensión cervical lateral.", ejecucion: "Sentado sujetando el borde de la silla. Inclina la cabeza hacia el lado contrario y lleva suavemente la oreja al hombro.", dosis: "3 × 30 s por lado" },
  { id: "shrug", nombre: "Encogimiento de hombros con carga", en: "dumbbell shrug", region: "cervical", equipo: "Mancuernas", descripcion: "Fuerza de la musculatura cervicoescapular.", ejecucion: "De pie con mancuernas. Eleva los hombros hacia las orejas y baja lento.", dosis: "3 × 12" },

  // ── LUMBAR / CORE ──
  { id: "dead-bug", nombre: "Dead bug", en: "dead bug", region: "core", equipo: "Colchoneta", descripcion: "Control anti-extensión del tronco.", ejecucion: "Supino con caderas y rodillas a 90° y brazos al techo. Extiende un brazo y la pierna contraria manteniendo la zona lumbar apoyada.", dosis: "3 × 8 por lado" },
  { id: "bird-dog", nombre: "Bird dog (cuadrupedia)", en: "bird dog", region: "core", equipo: "Colchoneta", descripcion: "Estabilidad lumbopélvica y control motor.", ejecucion: "En cuadrupedia. Extiende el brazo y la pierna contraria sin rotar la pelvis. Vuelve lento.", dosis: "3 × 8 por lado", video: "/images/kine-cuadrupedia.mp4" },
  { id: "plank", nombre: "Plancha frontal", en: "front plank", region: "core", equipo: "Colchoneta", descripcion: "Resistencia de la musculatura del tronco.", ejecucion: "Apoyo en antebrazos y pies con el cuerpo alineado. Retroversión pélvica suave, respirando normal.", dosis: "3 × 20–45 s", video: "/images/kine-plancha.mp4" },
  { id: "cat-camel", nombre: "Gato-camello", en: "cat camel", region: "lumbar", equipo: "Colchoneta", descripcion: "Movilidad segmentaria de la columna.", ejecucion: "En cuadrupedia, alterna flexión y extensión de columna de forma lenta y sin dolor.", dosis: "2 × 10" },
  { id: "open-book", nombre: "Libro abierto (rotación torácica)", en: "open book thoracic rotation", region: "lumbar", equipo: "Colchoneta", descripcion: "Movilidad de rotación torácica.", ejecucion: "De lado, caderas y rodillas a 90°. Abre el brazo superior hacia el lado contrario siguiéndolo con la mirada.", dosis: "2 × 10 por lado" },
  { id: "knee-to-chest", nombre: "Rodillas al pecho", en: "knee to chest stretch", region: "lumbar", equipo: "Colchoneta", descripcion: "Relajación lumbar y de la pared abdominal.", ejecucion: "Supino. Lleva las rodillas hacia el pecho con las manos y balancea suavemente.", dosis: "3 × 30 s" },
  { id: "pelvic-tilt", nombre: "Báscula pélvica", en: "pelvic tilt", region: "lumbar", equipo: "Colchoneta", descripcion: "Control lumbopélvico básico y movilidad.", ejecucion: "Supino, rodillas flectadas. Alterna anteversión y retroversión pélvica lentamente coordinando con la respiración.", dosis: "2 × 15" },

  // ── RESPIRACIÓN ──
  { id: "diaphragmatic", nombre: "Respiración diafragmática", en: "diaphragmatic breathing", region: "respiracion", equipo: "Colchoneta", descripcion: "Regulación autonómica y movilidad de la pared abdominal.", ejecucion: "Supino con una mano en el pecho y otra en el abdomen. Inhala por la nariz expandiendo el abdomen; exhala lento por la boca.", dosis: "5–10 min, 1–2 veces al día" },
  { id: "breathing-478", nombre: "Respiración lenta 4-6", en: "slow paced breathing", region: "respiracion", equipo: "Ninguno", descripcion: "Respiración lenta (~6 por minuto) para modular el sistema nervioso autónomo.", ejecucion: "Inhala 4 s por la nariz y exhala 6 s por la boca, sin forzar.", dosis: "5 min, 2 veces al día" },
  { id: "crocodile", nombre: "Respiración de cocodrilo", en: "crocodile breathing", region: "respiracion", equipo: "Colchoneta", descripcion: "Respiración diafragmática en prono para sentir la expansión posterior.", ejecucion: "Prono, frente sobre las manos. Inhala expandiendo el abdomen contra el suelo y la zona lumbar hacia el techo.", dosis: "5–10 respiraciones × 3" },

  // ── GENERAL / AERÓBICO ──
  { id: "bike", nombre: "Bicicleta estática", en: "stationary bike", region: "general", equipo: "Bicicleta estática", descripcion: "Movilidad de rodilla y acondicionamiento aeróbico de bajo impacto.", ejecucion: "Sillín alto al inicio. Pedalea sin resistencia; aumenta la resistencia según tolerancia.", dosis: "10–20 min" },
  { id: "walking", nombre: "Caminata aeróbica", en: "brisk walking", region: "general", equipo: "Ninguno", descripcion: "Actividad aeróbica moderada.", ejecucion: "Camina a un ritmo que permita hablar pero no cantar (RPE 4–6/10).", dosis: "20–40 min, 3–5 días por semana" },
  { id: "yoga-flow", nombre: "Secuencia de yoga suave", en: "gentle yoga", region: "general", equipo: "Colchoneta", descripcion: "Movilidad global, respiración y manejo del estrés.", ejecucion: "Secuencia de 15–20 min: postura del niño, gato-camello, torsión supina, puente y respiración final.", dosis: "15–20 min, 3 veces por semana" },
];

const BY_ID = new Map(EJERCICIOS.map((e) => [e.id, e]));

export function getEjercicio(id: string): Ejercicio | undefined {
  return BY_ID.get(id);
}

/** Fuentes externas de libre consulta (los enlaces abren una búsqueda del ejercicio). */
export const FUENTES_EXTERNAS = [
  { id: "exrx", label: "ExRx", site: "exrx.net" },
  { id: "hep2go", label: "HEP2go", site: "hep2go.com" },
  { id: "rehabhero", label: "Rehab Hero", site: "rehabhero.ca" },
] as const;

export function enlaceFuente(site: string, ejercicio: Pick<Ejercicio, "en">): string {
  return `https://www.google.com/search?q=${encodeURIComponent(`site:${site} ${ejercicio.en}`)}`;
}

/** Resumen compacto para el prompt de generación (solo id, nombre y región). */
export function catalogoParaPrompt(): string {
  return EJERCICIOS.map((e) => `${e.id} | ${e.nombre} | ${e.region}`).join("\n");
}
