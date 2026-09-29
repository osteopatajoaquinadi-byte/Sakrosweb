/* ══════════════════════════════════════════════════════════
   Sakros Fichas — Clinical Constants
   Migrated from sakros-fichas/src/App.jsx
   ══════════════════════════════════════════════════════════ */

// ── Professionals ──
export const USERS = [
  { id: "anikken", name: "Anikken Arentsen", role: "admin" as const, specialty: "Posturología" },
  { id: "joaquin", name: "Joaquín Adi", role: "admin" as const, specialty: "Osteopatía" },
  { id: "camilo", name: "Camilo Zamora", role: "worker" as const, specialty: "Kinesiología" },
  { id: "edison", name: "Edison Ubal", role: "worker" as const, specialty: "Kinesiología" },
] as const;

export type UserRole = "admin" | "worker";
export type UserId = (typeof USERS)[number]["id"];

// ── Red / Yellow Flags ──
export const RED_FLAGS = [
  "Cáncer activo o sospecha oncológica",
  "Fractura no consolidada",
  "Contraindicación para manipulación",
  "Insuficiencia vertebrobasilar (VBI)",
  "Osteoporosis severa",
  "Déficit neurológico progresivo",
  "Síndrome de cauda equina",
  "Infección activa / fiebre sin causa clara",
] as const;

export const YELLOW_FLAGS = [
  "Dolor crónico > 3 meses",
  "Alteraciones intestinales",
  "Inflamación crónica de bajo grado",
  "Alteraciones inmunológicas",
  "Alteraciones del sueño",
  "Catastrofización / miedo-evitación",
] as const;

// ── FMS / SFMA ──
export const FMS_TESTS = [
  "Deep Squat",
  "Hurdle Step",
  "Inline Lunge",
  "Shoulder Mobility",
  "Active Straight Leg Raise",
  "Trunk Stability Push-up",
  "Rotary Stability",
] as const;

export const SFMA_TESTS = [
  "Patrones Cervicales",
  "Extremidad Superior",
  "Flexión Multisegmental",
  "Extensión Multisegmental",
  "Rotación Multisegmental",
  "Single Leg Stance",
  "Overhead Deep Squat",
] as const;

export type SfmaClassification = "FN" | "DN" | "FP" | "DP" | null;
export type SfmaDysfunctionType = "" | "TPI" | "SMCD";

export const SFMA_DETAIL = [
  {
    key: "cervical",
    name: "Patrones Cervicales",
    subtests: ["Flexión cervical", "Extensión cervical", "Rotación D", "Rotación I"],
  },
  {
    key: "upper",
    name: "Extremidad Superior",
    subtests: [
      "Patrón 1 — Mano detrás de la cabeza",
      "Patrón 2 — Mano detrás de la espalda",
      "Patrón 3 — Combinado D",
      "Patrón 3 — Combinado I",
    ],
  },
  {
    key: "flex_multi",
    name: "Flexión Multisegmental",
    subtests: ["Flexión bipedestación", "Flexión en suelo / sentado", "Flexión prono"],
  },
  {
    key: "ext_multi",
    name: "Extensión Multisegmental",
    subtests: ["Extensión bipedestación", "Extensión en suelo"],
  },
  {
    key: "rot_multi",
    name: "Rotación Multisegmental",
    subtests: ["Rotación D", "Rotación I"],
  },
  {
    key: "sls",
    name: "Single Leg Stance",
    subtests: ["Apoyo monopodal D", "Apoyo monopodal I"],
  },
  {
    key: "ods",
    name: "Overhead Deep Squat",
    subtests: ["Squat overhead completo", "Squat con talones elevados"],
  },
] as const;

// ── Orthopedic / Osteopathic Tests ──
export const ORTHO_TESTS = [
  "Jackson",
  "Neri",
  "Compresión",
  "Descompresión",
  "Ross",
  "Adson",
  "Eden",
  "Wright",
] as const;

export const OSTEO_TESTS = [
  "Klein",
  "Hautan",
  "Guillet",
  "Lateroflexión Sacra",
] as const;

// ── Metabolic & Craneal ──
export const META_SIGNS = [
  "Reflujo Gastroesofágico",
  "Acidez",
  "Hinchazón",
  "Hígado Graso / Cirrosis / Hepatitis",
] as const;

export const META_CBX = [
  "HTA",
  "Diabetes",
  "Fibrosis",
  "Autoinmune",
  "Tiroides",
  "Hepático",
] as const;

export const CRANEAL_SIGNS = [
  "Mareo",
  "Vértigo",
  "Náuseas",
  "Cefaleas / Migrañas",
] as const;

// ── Treatment Objectives ──
export type BlockType = "mobilization" | "motorControl" | "load";

export interface Objective {
  id: string;
  icon: string;
  label: string;
  block: BlockType;
  exercises: string[];
}

export const OBJECTIVES: Objective[] = [
  {
    id: "respiracion",
    icon: "💨",
    label: "Respiración / Control respiratorio",
    block: "mobilization",
    exercises: [
      "Crocodile Breathing",
      "90/90 Breathing Position",
      "90/90 Breathing with Lateral Expansion",
      "Cat/Camel Hip Flexed",
    ],
  },
  {
    id: "mov_cadera",
    icon: "🔄",
    label: "Movilidad articular — Cadera / Psoas",
    block: "mobilization",
    exercises: [
      "Half Kneeling Hip Flexor Stretch",
      "Brettzel 2.0",
      "Brettzel 2.0 with Side Bend",
    ],
  },
  {
    id: "mov_tobillo",
    icon: "🔄",
    label: "Movilidad articular — Tobillo",
    block: "mobilization",
    exercises: ["Open Half Kneeling Ankle Mobility with KB"],
  },
  {
    id: "mov_tspine",
    icon: "🔄",
    label: "Movilidad articular — Columna torácica",
    block: "mobilization",
    exercises: [
      "Quadruped T-Spine Rotation Lumbar Locked",
      "Foam Roll - T-Spine",
      "Cat/Camel Hip Flexed",
      "Tall Kneeling KB Halo",
      "Half Kneeling KB Halo",
    ],
  },
  {
    id: "mov_hombro",
    icon: "🔄",
    label: "Movilidad articular — Hombro / EESS",
    block: "mobilization",
    exercises: [
      "Tall Kneeling KB Halo",
      "Half Kneeling KB Halo",
      "Half Kneeling Chop with Med Ball",
    ],
  },
  {
    id: "ctrl_cervical",
    icon: "🔵",
    label: "Control cervical",
    block: "motorControl",
    exercises: [
      "Assisted Half-Kneeling T-Bar Cervical Bobbleheads",
      "Assisted Half-Kneeling T-Bar Cervical Flexion",
      "Assisted Half Kneeling Shoulder Flexion/Extension Cervical Rotation",
      "Assisted Supine T-Bar Cervical Rotation",
    ],
  },
  {
    id: "ctrl_suelo",
    icon: "⚙",
    label: "Control motor — Patrones de suelo",
    block: "motorControl",
    exercises: [
      "Bird Dog - Leg Slide with lift and opposite arm lift",
      "Single-Leg Bridge",
      "Bear Crawl from Quadruped",
      "Prone to Supine Rolling",
      "Half Get-Up",
    ],
  },
  {
    id: "ctrl_estab",
    icon: "⚙",
    label: "Control motor — Estabilidad dinámica",
    block: "motorControl",
    exercises: [
      "Half Kneeling Turns Anterior Load",
      "Tall Kneeling Turns Anterior Load",
      "Single Leg Stance with Core Engagement with Cable System",
      "Farmer's Walk Single Arm Down with One KB",
      "Plank Row with DB",
      "Half Kneeling Chop with Med Ball",
    ],
  },
  {
    id: "fuerza_bisagra",
    icon: "💪",
    label: "Fuerza — Bisagra de cadera",
    block: "load",
    exercises: [
      "Deadlift Lat Engagement (Arm Against Ribs) Drill",
      "Deadlift Double Leg Double Arm with One KB",
      "Deadlift Double Leg Double Arm with Two KB",
      "Deadlift Double Leg Single Arm with One KB",
      "Deadlift Single Leg Double Arm with Two KB",
      "Deadlift Single Leg Single Arm with One KB",
    ],
  },
  {
    id: "fuerza_lunge",
    icon: "💪",
    label: "Fuerza — Patrón de zancada (Lunge)",
    block: "load",
    exercises: [
      "Lunge Forward Goblet with One KB",
      "Lunge Forward Single Arm Down with One KB",
      "Lunge Forward Single Arm Up with One KB",
      "Lunge Forward Single Arm Overhead with One KB",
      "Half Kneeling Single Arm KB Press",
    ],
  },
  {
    id: "potencia",
    icon: "⚡",
    label: "Potencia / Explosividad",
    block: "load",
    exercises: [
      "Swing Double Arm with Towel with One KB",
      "Swing Double Arm with One KB",
    ],
  },
];

// ── Exercise Bank ──
export interface Exercise {
  id: string;
  name: string;
  cat: string;
  equip: string;
  desc: string;
  exec: string;
  reps: string;
}

export const EXERCISE_CATEGORIES = [
  { id: "respiracion", label: "Respiración" },
  { id: "mov_cadera", label: "Movilidad Cadera" },
  { id: "mov_tobillo", label: "Movilidad Tobillo" },
  { id: "mov_tspine", label: "Movilidad T-Spine" },
  { id: "ctrl_cervical", label: "Control Cervical" },
  { id: "ctrl_suelo", label: "Control Suelo" },
  { id: "ctrl_estab", label: "Estabilidad" },
  { id: "fuerza_bisagra", label: "Fuerza Bisagra" },
  { id: "fuerza_lunge", label: "Fuerza Lunge" },
  { id: "potencia", label: "Potencia" },
] as const;

export const EXERCISE_BANK: Exercise[] = [
  // ── RESPIRACIÓN ──
  { id: "cb", name: "Crocodile Breathing", cat: "respiracion", equip: "Colchoneta", desc: "Respiración diafragmática en prono. Aprende a respirar activando el diafragma.", exec: "Acostado boca abajo, frente sobre los brazos. Inhala expandiendo el abdomen hacia el suelo sin elevar hombros. Exhala vaciando el abdomen lentamente.", reps: "5–10 respiraciones × 3 series" },
  { id: "9090b", name: "90/90 Breathing Position", cat: "respiracion", equip: "Pared", desc: "Respiración diafragmática con piernas en 90/90 contra la pared.", exec: "Supino, caderas y rodillas a 90° con pies en la pared. Manos sobre el abdomen. Inhala expandiendo el vientre, exhala completamente.", reps: "10 resp × 3 series" },
  { id: "9090bl", name: "90/90 Breathing with Lateral Expansion", cat: "respiracion", equip: "Pared", desc: "Variante con énfasis en expansión lateral del diafragma.", exec: "Misma posición 90/90. Al inhalar lleva el aire hacia los costados expandiendo las costillas lateralmente. Evita elevar el pecho.", reps: "10 resp × 3 series" },
  { id: "ccam", name: "Cat/Camel Hip Flexed", cat: "respiracion", equip: "Colchoneta", desc: "Movilidad de columna completa integrando técnica respiratoria.", exec: "Cuadrupedia. Camel: inhala llevando la columna en extensión. Cat: exhala flexionando la columna. Ritmo lento movilizando cada segmento.", reps: "10 reps × 3 series" },
  // ── MOVILIDAD CADERA ──
  { id: "hkhfs", name: "Half Kneeling Hip Flexor Stretch", cat: "mov_cadera", equip: "Colchoneta / Pad", desc: "Estiramiento del flexor de cadera en posición de half kneeling.", exec: "Rodilla trasera en el suelo, pie adelantado a 90°. Contrae el glúteo trasero y avanza la cadera hacia adelante manteniendo el tronco erecto. Sostén 30–60 seg.", reps: "3 × 30–60 seg por lado" },
  { id: "btz2", name: "Brettzel 2.0", cat: "mov_cadera", equip: "Colchoneta", desc: "Movilidad de cadena posterior en rotación.", exec: "Decúbito lateral, cadera y rodilla superior a 90°. Mano superior sujeta el pie trasero. Mano inferior fija la rodilla al suelo. Rota el hombro superior hacia atrás buscando el suelo.", reps: "5 reps × 5 seg por lado" },
  { id: "btz2sb", name: "Brettzel 2.0 with Side Bend", cat: "mov_cadera", equip: "Colchoneta", desc: "Variante del Brettzel con inclinación lateral para ampliar el estiramiento de cadena posterior.", exec: "Misma base que Brettzel 2.0. Agrega una inclinación lateral del tronco hacia arriba al momento de rotar, amplificando el estiramiento.", reps: "5 reps × 5 seg por lado" },
  // ── MOVILIDAD TOBILLO ──
  { id: "ohkam", name: "Open Half Kneeling Ankle Mobility with KB", cat: "mov_tobillo", equip: "Kettlebell", desc: "Mejora la dorsiflexión de tobillo en posición de half kneeling.", exec: "Half kneeling con pie adelantado. KB sobre la rodilla. Lleva la rodilla hacia adelante sobre el 5° dedo sin despegar el talón. Controla el descenso.", reps: "10 reps × 3 series por lado" },
  // ── MOVILIDAD T-SPINE ──
  { id: "qtsrl", name: "Quadruped T-Spine Rotation Lumbar Locked", cat: "mov_tspine", equip: "Colchoneta", desc: "Rotación torácica en cuadrupedia con lumbar estabilizada.", exec: "Cuadrupedia, mano detrás de la cabeza. Rota el codo hacia arriba siguiendo con la mirada. Mantén la cadera estable y la espalda baja plana. Controla el retorno.", reps: "10 reps × 3 series por lado" },
  { id: "frts", name: "Foam Roll - T-Spine", cat: "mov_tspine", equip: "Foam Roller", desc: "Liberación miofascial y movilidad de columna torácica con foam roller.", exec: "Foam roller perpendicular a la columna a nivel torácico. Manos detrás de la cabeza, codos juntos. Extiende suavemente sobre el rodillo. Avanza segmento por segmento.", reps: "8–10 reps × 3 puntos" },
  { id: "tkkbh", name: "Tall Kneeling KB Halo", cat: "mov_tspine", equip: "Kettlebell", desc: "Movilidad de tronco superior con estabilidad de tronco inferior en tall kneeling.", exec: "Arrodillado con caderas extendidas. KB invertido sujeto por las asas. Lleva el KB en círculo alrededor de la cabeza manteniendo el tronco estático. Alterna direcciones.", reps: "5 reps por dirección × 3 series" },
  { id: "hkkbh", name: "Half Kneeling KB Halo", cat: "mov_tspine", equip: "Kettlebell / Pad", desc: "Movilidad superior y control motor de tronco inferior en half kneeling.", exec: "Half kneeling. KB invertido por las asas. Lleva el KB en círculo alrededor de la cabeza. El tronco inferior permanece estático, toda la movilidad es del tronco superior.", reps: "5 reps por dirección × 3 series" },
  // ── CONTROL CERVICAL ──
  { id: "ahktbcb", name: "Assisted HK T-Bar Cervical Bobbleheads", cat: "ctrl_cervical", equip: "T-Bar / Bandas / Pad", desc: "Disociación controlada de cabeza y cuello con cuerpo estable en half kneeling.", exec: "Half kneeling sostenido por T-Bar bilateral. Cuerpo completamente estático. Mueve la cabeza en nods y pequeñas rotaciones de forma lenta y controlada.", reps: "10 reps × 3 series" },
  { id: "ahktbcf", name: "Assisted HK T-Bar Cervical Flexion", cat: "ctrl_cervical", equip: "T-Bar / Bandas / Pad", desc: "Patrón de flexión cervical con tronco estabilizado en half kneeling.", exec: "Half kneeling sostenido por T-Bar. Lleva el mentón hacia el pecho en flexión cervical profunda. Evita compensación del tronco. Regresa controlado.", reps: "10 reps × 3 series" },
  { id: "ahksfecr", name: "Assisted HK Shoulder Flex/Ext Cervical Rotation", cat: "ctrl_cervical", equip: "T-Bar / Bandas / Pad", desc: "Rotación cervical coordinada con movimiento de hombro en half kneeling.", exec: "Half kneeling con T-Bar. Eleva un brazo en flexión y simultáneamente rota la cabeza hacia ese lado. Trabaja la disociación óculo-cervical.", reps: "8 reps × 3 series por lado" },
  { id: "astbcr", name: "Assisted Supine T-Bar Cervical Rotation", cat: "ctrl_cervical", equip: "T-Bar / Bandas", desc: "Rotación cervical asistida en decúbito supino.", exec: "Supino con T-Bar. Rota la cabeza de lado a lado de forma lenta y controlada. La asistencia permite mayor rango sin tensión muscular defensiva.", reps: "10 reps × 3 series por lado" },
  // ── CONTROL MOTOR SUELO ──
  { id: "bdls", name: "Bird Dog - Leg Slide with Opposite Arm Lift", cat: "ctrl_suelo", equip: "Colchoneta", desc: "Restablece el patrón de extensión en cuadrupedia con disociación de extremidades.", exec: "Cuadrupedia. Desliza una pierna hacia atrás y eleva el brazo contrario simultáneamente. Columna neutral, sin rotación ni lateralización de pelvis. Regresa controlado.", reps: "8 reps × 3 series por lado" },
  { id: "slb", name: "Single-Leg Bridge", cat: "ctrl_suelo", equip: "Colchoneta", desc: "Restablece el patrón de extensión de cadera unilateral en posición de suelo.", exec: "Supino, pie de apoyo en el suelo a 90°. Extiende la cadera elevando la pelvis, manteniendo ambas rodillas al mismo nivel. Evita rotación pélvica.", reps: "10 reps × 3 series por lado" },
  { id: "bcq", name: "Bear Crawl from Quadruped", cat: "ctrl_suelo", equip: "Colchoneta", desc: "Desarrolla y mantiene el patrón de arrastre con control motor global.", exec: "Cuadrupedia con rodillas a 2–3 cm del suelo. Avanza moviendo brazo y pierna contrarios. Columna neutral, cadera al nivel de los hombros.", reps: "10 m adelante + 10 m atrás × 3 series" },
  { id: "p2s", name: "Prone to Supine Rolling", cat: "ctrl_suelo", equip: "Colchoneta", desc: "Patrón de rodado como punto de partida de la cadena de movimiento.", exec: "Prono. Inicia el rodado desde el tren superior (brazos-hombros) o inferior (piernas-pelvis). Mantén la segmentación y evita compensaciones de impulso.", reps: "5 reps por lado × 3 series" },
  { id: "hgu", name: "Half Get-Up", cat: "ctrl_suelo", equip: "Kettlebell", desc: "Versión modificada del Turkish Get-Up hasta apoyo lateral.", exec: "Supino, KB extendido hacia el techo. Sube al codo, luego a la mano. Eleva la cadera manteniendo el KB vertical todo el tiempo. Controla cada transición.", reps: "5 reps × 3 series por lado" },
  // ── CONTROL MOTOR ESTABILIDAD ──
  { id: "hktal", name: "Half Kneeling Turns Anterior Load", cat: "ctrl_estab", equip: "Kettlebell / Pad", desc: "Exposición de déficit de control motor y asimetrías en half kneeling.", exec: "Half kneeling, KB al frente con ambas manos. Rota el tronco hacia el lado de la rodilla adelantada manteniendo el KB centrado. Controla el retorno.", reps: "8 reps × 3 series por lado" },
  { id: "tktal", name: "Tall Kneeling Turns Anterior Load", cat: "ctrl_estab", equip: "Kettlebell", desc: "Control motor bilateral con carga anterior en tall kneeling.", exec: "Arrodillado con caderas extendidas. KB al frente. Rota el tronco alternando lados manteniendo la pelvis estable. Sin desplazamiento lateral.", reps: "8 reps × 3 series por lado" },
  { id: "slsce", name: "Single Leg Stance Core Engagement with Cable", cat: "ctrl_estab", equip: "Cable / Poleas", desc: "Activación de core y estabilidad en apoyo monopodal con cable.", exec: "Monopodal, cable en manos. Activa el core y mantén la posición estable resistiendo el tirón del cable. Cadena cinética completa, controla la rodilla sobre el pie.", reps: "10 reps × 3 series por lado" },
  { id: "fwsad", name: "Farmer's Walk Single Arm Down with KB", cat: "ctrl_estab", equip: "Kettlebell", desc: "Control motor dinámico y alineación corporal en marcha con carga unilateral.", exec: "KB en una mano al costado. Camina manteniendo los hombros nivelados sin inclinación lateral. El lado cargado desafía cuadrado lumbar y oblicuos.", reps: "20 m × 3 series por lado" },
  { id: "prdb", name: "Plank Row with DB", cat: "ctrl_estab", equip: "Dumbbells / Step", desc: "Estabilidad de hombro y tronco bajo carga anti-rotacional.", exec: "Plancha alta sobre DBs. Rema un DB hacia la cadera manteniendo el tronco estático. Evita rotación y desnivel de cadera.", reps: "8 reps × 3 series por lado" },
  { id: "hkcmb", name: "Half Kneeling Chop with Med Ball", cat: "ctrl_estab", equip: "Balón medicinal", desc: "Ejercicio dinámico de tronco superior en half kneeling.", exec: "Half kneeling. Con el balón realiza un chop diagonal desde arriba hacia abajo (o lift inverso). El tronco inferior permanece estático.", reps: "10 reps × 3 series por lado" },
  // ── FUERZA BISAGRA ──
  { id: "dlaed", name: "Deadlift Lat Engagement Drill", cat: "fuerza_bisagra", equip: "Sin equipo", desc: "Drill de activación de dorsales como preparación al patrón deadlift.", exec: "Bisagra de cadera. Lleva los brazos pegados a las costillas activando los dorsales. Mantén la activación durante toda la bisagra. Es un drill de educación motora.", reps: "10 reps × 3 series" },
  { id: "ddldda1kb", name: "Deadlift Double Leg Double Arm - 1 KB", cat: "fuerza_bisagra", equip: "Kettlebell", desc: "Deadlift bilateral con un KB. Introducción al patrón de bisagra bajo carga.", exec: "KB entre los pies. Bisagra con espalda neutral, agarra el KB con ambas manos. Extiende cadera y rodillas simultáneamente. KB sube pegado al cuerpo.", reps: "5–8 reps × 3–4 series" },
  { id: "ddldda2kb", name: "Deadlift Double Leg Double Arm - 2 KB", cat: "fuerza_bisagra", equip: "2 Kettlebells", desc: "Deadlift bilateral con dos KBs. Mayor demanda de carga simétrica.", exec: "Un KB a cada lado de los pies. Misma mecánica de bisagra. Mayor estabilidad rotacional requerida. Espalda plana durante todo el rango.", reps: "5–8 reps × 3–4 series" },
  { id: "ddldsa1kb", name: "Deadlift Double Leg Single Arm - 1 KB", cat: "fuerza_bisagra", equip: "Kettlebell", desc: "Deadlift con carga asimétrica. Trabaja estabilidad rotacional del tronco.", exec: "KB a un lado. Bisagra y agarra el KB con una sola mano. La carga asimétrica desafía los estabilizadores contralaterales del tronco.", reps: "6 reps × 3 series por lado" },
  { id: "dslda2kb", name: "Deadlift Single Leg Double Arm - 2 KB", cat: "fuerza_bisagra", equip: "2 Kettlebells", desc: "Deadlift unilateral con KBs. Evalúa la contribución de cada cadera.", exec: "Monopodal. KBs a cada lado. Bisagra sobre la pierna de apoyo mientras la libre se eleva hacia atrás. Columna neutral en todo momento.", reps: "6 reps × 3 series por lado" },
  { id: "dslsa1kb", name: "Deadlift Single Leg Single Arm - 1 KB", cat: "fuerza_bisagra", equip: "Kettlebell", desc: "Deadlift unilateral de mayor dificultad con carga contralateral.", exec: "Monopodal. KB en mano contralateral a la pierna de apoyo. Bisagra con control total. KB desciende en línea recta.", reps: "5 reps × 3 series por lado" },
  // ── FUERZA LUNGE ──
  { id: "lfg1kb", name: "Lunge Forward Goblet with KB", cat: "fuerza_lunge", equip: "Kettlebell", desc: "Zancada avanzada con carga goblet. Fuerza y propiocepción en el patrón.", exec: "KB al pecho en posición goblet. Zancada adelante hasta que la rodilla trasera casi toca el suelo. Empuja desde el talón del pie adelantado para volver.", reps: "8 reps × 3 series por lado" },
  { id: "lfsad1kb", name: "Lunge Forward Single Arm Down - 1 KB", cat: "fuerza_lunge", equip: "Kettlebell", desc: "Zancada avanzada con KB en posición baja. Desafía el control lateral del tronco.", exec: "KB colgando al costado en una mano. Zancada adelante. La carga asimétrica aumenta la demanda de control lateral del tronco.", reps: "8 reps × 3 series por lado" },
  { id: "lfsau1kb", name: "Lunge Forward Single Arm Up - 1 KB", cat: "fuerza_lunge", equip: "Kettlebell", desc: "Zancada dinámica con KB en rack. Fuerza y estabilidad de hombro ipsilateral.", exec: "KB en posición rack (hombro). Zancada adelante manteniendo el KB estático. Desafía la estabilidad del hombro y el tronco ipsilateral.", reps: "8 reps × 3 series por lado" },
  { id: "lfsao1kb", name: "Lunge Forward Single Arm Overhead - 1 KB", cat: "fuerza_lunge", equip: "Kettlebell", desc: "Zancada con KB en overhead. Máxima demanda de estabilidad de hombro y tronco.", exec: "KB en overhead con brazo extendido. Zancada adelante manteniendo el KB directamente sobre el hombro. Máxima demanda de estabilidad global.", reps: "6 reps × 3 series por lado" },
  { id: "hksakbp", name: "Half Kneeling Single Arm KB Press", cat: "fuerza_lunge", equip: "Kettlebell / Pad", desc: "Press unilateral de hombro en half kneeling. Fuerza superior + control motor inferior.", exec: "Half kneeling, KB en rack. Presiona el KB hacia arriba extendiendo el codo. Evita la inclinación lateral del tronco. Controla el descenso.", reps: "8 reps × 3 series por lado" },
  // ── POTENCIA ──
  { id: "sdat1kb", name: "Swing Double Arm with Towel - 1 KB", cat: "potencia", equip: "Kettlebell + Toalla", desc: "Drill de aprendizaje del swing desconectado del KB. Percibe la mecánica del swing.", exec: "Toalla a través del asa del KB. Realiza el patrón de swing completo (bisagra + extensión explosiva) con la toalla. Te desconecta del KB para sentir y ver el arco.", reps: "10 reps × 3 series" },
  { id: "sda1kb", name: "Swing Double Arm - 1 KB", cat: "potencia", equip: "Kettlebell", desc: "Swing de dos brazos. Desarrolla potencia explosiva desde cadena cinética cerrada.", exec: "Pies a ancho de hombros, KB entre los pies. Bisagra cargando el KB hacia atrás, extensión explosiva de cadera y rodillas propulsando el KB. Los brazos guían, la potencia viene de la cadera.", reps: "10 reps × 3–4 series" },
];

// ── Reflexes (Posturology) ──
export interface Reflex {
  id: string;
  name: string;
  sides: string[];
}

export const REFLEXES: Reflex[] = [
  { id: "RTL", name: "RTL", sides: ["OA", "OC"] },
  { id: "RTAC", name: "RTAC evaluación garra", sides: ["D", "I"] },
  { id: "RTSC", name: "RTSC", sides: ["F", "E"] },
  { id: "Moro", name: "Reflejo de Moro", sides: [] },
  { id: "Galant", name: "Reflejo Galant", sides: ["D", "I"] },
  { id: "Pereze", name: "Reflejo Pereze / Vollmer", sides: ["P", "V"] },
  { id: "Retirada", name: "Reflejo Retirada", sides: ["D", "I"] },
  { id: "Babinsky", name: "Refl. Babinsky", sides: ["D", "I"] },
  { id: "Plantar", name: "Reflejo Plantar", sides: ["D", "I"] },
  { id: "Landau", name: "Ref. Landau", sides: [] },
  { id: "Palmar", name: "Ref. Palmar", sides: [] },
  { id: "Handspulling", name: "Ref. Handspulling", sides: [] },
  { id: "Babkin", name: "Ref. Babkin", sides: [] },
  { id: "ExtDedos", name: "Reflejo extensión dedos", sides: ["D", "I"] },
  { id: "Reptado", name: "Ref. reptado (hombro)", sides: ["D", "I"] },
  { id: "Anfibio", name: "Ref. Anfibio", sides: [] },
  { id: "Paracaidas", name: "Ref. Paracaídas", sides: [] },
];

// ── Payment Packs ──
export const PACKS = [
  { name: "Osteopatía x5", sessions: 5, price: 185000, service: "Osteopatía" },
  { name: "Método Sakros x10", sessions: 10, price: 290000, service: "Osteopatía" },
  { name: "OSTEOfamiliar x10", sessions: 10, price: 335000, service: "Osteopatía" },
  { name: "Posturología x6", sessions: 6, price: 165000, service: "Posturología Clínica" },
  { name: "Kine x10", sessions: 10, price: 230000, service: "Kinesiología" },
  { name: "KINEPLUS x10", sessions: 10, price: 250000, service: "Kinesiología" },
] as const;

// ── DB-compatible payment values (CHECK constraints) ──
export const PAYMENT_METHODS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "webpay", label: "Webpay (Débito/Crédito)" },
  { value: "otro", label: "Otro" },
] as const;

export const PAYMENT_TYPES = [
  { value: "sesion", label: "Sesión individual" },
  { value: "pack", label: "Bono / Pack" },
] as const;

// ── Service types ──
export const SERVICE_TYPES = [
  "Osteopatía",
  "Kinesiología",
  "Posturología Clínica",
  "Estudio Biomecánico",
  "Actividad Física Dirigida",
] as const;

export const PROFESSIONALS = [
  "Joaquín Adi A.",
  "Anikken Arentsen",
  "Camilo Zamora",
  "Edison",
] as const;

// ── Blank data templates ──
export function blankKine() {
  return {
    motivo: "",
    anamnesis: "",
    ocupacion: "",
    actividadFisica: "",
    enfermedades: "",
    calidadSueno: "",
    caracteristicasDolor: "",
    tipoDolor: [] as string[],
    evalMusculo: "",
    metabolico: "",
    craneal: "",
    ejercicios: "",
    checkedObjectives: Object.fromEntries(OBJECTIVES.map((o) => [o.id, false])) as Record<string, boolean>,
    objectives: [] as { id: string; text: string }[],
    fms: Object.fromEntries(FMS_TESTS.map((t) => [t, { score: null as number | null, notes: "" }])) as Record<string, { score: number | null; notes: string }>,
    sfma: Object.fromEntries(
      SFMA_DETAIL.map((p) => [
        p.key,
        {
          cls: null as SfmaClassification,
          tipo: "" as SfmaDysfunctionType | "",
          notes: "",
          sub: Object.fromEntries(p.subtests.map((s) => [s, { cls: null as SfmaClassification, tipo: "" as SfmaDysfunctionType | "" }])),
        },
      ])
    ) as Record<string, { cls: SfmaClassification; tipo: string; notes: string; sub: Record<string, { cls: SfmaClassification; tipo: string }> }>,
    evalNotes: "",
    blocks: {
      mobilization: { desc: "", obj: "" },
      motorControl: { desc: "", obj: "" },
      load: { desc: "", obj: "" },
    },
  };
}

export function blankOsteo() {
  return {
    contraind: false,
    motivo: "",
    objetivo: "",
    tipoDolor: [] as string[],
    anamnesis: {
      ocupacion: "",
      actividadFisica: "",
      enfermedades: "",
      sueno: { circadiano: "", sleepDrive: "", ultradianos: "" },
    },
    hrv: {
      supino: { hr: "", rmssd: "", sdnn: "", lf: "", hf: "", lfhf: "", pnn50: "", obs: "" },
      sedente: { hr: "", rmssd: "", sdnn: "", lf: "", hf: "", lfhf: "", pnn50: "", obs: "" },
    },
    alimentacion: {
      nComidas: 3,
      comida1: "",
      comida2: "",
      comida3: "",
      snack: "",
      peso: "",
      nivelActividad: "",
      restricciones: {
        sinGluten: false,
        sinLacteos: false,
        sinMani: false,
        sinMariscos: false,
        sinHuevo: false,
        sinSoja: false,
        vegetariano: false,
        vegano: false,
        sinFrutosSecos: false,
        sinCerdo: false,
        otras: "",
      },
      minutaGenerada: null as null | Record<string, unknown>,
    },
    histClinica: { tipoParto: "", traumatismos: "", cirugias: "", lactancia: "", abusos: "" },
    dolor: "",
    testOrtho: Object.fromEntries(ORTHO_TESTS.map((t) => [t, { resultado: "", obs: "" }])) as Record<string, { resultado: string; obs: string }>,
    testOsteo: Object.fromEntries(OSTEO_TESTS.map((t) => [t, ""])) as Record<string, string>,
    quickScanning: "",
    metaSigns: Object.fromEntries(META_SIGNS.map((s) => [s, ""])) as Record<string, string>,
    metaCbx: Object.fromEntries(META_CBX.map((c) => [c, false])) as Record<string, boolean>,
    craneal: Object.fromEntries(CRANEAL_SIGNS.map((s) => [s, ""])) as Record<string, string>,
    otrasObs: "",
  };
}

export function blankPosturo() {
  return {
    examenGlobal: "",
    reflexes: Object.fromEntries(
      REFLEXES.map((r) => [
        r.id,
        {
          sides: Object.fromEntries(r.sides.map((s) => [s, ""])) as Record<string, string>,
          pje: "",
        },
      ])
    ) as Record<string, { sides: Record<string, string>; pje: string }>,
    oculomot: "",
    captores: "",
    evalGeneral: "",
  };
}

export type KinePlan = ReturnType<typeof blankKine>;
export type OsteoPlan = ReturnType<typeof blankOsteo>;
export type PosturoPlan = ReturnType<typeof blankPosturo>;
export type ClinicalPlans = {
  kinePlan?: KinePlan;
  osteoPlan?: OsteoPlan;
  posturoPlan?: PosturoPlan;
};

// ── Utility ──
export function fmtCLP(n: number): string {
  return "$" + n.toLocaleString("es-CL");
}
