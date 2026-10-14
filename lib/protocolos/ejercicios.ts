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
