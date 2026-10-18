import type { Ejercicio, RegionEjercicio } from "./types";

/* ══════════════════════════════════════════════════════════
   Biblioteca de ejercicios de rehabilitación — Sakros

   Las instrucciones son propias y están escritas para el paciente.
   Fotos: free-exercise-db (github.com/yuhonas/free-exercise-db),
   dominio público (Unlicense). ExRx, HEP2go y Rehab Hero se usan solo
   como enlaces de búsqueda: su contenido tiene derechos reservados.
   ══════════════════════════════════════════════════════════ */

export const REGIONES: { id: RegionEjercicio; label: string }[] = [
  { id: "rodilla", label: "Rodilla" },
  { id: "cadera", label: "Cadera" },
  { id: "tobillo", label: "Tobillo y pie" },
  { id: "hombro", label: "Hombro" },
  { id: "codo", label: "Codo y antebrazo" },
  { id: "cervical", label: "Cervical" },
  { id: "lumbar", label: "Lumbar" },
  { id: "core", label: "Core" },
  { id: "respiracion", label: "Respiración" },
  { id: "general", label: "General / aeróbico" },
];

export const CREDITO_IMAGENES = "Fotos: free-exercise-db (dominio público)";

/** Ejercicios con fotos de inicio y final en /public/images/ejercicios. */
const CON_FOTOS = new Set([
  "bridge", "single-bridge", "side-plank", "mini-squat", "squat", "leg-press", "knee-ext", "step-up",
  "split-squat", "hamstring-curl", "nordic", "rdl", "hip-flexor-stretch", "er-band", "side-lying-er",
  "ir-band", "scaption", "row-band", "overhead-press", "upper-trap-stretch", "shrug", "dead-bug",
  "plank", "cat-camel", "knee-to-chest", "bike", "yoga-flow",
  "wrist-ext-ecc", "wrist-flex", "ankle-rom", "calf-stretch", "standing-hip-abd", "standing-hip-ext", "adductor-band",
]);

type Base = Omit<Ejercicio, "imagenes">;

const LISTA: Base[] = [
  // ── RODILLA ──
  {
    id: "quad-set", nombre: "Contracción isométrica de cuádriceps", en: "quad set", region: "rodilla", equipo: "Toalla enrollada",
    descripcion: "Reactiva el músculo del muslo y ayuda a recuperar la extensión completa de la rodilla.",
    posicion: "Sentado o acostado boca arriba, con la pierna estirada y una toalla enrollada bajo la parte de atrás de la rodilla.",
    pasos: [
      "Aprieta el músculo de la parte delantera del muslo empujando la rodilla hacia la toalla.",
      "Mantén la contracción 10 segundos: deberías ver cómo la rótula sube levemente.",
      "Relaja por completo 3 segundos y repite.",
    ],
    claves: ["Lleva los dedos del pie hacia ti para activar más el muslo.", "Toca el muslo con la mano para comprobar que está duro."],
    evitar: ["Aguantar la respiración.", "Levantar la cadera o empujar con el talón en vez de con la rodilla."],
    dosis: "10 rep × 10 s, 3 veces al día",
  },
  {
    id: "slr", nombre: "Elevación de pierna recta", en: "straight leg raise", region: "rodilla", equipo: "Colchoneta",
    descripcion: "Fortalece el muslo y la cadera sin cargar la rodilla.",
    posicion: "Acostado boca arriba. La pierna que no trabaja queda doblada con el pie apoyado; la que trabaja, estirada.",
    pasos: [
      "Aprieta el muslo de la pierna estirada hasta dejar la rodilla completamente recta.",
      "Sin soltar esa contracción, levanta la pierna hasta la altura de la otra rodilla (unos 45 cm).",
      "Mantén 2 segundos arriba.",
      "Baja lentamente en 3 segundos hasta apoyar el talón.",
    ],
    claves: ["La rodilla no debe doblarse en ningún momento.", "La zona lumbar queda apoyada en el suelo."],
    evitar: ["Subir con impulso.", "Dejar caer la pierna al bajar."],
    dosis: "3 × 10–15",
  },
  {
    id: "heel-slide", nombre: "Deslizamiento de talón", en: "heel slide", region: "rodilla", equipo: "Colchoneta (calcetín o bolsa bajo el talón)",
    descripcion: "Recupera de forma activa la capacidad de doblar la rodilla.",
    posicion: "Acostado boca arriba con ambas piernas estiradas. Pon un calcetín o una bolsa bajo el talón para que deslice fácil.",
    pasos: [
      "Desliza el talón hacia el glúteo doblando la rodilla.",
      "Llega hasta sentir una tensión tolerable y mantén 3–5 segundos.",
      "Vuelve deslizando hasta estirar completamente la pierna.",
    ],
    claves: ["Puedes ayudarte con una toalla alrededor del pie para llegar un poco más lejos.", "Movimiento lento y controlado."],
    evitar: ["Forzar con dolor punzante.", "Despegar el talón del suelo."],
    dosis: "2–3 × 15",
  },
  {
    id: "prone-hang", nombre: "Extensión pasiva en prono", en: "prone knee hang", region: "rodilla", equipo: "Camilla o cama",
    descripcion: "Recupera la extensión completa de la rodilla usando el peso de la pierna.",
    posicion: "Acostado boca abajo en una cama, con la pierna afectada fuera del borde desde la mitad del muslo (la rótula queda en el aire).",
    pasos: [
      "Relaja completamente la pierna y deja que la gravedad la estire.",
      "Mantén la posición el tiempo indicado, respirando tranquilo.",
      "Si tu kinesiólogo lo indica, agrega una tobillera de 0,5–1 kg.",
    ],
    claves: ["Es normal sentir tensión detrás de la rodilla.", "Pon una toalla bajo el muslo si el borde de la cama molesta."],
    evitar: ["Contraer el muslo: la idea es soltar.", "Mantenerlo si aparece hormigueo en el pie."],
    dosis: "3–5 min, 3 veces al día",
  },
  {
    id: "mini-squat", nombre: "Mini sentadilla", en: "mini squat", region: "rodilla", equipo: "Ninguno (apoyo opcional)",
    descripcion: "Primer paso para cargar la pierna de forma segura.",
    posicion: "De pie, pies separados al ancho de las caderas, frente a una mesa o silla para apoyarte si lo necesitas.",
    pasos: [
      "Lleva la cadera hacia atrás como si fueras a sentarte.",
      "Dobla las rodillas solo un poco (30–45°, un cuarto de sentadilla).",
      "Mantén 1 segundo y sube apretando los glúteos.",
    ],
    claves: ["El peso repartido entre ambos pies.", "Las rodillas apuntan hacia el segundo dedo del pie."],
    evitar: ["Que las rodillas se vayan hacia adentro.", "Cargar todo el peso en la pierna sana."],
    dosis: "3 × 12–15",
  },
  {
    id: "squat", nombre: "Sentadilla", en: "bodyweight squat", region: "rodilla", equipo: "Peso corporal o carga",
    descripcion: "Fuerza global de piernas y glúteos.",
    posicion: "De pie, pies al ancho de las caderas o un poco más, puntas levemente hacia afuera.",
    pasos: [
      "Inhala y lleva la cadera hacia atrás y abajo, doblando rodillas y caderas a la vez.",
      "Baja hasta donde mantengas la espalda recta y los talones apoyados (idealmente muslos paralelos al suelo).",
      "Exhala y sube empujando el suelo con todo el pie.",
    ],
    claves: ["Pecho arriba y mirada al frente.", "Rodillas alineadas con los pies durante todo el movimiento."],
    evitar: ["Levantar los talones.", "Redondear la espalda al bajar."],
    dosis: "3–4 × 8–12",
  },
  {
    id: "leg-press", nombre: "Prensa de piernas", en: "leg press", region: "rodilla", equipo: "Máquina de prensa",
    descripcion: "Fortalece el muslo con carga controlada y la espalda apoyada.",
    posicion: "Sentado en la máquina con la espalda y la cabeza apoyadas, pies en la plataforma al ancho de las caderas.",
    pasos: [
      "Suelta los seguros y baja la plataforma doblando las rodillas hasta 90° (o el rango que te indicaron).",
      "Empuja con todo el pie hasta estirar las piernas, sin bloquear las rodillas.",
      "Baja lentamente en 2–3 segundos.",
    ],
    claves: ["La zona lumbar se mantiene pegada al respaldo.", "Elige un peso con el que la última repetición cueste pero salga bien."],
    evitar: ["Bajar tanto que la pelvis se despegue del asiento.", "Bloquear las rodillas de golpe arriba."],
    dosis: "3–4 × 8–12 (esfuerzo 7–8 de 10)",
  },
  {
    id: "knee-ext", nombre: "Extensión de rodilla", en: "leg extension", region: "rodilla", equipo: "Máquina de cuádriceps o tobillera",
    descripcion: "Fortalece el cuádriceps de forma aislada.",
    posicion: "Sentado en la máquina (o en una silla alta con tobillera), espalda apoyada y rodilla alineada con el eje de la máquina.",
    pasos: [
      "Estira la rodilla de forma controlada hasta el límite que te indicaron.",
      "Mantén 1 segundo arriba apretando el muslo.",
      "Baja en 3 segundos.",
    ],
    claves: ["En la rehabilitación de LCA, las primeras semanas se trabaja solo entre 90° y 45°: respeta el rango indicado."],
    evitar: ["Balancear el cuerpo para subir el peso.", "Dejar caer la carga."],
    dosis: "3 × 10–15",
  },
  {
    id: "step-up", nombre: "Subida a escalón", en: "step up", region: "rodilla", equipo: "Escalón o cajón",
    descripcion: "Fuerza de una pierna para escaleras y actividades diarias.",
    posicion: "De pie frente a un escalón estable de 15–30 cm.",
    pasos: [
      "Apoya el pie completo de la pierna que trabaja sobre el escalón.",
      "Sube estirando cadera y rodilla, sin impulsarte con la pierna de abajo.",
      "Baja lentamente apoyando primero la pierna que no trabaja.",
    ],
    claves: ["La rodilla de arriba apunta hacia el segundo dedo del pie.", "El tronco levemente inclinado hacia adelante."],
    evitar: ["Empujarte con el pie de abajo.", "Que la rodilla se vaya hacia adentro."],
    dosis: "3 × 10 por lado",
  },
  {
    id: "step-down", nombre: "Bajada lateral de escalón", en: "lateral step down", region: "rodilla", equipo: "Escalón",
    descripcion: "Control de la rodilla al bajar, clave para escaleras y deporte.",
    posicion: "De pie de lado sobre un escalón, apoyado en la pierna que trabaja; la otra pierna queda en el aire hacia afuera.",
    pasos: [
      "Dobla lentamente la rodilla de apoyo bajando el talón contrario hacia el suelo.",
      "Toca el suelo apenas con el talón, sin apoyar el peso.",
      "Vuelve a subir estirando la rodilla de apoyo.",
    ],
    claves: ["Baja en 3 segundos.", "Mírate en un espejo: la rodilla debe quedar alineada con el pie."],
    evitar: ["Que la rodilla se vaya hacia adentro.", "Que la pelvis se caiga hacia el lado libre."],
    dosis: "3 × 8–12 por lado",
  },
  {
    id: "split-squat", nombre: "Sentadilla dividida", en: "split squat", region: "rodilla", equipo: "Ninguno, mancuernas o banco",
    descripcion: "Fuerza de una pierna para cuádriceps y glúteo.",
    posicion: "De pie con un pie adelante y otro atrás, separados un paso largo (o el pie de atrás apoyado en un banco).",
    pasos: [
      "Baja en línea recta doblando ambas rodillas hasta que la rodilla de atrás quede cerca del suelo.",
      "Mantén el tronco erguido.",
      "Sube empujando con el talón de la pierna de adelante.",
    ],
    claves: ["El peso va principalmente en la pierna de adelante.", "La rodilla de adelante sigue la línea del pie."],
    evitar: ["Inclinarse mucho hacia adelante.", "Golpear la rodilla de atrás contra el suelo."],
    dosis: "3 × 8 por lado",
  },
  {
    id: "hamstring-curl", nombre: "Curl femoral", en: "hamstring curl", region: "rodilla", equipo: "Fitball, banda o máquina",
    descripcion: "Fortalece los músculos de la parte de atrás del muslo.",
    posicion: "Versión con fitball: acostado boca arriba con los talones sobre el balón y los brazos a los costados.",
    pasos: [
      "Levanta la pelvis del suelo hasta alinear hombros, caderas y talones.",
      "Sin bajar la pelvis, dobla las rodillas acercando el balón hacia el glúteo.",
      "Estira lentamente las piernas alejando el balón.",
    ],
    claves: ["Si te operaron con injerto de isquiotibiales, respeta los plazos que indicó el cirujano antes de agregar carga."],
    evitar: ["Dejar caer la pelvis.", "Hacerlo rápido o con calambres."],
    dosis: "3 × 10–12",
  },
  {
    id: "nordic", nombre: "Curl nórdico", en: "nordic hamstring curl", region: "rodilla", equipo: "Compañero o anclaje para los tobillos",
    descripcion: "Fuerza excéntrica de isquiotibiales; previene lesiones en deportistas.",
    posicion: "De rodillas sobre una colchoneta, con los tobillos sujetos por un compañero o un anclaje firme.",
    pasos: [
      "Con la cadera estirada y el cuerpo recto, inclínate hacia adelante lo más lento posible.",
      "Resiste la caída con la parte de atrás de los muslos.",
      "Cuando no puedas frenar más, apóyate con las manos.",
      "Vuelve a la posición inicial ayudándote con las manos.",
    ],
    claves: ["Lo importante es bajar lento, no llegar lejos.", "Es exigente: al principio pocas repeticiones."],
    evitar: ["Doblar la cadera (sacar el glúteo hacia atrás).", "Hacerlo con dolor muscular de días anteriores."],
    dosis: "2–3 × 4–6",
  },
  {
    id: "single-leg-balance", nombre: "Equilibrio en un pie", en: "single leg balance", region: "rodilla", equipo: "Ninguno (cojín opcional)",
    descripcion: "Mejora el control y la estabilidad de la rodilla y el tobillo.",
    posicion: "De pie cerca de una pared o mesa para apoyarte si pierdes el equilibrio.",
    pasos: [
      "Párate en un pie con la rodilla levemente doblada.",
      "Mantén la pelvis nivelada y la mirada al frente.",
      "Cuando sea fácil, progresa: ojos cerrados, cojín blando, mover los brazos o lanzar una pelota.",
    ],
    claves: ["Pequeñas oscilaciones del tobillo son normales: es el ejercicio funcionando."],
    evitar: ["Bloquear la rodilla completamente estirada.", "Inclinar el tronco hacia un lado."],
    dosis: "3–5 × 30 s por lado",
  },
  {
    id: "hop-progression", nombre: "Progresión de saltos", en: "single leg hop", region: "rodilla", equipo: "Ninguno",
    descripcion: "Potencia y absorción de impactos antes de volver al deporte.",
    posicion: "De pie en una superficie firme y antideslizante, con espacio libre alrededor.",
    pasos: [
      "Etapa 1: saltos pequeños en el lugar con ambos pies.",
      "Etapa 2: saltos con ambos pies hacia adelante y hacia los lados.",
      "Etapa 3: saltos en un pie en el lugar, luego hacia adelante y hacia los lados.",
      "En cada aterrizaje, dobla rodillas y caderas y mantén la posición 2 segundos.",
    ],
    claves: ["Aterriza suave y silencioso, sobre la parte delantera del pie.", "Avanza de etapa solo si tu kinesiólogo lo autoriza."],
    evitar: ["Aterrizar con la rodilla recta o hacia adentro.", "Seguir si la rodilla se hincha al día siguiente."],
    dosis: "3–4 × 6–8 por variante",
  },
  {
    id: "running-prog", nombre: "Retorno progresivo a la carrera", en: "return to running program", region: "general", equipo: "Cinta o pista plana",
    descripcion: "Vuelta gradual a correr alternando trote y caminata.",
    posicion: "Calentamiento previo de 5–10 minutos caminando.",
    pasos: [
      "Alterna 1 minuto de trote suave con 1 minuto de caminata, 10 veces.",
      "Si al día siguiente no hay dolor ni hinchazón, la próxima sesión aumenta el trote (2 min trote / 1 min caminata).",
      "Progresa hasta 20–30 minutos de trote continuo.",
    ],
    claves: ["Corre en días no consecutivos.", "Un ritmo en el que puedas conversar."],
    evitar: ["Aumentar distancia y velocidad en la misma semana.", "Correr con cojera."],
    dosis: "3 días por semana",
  },
  {
    id: "agility", nombre: "Agilidad y cambios de dirección", en: "agility ladder drills", region: "general", equipo: "Conos o escalera de agilidad",
    descripcion: "Prepara la rodilla para frenar, girar y cambiar de dirección.",
    posicion: "Superficie firme, conos separados 5–10 m.",
    pasos: [
      "Desplazamientos laterales entre conos.",
      "Carrera hacia adelante con frenada controlada.",
      "Cortes en diagonal (45°) y luego en ángulo recto (90°).",
      "Progresa de movimientos planificados a reaccionar a una señal.",
    ],
    claves: ["Baja el centro de gravedad al frenar.", "Calidad antes que velocidad."],
    evitar: ["Girar con el pie fijo y la rodilla recta.", "Hacerlo cansado al final del entrenamiento."],
    dosis: "15–20 min, 2–3 veces por semana",
  },

  // ── CADERA ──
  {
    id: "bridge", nombre: "Puente de glúteo", en: "glute bridge", region: "cadera", equipo: "Colchoneta",
    descripcion: "Activa y fortalece glúteos y parte de atrás del muslo.",
    posicion: "Acostado boca arriba, rodillas dobladas, pies apoyados al ancho de las caderas y brazos a los costados.",
    pasos: [
      "Aprieta los glúteos y eleva la pelvis del suelo.",
      "Sube hasta alinear hombros, caderas y rodillas.",
      "Mantén 2 segundos arriba.",
      "Baja vértebra por vértebra hasta apoyar.",
    ],
    claves: ["Empuja con los talones.", "Debes sentirlo en los glúteos, no en la zona lumbar."],
    evitar: ["Arquear la espalda para subir más.", "Abrir o juntar las rodillas."],
    dosis: "3 × 12–15",
    video: "/images/kine-puente.mp4",
  },
  {
    id: "single-bridge", nombre: "Puente de glúteo a una pierna", en: "single leg glute bridge", region: "cadera", equipo: "Colchoneta",
    descripcion: "Fuerza de glúteo de un lado y control de la pelvis.",
    posicion: "Como el puente, pero con una pierna estirada en el aire a la altura del otro muslo.",
    pasos: [
      "Empuja con el talón de la pierna apoyada y eleva la pelvis.",
      "Sube hasta alinear hombro, cadera y rodilla.",
      "Baja lento sin apoyar del todo y repite.",
    ],
    claves: ["Las dos caderas suben al mismo nivel, como una mesa."],
    evitar: ["Que la pelvis rote hacia el lado de la pierna en el aire."],
    dosis: "3 × 8–10 por lado",
  },
  {
    id: "clamshell", nombre: "Almeja", en: "clamshell", region: "cadera", equipo: "Banda elástica (opcional)",
    descripcion: "Fortalece el glúteo medio, que estabiliza la cadera y la rodilla.",
    posicion: "Acostado de lado, caderas y rodillas dobladas en unos 45°, pies juntos y cabeza apoyada en el brazo. Banda sobre las rodillas si te la indicaron.",
    pasos: [
      "Sin separar los pies, abre la rodilla de arriba como una almeja.",
      "Sube hasta donde puedas sin que la pelvis rote hacia atrás.",
      "Baja lento en 2 segundos.",
    ],
    claves: ["Pon la mano en la cadera de arriba para controlar que no se mueva.", "Debes sentirlo en el costado del glúteo."],
    evitar: ["Rodar la pelvis hacia atrás para abrir más."],
    dosis: "3 × 15 por lado",
  },
  {
    id: "side-plank", nombre: "Plancha lateral", en: "side plank", region: "cadera", equipo: "Colchoneta",
    descripcion: "Estabilidad del costado del tronco y del glúteo medio.",
    posicion: "De lado, apoyado en el antebrazo con el codo bajo el hombro. Versión fácil: rodillas dobladas; versión avanzada: piernas estiradas.",
    pasos: [
      "Eleva la pelvis del suelo hasta alinear cabeza, hombros, caderas y rodillas (o pies).",
      "Mantén la posición respirando normalmente.",
      "Baja con control.",
    ],
    claves: ["Imagina que estás entre dos vidrios: no te inclines adelante ni atrás."],
    evitar: ["Dejar caer la cadera.", "Hundir el hombro de apoyo."],
    dosis: "3 × 20–40 s por lado",
  },
  {
    id: "rdl", nombre: "Peso muerto rumano", en: "romanian deadlift", region: "cadera", equipo: "Mancuernas o barra",
    descripcion: "Fortalece glúteos, isquiotibiales y espalda con el patrón de bisagra de cadera.",
    posicion: "De pie, pies al ancho de las caderas, rodillas levemente dobladas y el peso frente a los muslos.",
    pasos: [
      "Lleva la cadera hacia atrás inclinando el tronco con la espalda recta.",
      "Baja el peso pegado a las piernas hasta media canilla o hasta sentir tensión detrás de los muslos.",
      "Sube empujando la cadera hacia adelante y apretando los glúteos.",
    ],
    claves: ["Las rodillas casi no se mueven: el movimiento es de cadera.", "Hombros atrás y espalda neutra todo el tiempo."],
    evitar: ["Redondear la espalda.", "Alejar el peso del cuerpo."],
    dosis: "3 × 8–10",
  },
  {
    id: "hip-flexor-stretch", nombre: "Elongación de flexores de cadera", en: "kneeling hip flexor stretch", region: "cadera", equipo: "Colchoneta o cojín",
    descripcion: "Mejora la movilidad de la parte delantera de la cadera.",
    posicion: "Arrodillado en una pierna (como caballero), la rodilla de atrás sobre un cojín y el pie de adelante bien apoyado.",
    pasos: [
      "Mete levemente la pelvis (como guardando la cola) y aprieta el glúteo de la pierna de atrás.",
      "Lleva suavemente la cadera hacia adelante hasta sentir la elongación en la ingle de atrás.",
      "Mantén el tiempo indicado respirando lento.",
    ],
    claves: ["Para aumentar la elongación, eleva el brazo del mismo lado de la rodilla apoyada."],
    evitar: ["Arquear la zona lumbar.", "Rebotar."],
    dosis: "3 × 30 s por lado",
  },

  // ── TOBILLO ──
  {
    id: "calf-raise", nombre: "Elevación de talones", en: "calf raise", region: "tobillo", equipo: "Escalón y apoyo para las manos",
    descripcion: "Fortalece la pantorrilla y el tendón de Aquiles.",
    posicion: "De pie con la parte delantera de los pies en el borde de un escalón, apoyado en una baranda.",
    pasos: [
      "Sube en punta de pies lo más alto posible.",
      "Mantén 1 segundo arriba.",
      "Baja en 3 segundos dejando que los talones pasen por debajo del nivel del escalón.",
      "Progresión: hazlo en un pie.",
    ],
    claves: ["El peso sobre el dedo gordo y el segundo dedo.", "Rodillas estiradas (o dobladas para trabajar el sóleo)."],
    evitar: ["Hacerlo rápido o rebotando abajo.", "Que el tobillo se vaya hacia afuera."],
    dosis: "3 × 15",
  },
  {
    id: "ankle-df-mob", nombre: "Movilidad de tobillo en pared", en: "knee to wall ankle mobility", region: "tobillo", equipo: "Pared",
    descripcion: "Recupera la flexión del tobillo necesaria para sentadillas, escaleras y carrera.",
    posicion: "De pie frente a una pared, con el pie que trabaja a unos 5–10 cm de ella y el otro pie atrás.",
    pasos: [
      "Lleva la rodilla hacia adelante intentando tocar la pared.",
      "El talón no se despega del suelo.",
      "Vuelve atrás y repite. Si tocas fácil, aleja un poco el pie.",
    ],
    claves: ["La rodilla avanza en línea con el segundo dedo."],
    evitar: ["Levantar el talón.", "Hundir el arco del pie hacia adentro."],
    dosis: "2 × 15 por lado",
  },

  // ── HOMBRO ──
  {
    id: "pendulum", nombre: "Pendulares", en: "pendulum exercise", region: "hombro", equipo: "Mesa para apoyarse",
    descripcion: "Movilidad suave del hombro cuando está muy doloroso.",
    posicion: "De pie, inclinado hacia adelante con la mano sana apoyada en una mesa y el brazo afectado colgando relajado.",
    pasos: [
      "Balancea suavemente el cuerpo para que el brazo se mueva solo.",
      "Haz círculos pequeños en un sentido y luego en el otro.",
      "También puedes balancearlo adelante-atrás y de lado a lado.",
    ],
    claves: ["El brazo está suelto, como un péndulo: el movimiento lo genera el cuerpo."],
    evitar: ["Mover el brazo con fuerza muscular.", "Círculos grandes que provoquen dolor."],
    dosis: "1–2 min, 2–3 veces al día",
  },
  {
    id: "iso-er", nombre: "Isométrico de rotación externa", en: "isometric shoulder external rotation", region: "hombro", equipo: "Pared o marco de puerta",
    descripcion: "Activa el manguito rotador y alivia el dolor cuando el hombro está irritado.",
    posicion: "De pie de lado a una pared, codo doblado en 90° pegado al cuerpo y el dorso de la mano contra la pared.",
    pasos: [
      "Empuja la mano contra la pared como si quisieras girar el antebrazo hacia afuera.",
      "Usa entre el 30 y el 50 % de tu fuerza: el brazo no se mueve.",
      "Mantén el tiempo indicado y relaja.",
    ],
    claves: ["Una toalla doblada entre el codo y el cuerpo ayuda a mantener la posición.", "El dolor debería disminuir durante el ejercicio."],
    evitar: ["Empujar con tanta fuerza que duela más.", "Encoger el hombro."],
    dosis: "5 × 30–45 s",
  },
  {
    id: "er-band", nombre: "Rotación externa con banda", en: "band external rotation", region: "hombro", equipo: "Banda elástica y toalla",
    descripcion: "Fortalece los músculos de atrás del manguito rotador.",
    posicion: "De pie, banda fija a la altura del codo hacia el lado contrario. Codo en 90° pegado al cuerpo con una toalla enrollada bajo el brazo.",
    pasos: [
      "Gira el antebrazo hacia afuera estirando la banda, como una puerta que se abre.",
      "Mantén 1 segundo al final.",
      "Vuelve lentamente en 3 segundos.",
    ],
    claves: ["El codo no se separa de la toalla.", "Hombro abajo y atrás, lejos de la oreja."],
    evitar: ["Rotar el tronco para ayudarte.", "Soltar la banda de golpe al volver."],
    dosis: "3 × 12–15",
  },
  {
    id: "side-lying-er", nombre: "Rotación externa acostado de lado", en: "side lying external rotation", region: "hombro", equipo: "Mancuerna liviana (0,5–2 kg)",
    descripcion: "Fortalece el manguito rotador con carga progresiva.",
    posicion: "Acostado sobre el lado sano, codo del brazo de arriba doblado en 90° y apoyado en el costado, con una toalla enrollada debajo.",
    pasos: [
      "Con la mancuerna en la mano, gira el antebrazo hacia el techo.",
      "Sube hasta donde el codo siga pegado al cuerpo.",
      "Baja lentamente en 3 segundos.",
    ],
    claves: ["Es un movimiento pequeño y preciso.", "Si al final de la serie cuesta, el peso es el correcto."],
    evitar: ["Despegar el codo del cuerpo.", "Rodar el tronco hacia atrás."],
    dosis: "3 × 10–15",
  },
  {
    id: "ir-band", nombre: "Rotación interna con banda", en: "band internal rotation", region: "hombro", equipo: "Banda elástica",
    descripcion: "Fortalece el subescapular, en la parte delantera del manguito.",
    posicion: "De pie, banda fija a la altura del codo hacia el lado del brazo que trabaja. Codo en 90° pegado al cuerpo.",
    pasos: [
      "Lleva la mano hacia el abdomen estirando la banda.",
      "Mantén 1 segundo.",
      "Vuelve lentamente a la posición inicial.",
    ],
    claves: ["El codo queda fijo junto al cuerpo."],
    evitar: ["Encoger el hombro o inclinar el tronco."],
    dosis: "3 × 12–15",
  },
  {
    id: "scaption", nombre: "Elevación en plano escapular", en: "scaption", region: "hombro", equipo: "Mancuernas livianas",
    descripcion: "Fortalece el supraespinoso y el deltoides en el ángulo más cómodo para el hombro.",
    posicion: "De pie, brazos a los lados con las palmas hacia adentro y los pulgares hacia adelante.",
    pasos: [
      "Eleva los brazos rectos en diagonal, unos 30° por delante del cuerpo (forma de V).",
      "Sube hasta la altura de los hombros.",
      "Baja en 3 segundos.",
    ],
    claves: ["Pulgares hacia arriba.", "Hombros lejos de las orejas."],
    evitar: ["Encoger los hombros.", "Arquear la espalda para subir."],
    dosis: "3 × 10–12",
  },
  {
    id: "row-band", nombre: "Remo", en: "band row", region: "hombro", equipo: "Banda elástica o polea",
    descripcion: "Fortalece los músculos entre las escápulas y mejora la postura del hombro.",
    posicion: "Sentado o de pie frente a la banda fijada a la altura del pecho, brazos estirados hacia adelante.",
    pasos: [
      "Lleva primero las escápulas hacia atrás y abajo.",
      "Luego tira de la banda llevando los codos hacia atrás, cerca del cuerpo.",
      "Vuelve lentamente estirando los brazos.",
    ],
    claves: ["Pecho arriba durante todo el movimiento.", "Siente cómo se juntan suavemente las escápulas."],
    evitar: ["Inclinar el tronco hacia atrás.", "Encoger los hombros hacia las orejas."],
    dosis: "3 × 12–15",
  },
  {
    id: "wall-slide", nombre: "Deslizamiento en pared", en: "wall slide", region: "hombro", equipo: "Pared",
    descripcion: "Entrena el control de la escápula al levantar los brazos.",
    posicion: "De pie frente a una pared, antebrazos apoyados en ella a la altura de los hombros (codos en 90°).",
    pasos: [
      "Empuja suavemente la pared para separar las escápulas.",
      "Desliza los antebrazos hacia arriba manteniendo el contacto.",
      "Sube hasta donde no haya dolor y vuelve lento.",
    ],
    claves: ["Una banda alrededor de las muñecas aumenta la activación."],
    evitar: ["Arquear la zona lumbar.", "Encoger los hombros al subir."],
    dosis: "3 × 10",
  },
  {
    id: "serratus-punch", nombre: "Puñetazo de serrato", en: "serratus punch", region: "hombro", equipo: "Mancuerna liviana o nada",
    descripcion: "Fortalece el serrato anterior, que estabiliza la escápula.",
    posicion: "Acostado boca arriba, brazo estirado hacia el techo con la mano cerrada.",
    pasos: [
      "Sin doblar el codo, empuja el puño hacia el techo separando la escápula del suelo.",
      "Mantén 1 segundo.",
      "Baja lentamente la escápula hasta apoyarla.",
    ],
    claves: ["Es un movimiento corto, de pocos centímetros."],
    evitar: ["Doblar el codo.", "Levantar la cabeza."],
    dosis: "3 × 12–15",
  },
  {
    id: "sleeper", nombre: "Elongación del durmiente", en: "sleeper stretch", region: "hombro", equipo: "Cama o colchoneta",
    descripcion: "Mejora la rotación interna y elonga la parte de atrás del hombro.",
    posicion: "Acostado sobre el hombro que trabaja, brazo hacia adelante con el codo a la altura del hombro y doblado en 90°.",
    pasos: [
      "Con la otra mano, lleva suavemente el antebrazo hacia la cama.",
      "Detente al sentir tensión en la parte de atrás del hombro.",
      "Mantén respirando lento.",
    ],
    claves: ["Gira un poco el tronco hacia atrás si sientes molestia adelante."],
    evitar: ["Forzar con dolor punzante en la parte delantera del hombro."],
    dosis: "3 × 30 s",
  },
  {
    id: "overhead-press", nombre: "Press sobre la cabeza", en: "dumbbell overhead press", region: "hombro", equipo: "Mancuernas",
    descripcion: "Fuerza funcional para levantar objetos sobre la cabeza.",
    posicion: "Sentado o de pie, mancuernas a la altura de los hombros con las palmas hacia adelante.",
    pasos: [
      "Aprieta el abdomen y empuja las mancuernas hacia arriba.",
      "Estira los brazos sin bloquear los codos.",
      "Baja en 2–3 segundos hasta la altura de los hombros.",
    ],
    claves: ["Las costillas se mantienen abajo, sin arquear la espalda."],
    evitar: ["Arquear la zona lumbar.", "Subir con impulso de las piernas."],
    dosis: "3 × 8–10",
  },

  // ── CERVICAL ──
  {
    id: "chin-tuck", nombre: "Retracción cervical (doble mentón)", en: "chin tuck", region: "cervical", equipo: "Ninguno",
    descripcion: "Mejora el control de la postura del cuello y alivia la cefalea de origen cervical.",
    posicion: "Sentado derecho o acostado boca arriba, mirando al frente.",
    pasos: [
      "Lleva el mentón hacia atrás en línea recta, como haciendo una doble papada.",
      "Siente cómo se alarga la parte de atrás del cuello.",
      "Mantén 5 segundos y relaja.",
    ],
    claves: ["La mirada se mantiene horizontal."],
    evitar: ["Bajar la cabeza mirando al suelo.", "Apretar la mandíbula."],
    dosis: "3 × 10 × 5 s",
  },
  {
    id: "ccf", nombre: "Flexión cráneo-cervical", en: "craniocervical flexion exercise", region: "cervical", equipo: "Toalla doblada o manguito de presión",
    descripcion: "Entrena los músculos profundos del cuello, clave en la cefalea cervicogénica.",
    posicion: "Acostado boca arriba con rodillas dobladas y una toalla doblada bajo la nuca (o el manguito inflado a 20 mmHg).",
    pasos: [
      "Haz un pequeño gesto de \"sí\" con la cabeza, llevando el mentón levemente hacia la garganta.",
      "Siente cómo la nuca presiona suavemente la toalla.",
      "Mantén 10 segundos respirando normal y relaja.",
    ],
    claves: ["Es un gesto muy sutil.", "Si usas manguito, sube de 2 en 2 mmHg según te indiquen."],
    evitar: ["Levantar la cabeza.", "Tensar los músculos de adelante del cuello."],
    dosis: "10 × 10 s",
  },
  {
    id: "cervical-rot-snag", nombre: "Automovilización de rotación cervical", en: "cervical snag self mobilization", region: "cervical", equipo: "Toalla",
    descripcion: "Libera la rotación de la parte alta del cuello en la cefalea cervicogénica.",
    posicion: "Sentado derecho. Pasa una toalla por detrás de la parte alta del cuello, justo bajo la base del cráneo, y toma sus extremos.",
    pasos: [
      "Con la mano del lado contrario, tira el extremo de la toalla hacia adelante, en dirección a tu ojo.",
      "Mientras mantienes la tensión, gira lentamente la cabeza hacia el lado restringido.",
      "Mantén 2–3 segundos al final y vuelve al centro.",
    ],
    claves: ["El movimiento debe ser indoloro: la toalla acompaña el giro."],
    evitar: ["Hacerlo si aparece mareo, visión doble u hormigueo: suspende y avisa a tu profesional."],
    dosis: "2 × 6–10 por lado",
  },
  {
    id: "upper-trap-stretch", nombre: "Elongación de trapecio superior", en: "upper trapezius stretch", region: "cervical", equipo: "Silla",
    descripcion: "Disminuye la tensión del costado del cuello.",
    posicion: "Sentado derecho, sujetando con una mano el borde de la silla.",
    pasos: [
      "Inclina la cabeza hacia el lado contrario a la mano que sujeta la silla.",
      "Con la otra mano, acompaña suavemente la cabeza hacia el hombro.",
      "Mantén respirando lento.",
    ],
    claves: ["Siente la elongación en el costado del cuello y del hombro."],
    evitar: ["Tirar con fuerza de la cabeza.", "Subir el hombro del lado que se elonga."],
    dosis: "3 × 30 s por lado",
  },
  {
    id: "shrug", nombre: "Encogimiento de hombros", en: "dumbbell shrug", region: "cervical", equipo: "Mancuernas",
    descripcion: "Fortalece la musculatura entre el cuello y los hombros.",
    posicion: "De pie, brazos a los lados con una mancuerna en cada mano.",
    pasos: [
      "Sube los hombros hacia las orejas en línea recta.",
      "Mantén 1 segundo arriba.",
      "Baja lentamente en 3 segundos.",
    ],
    claves: ["Los brazos solo sostienen el peso: el movimiento es de hombros."],
    evitar: ["Girar los hombros en círculo.", "Adelantar la cabeza."],
    dosis: "3 × 12",
  },

  // ── LUMBAR / CORE ──
  {
    id: "dead-bug", nombre: "Bicho muerto (dead bug)", en: "dead bug", region: "core", equipo: "Colchoneta",
    descripcion: "Entrena el control del abdomen sin cargar la columna.",
    posicion: "Acostado boca arriba, caderas y rodillas en 90° (piernas en el aire) y brazos estirados hacia el techo.",
    pasos: [
      "Apoya la zona lumbar en el suelo apretando suavemente el abdomen.",
      "Estira lentamente un brazo hacia atrás y la pierna contraria hacia adelante.",
      "Vuelve al centro y alterna con el otro lado.",
    ],
    claves: ["Exhala al estirar.", "La zona lumbar no se despega del suelo."],
    evitar: ["Arquear la espalda.", "Hacerlo rápido."],
    dosis: "3 × 8 por lado",
  },
  {
    id: "bird-dog", nombre: "Cuadrupedia con brazo y pierna (bird dog)", en: "bird dog", region: "core", equipo: "Colchoneta",
    descripcion: "Estabilidad de la columna y control del tronco.",
    posicion: "En cuatro apoyos: manos bajo los hombros, rodillas bajo las caderas y espalda recta.",
    pasos: [
      "Estira un brazo hacia adelante y la pierna contraria hacia atrás.",
      "Mantén 3–5 segundos con el tronco quieto.",
      "Vuelve lento al centro y alterna.",
    ],
    claves: ["Imagina un vaso de agua sobre la zona lumbar que no se debe caer."],
    evitar: ["Rotar la pelvis.", "Levantar la pierna más alto que la cadera."],
    dosis: "3 × 8 por lado",
    video: "/images/kine-cuadrupedia.mp4",
  },
  {
    id: "plank", nombre: "Plancha frontal", en: "front plank", region: "core", equipo: "Colchoneta",
    descripcion: "Resistencia de la musculatura del tronco.",
    posicion: "Boca abajo, apoyado en antebrazos (codos bajo los hombros) y puntas de pies. Versión fácil: rodillas apoyadas.",
    pasos: [
      "Eleva el cuerpo formando una línea recta de cabeza a talones.",
      "Aprieta glúteos y abdomen.",
      "Mantén respirando normalmente.",
    ],
    claves: ["Mirada al suelo, cuello alineado."],
    evitar: ["Hundir la zona lumbar.", "Subir mucho la cadera.", "Aguantar la respiración."],
    dosis: "3 × 20–45 s",
    video: "/images/kine-plancha.mp4",
  },
  {
    id: "cat-camel", nombre: "Gato-camello", en: "cat camel", region: "lumbar", equipo: "Colchoneta",
    descripcion: "Movilidad suave de toda la columna.",
    posicion: "En cuatro apoyos: manos bajo los hombros y rodillas bajo las caderas.",
    pasos: [
      "Exhala y redondea la espalda hacia el techo, llevando la cabeza hacia abajo (gato).",
      "Inhala y hunde suavemente la espalda, llevando la mirada al frente (camello).",
      "Alterna de forma lenta y fluida.",
    ],
    claves: ["Mueve la columna vértebra por vértebra."],
    evitar: ["Llegar a posiciones extremas con dolor."],
    dosis: "2 × 10",
  },
  {
    id: "open-book", nombre: "Libro abierto (rotación torácica)", en: "open book thoracic rotation", region: "lumbar", equipo: "Colchoneta y cojín",
    descripcion: "Mejora la rotación de la columna dorsal.",
    posicion: "Acostado de lado, caderas y rodillas dobladas en 90°, cabeza sobre un cojín y brazos estirados al frente, palmas juntas.",
    pasos: [
      "Abre el brazo de arriba hacia el lado contrario, como abriendo un libro.",
      "Sigue la mano con la mirada.",
      "Mantén 2–3 segundos y vuelve lento.",
    ],
    claves: ["Las rodillas se mantienen juntas y apoyadas."],
    evitar: ["Separar las rodillas.", "Forzar el hombro al final."],
    dosis: "2 × 10 por lado",
  },
  {
    id: "knee-to-chest", nombre: "Rodillas al pecho", en: "knee to chest stretch", region: "lumbar", equipo: "Colchoneta",
    descripcion: "Relaja la zona lumbar y la pared abdominal.",
    posicion: "Acostado boca arriba con las rodillas dobladas.",
    pasos: [
      "Lleva una o ambas rodillas hacia el pecho tomándolas con las manos.",
      "Mantén respirando lento por el abdomen.",
      "Puedes balancearte suavemente de lado a lado.",
    ],
    claves: ["Hombros y cabeza relajados en el suelo."],
    evitar: ["Tirar con fuerza de las rodillas."],
    dosis: "3 × 30 s",
  },
  {
    id: "pelvic-tilt", nombre: "Báscula pélvica", en: "pelvic tilt", region: "lumbar", equipo: "Colchoneta",
    descripcion: "Control y movilidad de la pelvis y la zona lumbar.",
    posicion: "Acostado boca arriba, rodillas dobladas y pies apoyados.",
    pasos: [
      "Exhala y aplana la zona lumbar contra el suelo, llevando el pubis hacia el ombligo.",
      "Inhala y arquea suavemente la zona lumbar.",
      "Alterna de forma lenta.",
    ],
    claves: ["Coordina el movimiento con la respiración."],
    evitar: ["Levantar los glúteos del suelo."],
    dosis: "2 × 15",
  },

  // ── RESPIRACIÓN ──
  {
    id: "diaphragmatic", nombre: "Respiración diafragmática", en: "diaphragmatic breathing", region: "respiracion", equipo: "Colchoneta",
    descripcion: "Relaja el sistema nervioso y moviliza el abdomen.",
    posicion: "Acostado boca arriba con rodillas dobladas, una mano en el pecho y otra en el abdomen.",
    pasos: [
      "Inhala lento por la nariz inflando el abdomen: la mano del abdomen sube, la del pecho casi no se mueve.",
      "Exhala lento por la boca, como soplando una vela suavemente.",
      "La exhalación dura un poco más que la inhalación.",
    ],
    claves: ["Hazlo en un lugar tranquilo.", "También sirve sentado, antes de dormir o ante el dolor."],
    evitar: ["Subir los hombros al inhalar.", "Forzar el aire."],
    dosis: "5–10 min, 1–2 veces al día",
  },
  {
    id: "breathing-478", nombre: "Respiración lenta 4-6", en: "slow paced breathing", region: "respiracion", equipo: "Ninguno",
    descripcion: "Respiración lenta (unas 6 por minuto) que calma el sistema nervioso.",
    posicion: "Sentado cómodo con la espalda apoyada, o acostado.",
    pasos: [
      "Inhala por la nariz contando hasta 4.",
      "Exhala por la boca contando hasta 6.",
      "Repite sin pausas, a un ritmo cómodo.",
    ],
    claves: ["Una app de respiración o un temporizador ayudan a mantener el ritmo."],
    evitar: ["Marearte por respirar muy profundo: suaviza la respiración."],
    dosis: "5 min, 2 veces al día",
  },
  {
    id: "crocodile", nombre: "Respiración de cocodrilo", en: "crocodile breathing", region: "respiracion", equipo: "Colchoneta",
    descripcion: "Respiración diafragmática boca abajo para sentir la expansión de la espalda.",
    posicion: "Acostado boca abajo con la frente apoyada sobre las manos.",
    pasos: [
      "Inhala por la nariz llevando el aire hacia el abdomen y la zona lumbar.",
      "Siente cómo el abdomen empuja el suelo y la zona lumbar sube.",
      "Exhala lento por la boca.",
    ],
    claves: ["Pide a alguien que ponga la mano en tu zona lumbar para sentir el movimiento."],
    evitar: ["Respirar solo con el pecho."],
    dosis: "5–10 respiraciones × 3",
  },

  // ── GENERAL / AERÓBICO ──
  {
    id: "bike", nombre: "Bicicleta estática", en: "stationary bike", region: "general", equipo: "Bicicleta estática",
    descripcion: "Mueve la rodilla y mejora la condición física sin impacto.",
    posicion: "Sillín a una altura en que la rodilla quede casi estirada con el pedal abajo.",
    pasos: [
      "Pedalea sin resistencia los primeros minutos.",
      "Si al principio no logras dar la vuelta completa, haz medias vueltas hacia adelante y atrás.",
      "Aumenta la resistencia de forma gradual según tolerancia.",
    ],
    claves: ["Un sillín alto facilita la vuelta cuando la rodilla aún no dobla del todo."],
    evitar: ["Resistencia alta en las primeras semanas.", "Pedalear con dolor que aumenta."],
    dosis: "10–20 min",
  },
  {
    id: "walking", nombre: "Caminata", en: "brisk walking", region: "general", equipo: "Ninguno",
    descripcion: "Actividad aeróbica moderada con beneficios generales y digestivos.",
    posicion: "Calzado cómodo y un recorrido plano.",
    pasos: [
      "Comienza a ritmo suave 5 minutos.",
      "Aumenta a un ritmo en que puedas hablar pero no cantar.",
      "Termina con 5 minutos suaves.",
    ],
    claves: ["Lo importante es la regularidad.", "Esfuerzo moderado: 4–6 de 10."],
    evitar: ["Pasar de nada a sesiones largas de golpe."],
    dosis: "20–40 min, 3–5 días por semana",
  },
  {
    id: "yoga-flow", nombre: "Secuencia de yoga suave", en: "gentle yoga", region: "general", equipo: "Colchoneta",
    descripcion: "Movilidad global, respiración y manejo del estrés.",
    posicion: "Colchoneta en un lugar tranquilo, ropa cómoda.",
    pasos: [
      "Postura del niño: rodillas separadas, glúteos hacia los talones y brazos estirados adelante (1 min).",
      "Gato-camello lento (10 veces).",
      "Torsión acostado: rodillas dobladas que caen hacia un lado y luego al otro (30 s por lado).",
      "Puente de glúteo (10 veces).",
      "Termina acostado con respiración diafragmática (3–5 min).",
    ],
    claves: ["Coordina cada movimiento con la respiración.", "Ningún movimiento debe doler."],
    evitar: ["Competir con la flexibilidad: cada cuerpo es distinto."],
    dosis: "15–20 min, 3 veces por semana",
  },

  // ── CODO Y ANTEBRAZO ──
  {
    id: "wrist-ext-iso", nombre: "Isométrico de extensores de muñeca", en: "isometric wrist extension", region: "codo", equipo: "Mesa",
    descripcion: "Calma el dolor del epicóndilo y activa los extensores sin mover la articulación.",
    posicion: "Sentado, antebrazo apoyado en una mesa con la palma hacia abajo y la mano fuera del borde. La otra mano sobre el dorso de la mano que trabaja.",
    pasos: [
      "Intenta levantar el dorso de la mano mientras la otra mano lo impide: la muñeca no se mueve.",
      "Usa una fuerza moderada, con molestia de hasta 3 de 10.",
      "Mantén el tiempo indicado y relaja lentamente.",
    ],
    claves: ["El codo puede estar doblado al principio y luego más estirado para hacerlo más exigente.", "El dolor suele bajar durante o después del ejercicio."],
    evitar: ["Empujar tan fuerte que el dolor aumente.", "Encoger el hombro."],
    dosis: "5 × 30–45 s, 1–2 veces al día",
  },
  {
    id: "wrist-ext-ecc", nombre: "Extensión de muñeca con mancuerna (énfasis excéntrico)", en: "eccentric wrist extension", region: "codo", equipo: "Mancuerna liviana (0,5–3 kg)",
    descripcion: "Fortalece los extensores de la muñeca, base del tratamiento de la epicondilalgia lateral.",
    posicion: "Sentado, antebrazo apoyado sobre el muslo o una mesa con la palma hacia abajo y la muñeca fuera del borde, sosteniendo la mancuerna.",
    pasos: [
      "Ayúdate con la otra mano para subir la mancuerna (fase sin esfuerzo).",
      "Suelta la ayuda y baja la mancuerna lentamente en 3–4 segundos usando solo la muñeca.",
      "Repite. Cuando sea fácil, sube también sin ayuda.",
    ],
    claves: ["Molestia tolerable (hasta 3–4 de 10) que no empeore al día siguiente.", "Aumenta el peso de a poco cada 1–2 semanas."],
    evitar: ["Mover el antebrazo o el codo.", "Dejar caer la mancuerna."],
    dosis: "3 × 15, 1 vez al día",
  },
  {
    id: "wrist-flex", nombre: "Flexión de muñeca con mancuerna", en: "dumbbell wrist curl", region: "codo", equipo: "Mancuerna liviana",
    descripcion: "Fortalece los flexores de la muñeca; clave en la epicondilalgia medial (codo de golfista).",
    posicion: "Sentado, antebrazo apoyado sobre el muslo con la palma hacia arriba y la muñeca fuera de la rodilla, sosteniendo la mancuerna.",
    pasos: [
      "Sube la mancuerna doblando la muñeca hacia ti.",
      "Mantén 1 segundo arriba.",
      "Baja lentamente en 3 segundos.",
    ],
    claves: ["El movimiento es solo de muñeca."],
    evitar: ["Levantar el antebrazo del muslo.", "Usar un peso que provoque dolor que aumenta."],
    dosis: "3 × 12–15",
  },
  {
    id: "tyler-twist", nombre: "Torsión excéntrica con barra flexible (Tyler twist)", en: "flexbar tyler twist", region: "codo", equipo: "Barra flexible de goma (Flexbar) o toalla enrollada",
    descripcion: "Ejercicio excéntrico específico para la epicondilalgia lateral.",
    posicion: "De pie con los codos estirados. Toma la barra vertical con la mano del lado afectado abajo, con la muñeca doblada hacia arriba.",
    pasos: [
      "Con la mano sana, toma el extremo superior y tuerce la barra doblando esa muñeca hacia ti.",
      "Lleva ambos brazos al frente a la altura de los hombros, con la barra horizontal.",
      "Deja que la muñeca del lado afectado se desenrolle lentamente en 3–4 segundos.",
    ],
    claves: ["Pide a tu profesional que te lo muestre la primera vez: la toma es la parte difícil."],
    evitar: ["Desenrollar rápido.", "Doblar los codos."],
    dosis: "3 × 15",
  },
  {
    id: "grip-ball", nombre: "Fortalecimiento de prensión", en: "grip strengthening", region: "codo", equipo: "Pelota blanda o masilla terapéutica",
    descripcion: "Recupera la fuerza para agarrar sin dolor.",
    posicion: "Sentado, antebrazo apoyado, con la pelota en la mano. Codo doblado al principio; luego estirado.",
    pasos: [
      "Aprieta la pelota con toda la mano.",
      "Mantén 3–5 segundos.",
      "Suelta lentamente.",
    ],
    claves: ["Aprieta solo hasta donde no aparezca dolor en el codo (agarre sin dolor)."],
    evitar: ["Apretar con la muñeca doblada hacia abajo."],
    dosis: "3 × 10–15",
  },
  {
    id: "forearm-rot", nombre: "Pronosupinación con martillo", en: "forearm pronation supination", region: "codo", equipo: "Martillo o mancuerna sostenida por un extremo",
    descripcion: "Fortalece los músculos que giran el antebrazo.",
    posicion: "Sentado, antebrazo apoyado en una mesa con la mano fuera del borde, sosteniendo el martillo vertical por el mango.",
    pasos: [
      "Gira lentamente el antebrazo hasta que la palma mire hacia abajo.",
      "Vuelve al centro y gira hasta que la palma mire hacia arriba.",
      "Para hacerlo más difícil, toma el mango más lejos de la cabeza del martillo.",
    ],
    claves: ["Movimiento lento y controlado en ambos sentidos."],
    evitar: ["Mover el codo o el hombro."],
    dosis: "3 × 10 por lado",
  },
  {
    id: "wrist-ext-stretch", nombre: "Elongación de extensores de muñeca", en: "wrist extensor stretch", region: "codo", equipo: "Ninguno",
    descripcion: "Mejora la flexibilidad de los músculos del epicóndilo.",
    posicion: "De pie o sentado, brazo estirado al frente con la palma hacia abajo.",
    pasos: [
      "Con la otra mano, dobla suavemente la muñeca hacia abajo.",
      "Siente la elongación en la parte de atrás del antebrazo.",
      "Mantén respirando lento.",
    ],
    claves: ["Debe ser una elongación suave, nunca dolorosa."],
    evitar: ["Rebotar o forzar en la fase dolorosa."],
    dosis: "3 × 30 s",
  },

  // ── TOBILLO (esguince) ──
  {
    id: "ankle-rom", nombre: "Movilidad activa de tobillo", en: "ankle circles alphabet", region: "tobillo", equipo: "Ninguno",
    descripcion: "Recupera el movimiento del tobillo y ayuda a disminuir la hinchazón en los primeros días.",
    posicion: "Sentado o acostado con la pierna elevada y el pie en el aire.",
    pasos: [
      "Mueve el pie hacia arriba y hacia abajo 10 veces.",
      "Haz círculos en ambos sentidos.",
      "Dibuja las letras del abecedario con el dedo gordo.",
    ],
    claves: ["Mueve solo el tobillo, no la pierna.", "Puedes hacerlo varias veces al día."],
    evitar: ["Forzar hacia adentro (inversión) en los primeros días si duele."],
    dosis: "2–3 series, 3 veces al día",
  },
  {
    id: "ankle-band-4", nombre: "Tobillo con banda en 4 direcciones", en: "ankle resistance band exercises", region: "tobillo", equipo: "Banda elástica",
    descripcion: "Fortalece los músculos que estabilizan el tobillo, en especial los peroneos.",
    posicion: "Sentado con la pierna estirada y la banda alrededor del antepié, fija a un mueble o sujeta con la mano según la dirección.",
    pasos: [
      "Eversión (la más importante): lleva el pie hacia afuera contra la banda.",
      "Inversión: lleva el pie hacia adentro.",
      "Flexión plantar: empuja el pie hacia abajo como pisando un acelerador.",
      "Flexión dorsal: lleva el pie hacia ti.",
      "En cada dirección, vuelve lento en 2–3 segundos.",
    ],
    claves: ["Mueve solo el tobillo; la rodilla mira al techo."],
    evitar: ["Rotar la pierna para ayudarte."],
    dosis: "3 × 15 por dirección",
  },
  {
    id: "star-reach", nombre: "Alcances en estrella", en: "star excursion balance reach", region: "tobillo", equipo: "Cinta adhesiva en el suelo (opcional)",
    descripcion: "Entrena el equilibrio dinámico y el control del tobillo; reduce la recaída del esguince.",
    posicion: "De pie sobre la pierna que trabaja, en el centro de una estrella imaginaria de 3 direcciones (adelante, atrás-adentro y atrás-afuera).",
    pasos: [
      "Dobla la rodilla de apoyo y alcanza lo más lejos posible con la otra pierna, tocando el suelo apenas con la punta.",
      "Vuelve al centro sin apoyar el pie libre.",
      "Repite en cada dirección.",
    ],
    claves: ["El talón de apoyo no se despega.", "La rodilla de apoyo se alinea con el pie."],
    evitar: ["Apoyar el peso en el pie que alcanza.", "Que la rodilla se vaya hacia adentro."],
    dosis: "3 vueltas × 3 direcciones por lado",
  },
  {
    id: "calf-stretch", nombre: "Elongación de pantorrilla en pared", en: "wall calf stretch", region: "tobillo", equipo: "Pared",
    descripcion: "Mejora la flexibilidad de la pantorrilla y la flexión del tobillo.",
    posicion: "De pie frente a una pared con las manos apoyadas, la pierna que se elonga atrás estirada y la otra adelante doblada.",
    pasos: [
      "Lleva la cadera hacia la pared manteniendo el talón de atrás apoyado.",
      "Siente la elongación en la pantorrilla.",
      "Para el sóleo, dobla levemente la rodilla de atrás.",
    ],
    claves: ["El pie de atrás apunta hacia la pared."],
    evitar: ["Levantar el talón.", "Arquear la zona lumbar."],
    dosis: "3 × 30 s por lado",
  },

  // ── DESGARRO MUSCULAR ──
  {
    id: "ham-iso", nombre: "Isométrico de isquiotibiales", en: "isometric hamstring contraction", region: "rodilla", equipo: "Colchoneta",
    descripcion: "Primera carga para el músculo lesionado, sin estirarlo.",
    posicion: "Acostado boca arriba con la rodilla doblada (unos 60–90°) y el talón apoyado en el suelo.",
    pasos: [
      "Empuja el talón contra el suelo como si quisieras arrastrarlo hacia el glúteo, sin moverlo.",
      "Usa una fuerza que no provoque dolor (en las primeras etapas, hasta 2 de 10).",
      "Mantén y relaja lentamente.",
    ],
    claves: ["Progresión: más fuerza, luego rodilla más estirada, luego puente apoyado en el talón."],
    evitar: ["Hacerlo con dolor punzante.", "Estirar el músculo lesionado en la primera fase."],
    dosis: "5–10 × 10 s, varias veces al día",
  },
  {
    id: "askling-extender", nombre: "Extensor de Askling (L-protocol)", en: "askling extender exercise", region: "rodilla", equipo: "Colchoneta",
    descripcion: "Ejercicio de alargamiento activo del isquiotibial; reduce el tiempo de retorno y la recaída.",
    posicion: "Acostado boca arriba. Toma con ambas manos el muslo de la pierna lesionada con la cadera en 90° y la rodilla doblada.",
    pasos: [
      "Estira la rodilla lentamente hasta donde no haya dolor.",
      "Vuelve a doblar la rodilla.",
      "Con el tiempo, hazlo más rápido (sin dolor).",
    ],
    claves: ["El muslo se mantiene fijo con las manos.", "Solo se trabaja en el rango sin dolor."],
    evitar: ["Llegar al estiramiento máximo con dolor."],
    dosis: "3 series × 12, 2 veces al día",
  },
  {
    id: "askling-diver", nombre: "Clavadista de Askling (L-protocol)", en: "askling diver exercise", region: "rodilla", equipo: "Ninguno",
    descripcion: "Alargamiento excéntrico del isquiotibial con control de tronco.",
    posicion: "De pie sobre la pierna lesionada, rodilla levemente doblada (10–20°), brazos estirados hacia adelante.",
    pasos: [
      "Inclina el tronco hacia adelante mientras la pierna libre se va hacia atrás, como un clavadista.",
      "Los brazos acompañan hacia adelante; la rodilla de apoyo mantiene su leve flexión.",
      "Vuelve a la posición inicial contrayendo el glúteo.",
    ],
    claves: ["Pelvis nivelada.", "Empieza lento y sin dolor."],
    evitar: ["Estirar del todo la rodilla de apoyo.", "Rotar la pelvis."],
    dosis: "3 × 6, 1 vez cada 2 días",
  },
  {
    id: "askling-glider", nombre: "Deslizador de Askling (L-protocol)", en: "askling glider exercise", region: "rodilla", equipo: "Superficie deslizante (calcetín en piso liso) y apoyo para las manos",
    descripcion: "Alargamiento excéntrico del isquiotibial controlado por la pierna de apoyo.",
    posicion: "De pie, con el peso en la pierna lesionada (rodilla levemente doblada) y la otra pierna sobre una superficie que deslice; manos en un apoyo.",
    pasos: [
      "Desliza la pierna sana hacia atrás, bajando el cuerpo de forma controlada.",
      "La pierna lesionada frena el movimiento.",
      "Vuelve usando los brazos, sin cargar el músculo lesionado.",
    ],
    claves: ["El movimiento es lento y sin dolor."],
    evitar: ["Ir más allá del rango sin dolor.", "Volver tirando con la pierna lesionada."],
    dosis: "3 × 4, 1 vez cada 3 días",
  },
  {
    id: "adductor-squeeze", nombre: "Isométrico de aductores con balón", en: "adductor squeeze", region: "cadera", equipo: "Balón o cojín",
    descripcion: "Primera carga para los aductores (ingle) lesionados.",
    posicion: "Acostado boca arriba con rodillas dobladas y un balón entre las rodillas.",
    pasos: [
      "Aprieta el balón juntando las rodillas.",
      "Usa una fuerza sin dolor y mantén el tiempo indicado.",
      "Relaja lentamente.",
    ],
    claves: ["Progresión: más fuerza, luego piernas estiradas con el balón entre los tobillos."],
    evitar: ["Aguantar la respiración."],
    dosis: "5 × 10–30 s",
  },
  {
    id: "adductor-band", nombre: "Aducción de cadera con banda", en: "band hip adduction", region: "cadera", equipo: "Banda elástica y apoyo",
    descripcion: "Fortalece los aductores con carga progresiva.",
    posicion: "De pie de lado a un punto de anclaje, con la banda en el tobillo de la pierna más cercana al anclaje.",
    pasos: [
      "Lleva la pierna hacia adentro, cruzando por delante de la otra.",
      "Mantén 1 segundo.",
      "Vuelve lentamente.",
    ],
    claves: ["Tronco erguido; apóyate si lo necesitas."],
    evitar: ["Inclinar el tronco para ayudarte."],
    dosis: "3 × 12–15",
  },
  {
    id: "copenhagen", nombre: "Plancha de Copenhague (aductores)", en: "copenhagen adduction exercise", region: "cadera", equipo: "Banco o compañero",
    descripcion: "Fuerza excéntrica de los aductores; previene lesiones de ingle.",
    posicion: "Plancha lateral apoyado en el antebrazo. La rodilla (versión fácil) o el tobillo (versión difícil) de la pierna de arriba sobre un banco.",
    pasos: [
      "Eleva la pelvis alineando el cuerpo; la pierna de abajo sube hasta tocar el banco.",
      "Baja la pierna de abajo y la pelvis de forma controlada.",
      "Repite.",
    ],
    claves: ["Empieza con la rodilla apoyada (palanca corta)."],
    evitar: ["Hacerlo con dolor en la ingle.", "Dejar caer la cadera."],
    dosis: "2–3 × 6–10 por lado",
  },
  {
    id: "sprint-prog", nombre: "Progresión de velocidad (sprints)", en: "sprint progression", region: "general", equipo: "Pista o cancha",
    descripcion: "Devuelve al músculo la capacidad de tolerar la velocidad máxima antes del alta.",
    posicion: "Calentamiento completo previo de 15 minutos.",
    pasos: [
      "Carreras progresivas de 30–60 m al 60 % de tu velocidad máxima.",
      "Sube al 70, 80 y 90 % en sesiones sucesivas si no hay dolor.",
      "Termina con sprints al 95–100 % y cambios de ritmo.",
    ],
    claves: ["La velocidad máxima debe ser totalmente sin dolor.", "Descansa 2–3 minutos entre repeticiones."],
    evitar: ["Sprintar cansado.", "Subir de intensidad si quedó tensión al día siguiente."],
    dosis: "6–10 repeticiones, 2–3 veces por semana",
  },

  // ── CADERA (prótesis) ──
  {
    id: "ankle-pumps", nombre: "Bombeo de tobillos", en: "ankle pumps", region: "general", equipo: "Ninguno",
    descripcion: "Activa la circulación de las piernas después de la cirugía.",
    posicion: "Acostado o sentado con las piernas estiradas.",
    pasos: [
      "Lleva las puntas de los pies hacia ti.",
      "Luego empuja las puntas hacia abajo.",
      "Alterna de forma rítmica.",
    ],
    claves: ["Hazlo cada hora mientras estés en cama o sentado mucho tiempo."],
    evitar: ["Saltarlo los primeros días: es parte de la prevención de trombosis."],
    dosis: "20 repeticiones cada hora",
  },
  {
    id: "glute-set", nombre: "Contracción isométrica de glúteos", en: "gluteal sets", region: "cadera", equipo: "Ninguno",
    descripcion: "Reactiva los glúteos sin mover la cadera operada.",
    posicion: "Acostado boca arriba con las piernas estiradas.",
    pasos: [
      "Aprieta los glúteos como si quisieras juntarlos.",
      "Mantén 5 segundos.",
      "Relaja por completo.",
    ],
    claves: ["Respira normal durante la contracción."],
    evitar: ["Levantar la pelvis o arquear la espalda."],
    dosis: "10 × 5 s, 3 veces al día",
  },
  {
    id: "supine-hip-abd", nombre: "Abducción de cadera acostado", en: "supine hip abduction slide", region: "cadera", equipo: "Cama o colchoneta",
    descripcion: "Fortalece el glúteo medio en las primeras semanas tras la prótesis.",
    posicion: "Acostado boca arriba con las piernas estiradas y separadas al ancho de las caderas, rótulas mirando al techo.",
    pasos: [
      "Desliza la pierna operada hacia afuera sobre la cama.",
      "Vuelve al centro sin cruzar la línea media del cuerpo.",
      "Repite de forma lenta.",
    ],
    claves: ["La rótula y los dedos del pie apuntan siempre al techo."],
    evitar: ["Cruzar la pierna por sobre la línea media.", "Girar la pierna hacia adentro."],
    dosis: "2–3 × 10–15",
  },
  {
    id: "sit-to-stand", nombre: "Sentarse y pararse", en: "sit to stand", region: "cadera", equipo: "Silla firme con apoyabrazos",
    descripcion: "Fuerza funcional para levantarse de una silla de forma independiente.",
    posicion: "Sentado en una silla firme y alta (tras una prótesis, las caderas más altas que las rodillas), pies apoyados al ancho de las caderas.",
    pasos: [
      "Acércate al borde de la silla y lleva el tronco levemente hacia adelante.",
      "Empuja con ambas piernas (y con los apoyabrazos si lo necesitas) hasta quedar de pie.",
      "Para sentarte, retrocede hasta sentir la silla con las piernas y baja lentamente.",
    ],
    claves: ["Con el tiempo, reduce la ayuda de los brazos y baja la altura de la silla.", "Reparte el peso en ambas piernas."],
    evitar: ["Dejarse caer al sentarse.", "Cargar todo el peso en la pierna sana."],
    dosis: "3 × 8–10",
  },
  {
    id: "standing-hip-abd", nombre: "Abducción de cadera de pie", en: "standing hip abduction", region: "cadera", equipo: "Silla o mesón para apoyarse",
    descripcion: "Fortalece el glúteo medio para una marcha sin cojera.",
    posicion: "De pie, de frente o de lado a una silla firme, apoyado con las manos.",
    pasos: [
      "Con el tronco erguido, lleva la pierna operada hacia el lado.",
      "Sube unos 20–30 cm sin inclinar el tronco.",
      "Baja lentamente.",
    ],
    claves: ["Los dedos del pie miran hacia adelante.", "Progresión: tobillera liviana o banda elástica."],
    evitar: ["Inclinar el tronco hacia el lado contrario.", "Rotar la pierna hacia afuera."],
    dosis: "3 × 10–15",
  },
  {
    id: "standing-hip-ext", nombre: "Extensión de cadera de pie", en: "standing hip extension", region: "cadera", equipo: "Apoyo y banda elástica (opcional)",
    descripcion: "Fortalece el glúteo mayor para caminar y subir escaleras.",
    posicion: "De pie frente a una silla o mesón, apoyado con las manos.",
    pasos: [
      "Lleva la pierna hacia atrás con la rodilla estirada, apretando el glúteo.",
      "Mantén 1 segundo atrás.",
      "Vuelve lentamente.",
    ],
    claves: ["El movimiento es corto: la cadera trabaja, la espalda no."],
    evitar: ["Arquear la zona lumbar.", "Inclinar el tronco hacia adelante."],
    dosis: "3 × 10–15",
  },
  {
    id: "gait-aid", nombre: "Marcha con ayuda técnica", en: "gait training with walker", region: "general", equipo: "Andador o bastones",
    descripcion: "Recupera una marcha segura y simétrica tras la cirugía.",
    posicion: "De pie con el andador (o bastones) a la altura de las muñecas y los codos levemente doblados.",
    pasos: [
      "Avanza primero el andador (o los bastones).",
      "Luego da el paso con la pierna operada.",
      "Después da el paso con la pierna sana.",
      "Con un solo bastón, úsalo en la mano contraria a la pierna operada.",
    ],
    claves: ["Pasos del mismo largo con ambas piernas.", "Apoya primero el talón y despega con la punta."],
    evitar: ["Caminar apurado o en superficies resbaladizas.", "Dejar la ayuda técnica antes de que tu profesional lo indique."],
    dosis: "5–10 min, varias veces al día",
  },
  {
    id: "stair-training", nombre: "Subir y bajar escaleras", en: "stair training after hip replacement", region: "general", equipo: "Escalera con baranda",
    descripcion: "Entrenamiento seguro de escaleras tras una prótesis.",
    posicion: "De pie frente a la escalera, tomado de la baranda (y con el bastón en la otra mano si lo usas).",
    pasos: [
      "Para subir: primero la pierna sana, luego la operada y el bastón.",
      "Para bajar: primero el bastón y la pierna operada, luego la sana.",
      "Un escalón a la vez hasta que tu profesional indique alternar.",
    ],
    claves: ["Regla fácil: \"la buena sube al cielo, la mala baja al infierno\"."],
    evitar: ["Soltar la baranda.", "Apurarse."],
    dosis: "1 tramo de escaleras, 2–3 veces al día",
  },

  // ── HOMBRO (complemento) ──
  {
    id: "doorway-stretch", nombre: "Elongación de pectoral en marco de puerta", en: "doorway pectoral stretch", region: "hombro", equipo: "Marco de puerta",
    descripcion: "Elonga el pectoral menor, que tiende a llevar el hombro hacia adelante.",
    posicion: "De pie en un marco de puerta, antebrazo apoyado en el marco con el codo a la altura del hombro (o algo más abajo si molesta).",
    pasos: [
      "Da un paso adelante con la pierna del mismo lado.",
      "Gira suavemente el tronco hacia el lado contrario hasta sentir la elongación en el pecho.",
      "Mantén respirando lento.",
    ],
    claves: ["Hombro abajo y atrás."],
    evitar: ["Sentir dolor en la parte delantera del hombro: baja el codo."],
    dosis: "3 × 30 s",
  },
  {
    id: "prone-y-t", nombre: "Y y T acostado boca abajo", en: "prone Y T raise", region: "hombro", equipo: "Camilla o banco (mancuernas livianas opcional)",
    descripcion: "Fortalece el trapecio medio e inferior para controlar la escápula.",
    posicion: "Acostado boca abajo, frente apoyada en una toalla, brazos colgando hacia el suelo con los pulgares hacia arriba.",
    pasos: [
      "T: eleva los brazos hacia los lados hasta la altura del cuerpo, juntando las escápulas.",
      "Y: eleva los brazos en diagonal por sobre la cabeza.",
      "Mantén 2 segundos arriba y baja lento.",
    ],
    claves: ["Primero se mueve la escápula, después el brazo."],
    evitar: ["Encoger los hombros hacia las orejas.", "Levantar la cabeza."],
    dosis: "2–3 × 10 de cada letra",
  },
];

export const EJERCICIOS: Ejercicio[] = LISTA.map((e) =>
  CON_FOTOS.has(e.id) ? { ...e, imagenes: [`/images/ejercicios/${e.id}-1.jpg`, `/images/ejercicios/${e.id}-2.jpg`] } : e,
);

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
