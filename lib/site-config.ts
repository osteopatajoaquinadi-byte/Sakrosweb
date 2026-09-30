export const siteConfig = {
  name: "Sakros",
  legalName: "ADI Y ARENTSEN LIMITADA",
  url: "https://www.sakros.cl",
  title: "Sakros — Vuelve a tu deporte sin dolor | Viña del Mar",
  description:
    "Osteopatía, kinesiología y posturología a tu medida en Viña del Mar. Ayudamos a ex-deportistas y deportistas activos a volver a entrenar sin dolor, con evaluación individualizada.",
  address: {
    street: "9 Norte 555, Edificio Emporium, Of. 201",
    city: "Viña del Mar",
    region: "Región de Valparaíso",
    country: "CL",
  },
  // Horario de la clínica (según agenda de staff en Wix, sep 2026).
  openingHours: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], label: "Lunes a viernes", opens: "08:30", closes: "21:00" },
    { days: ["Saturday"], label: "Sábado", opens: "09:00", closes: "14:00" },
  ],
  phone: "+56945399692",
  whatsappNumber: "56945399692",
  email: "sakrosvina@gmail.com",
  instagram: "https://www.instagram.com/sakros_salud",
  // TODO (Juaco): confirmar si el botón de reserva debe ir a WhatsApp,
  // a un sistema de agendamiento externo, o a uno propio. Por ahora
  // apunta a WhatsApp como opción segura y ya operativa.
  bookingUrl: "https://wa.me/56945399692",
};

export type Service = {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  bullets: string[];
  // Contenido SEO por servicio: a quién va dirigido y preguntas frecuentes
  // (también se publican como FAQPage en JSON-LD).
  forWho: string[];
  faqs: { q: string; a: string }[];
  image: string;
  // URL(s) del sitio anterior en Wix que deben redirigir a esta página.
  legacyPaths: string[];
};

export const services: Service[] = [
  {
    slug: "osteopatia",
    image: "/images/servicios/osteopatia.png",
    name: "Osteopatía",
    shortName: "Osteopatía",
    tagline: "Terapia manual para el dolor y la movilidad",
    description:
      "Evaluación y tratamiento manual orientado a encontrar el origen del dolor o la restricción de movimiento, no solo el síntoma. Trabajamos la biomecánica articular y su relación con el sistema nervioso.",
    bullets: [
      "Evaluación biomecánica articular completa",
      "Terapia manual osteopática",
      "Enfoque en la causa, no solo en el síntoma",
      "Integración con kinesiología y posturología cuando es necesario",
    ],
    forWho: [
      "Tienes dolor lumbar, cervical o de espalda que vuelve cada cierto tiempo.",
      "Sientes rigidez o poca movilidad en una articulación y no sabes de dónde viene.",
      "Eres deportista o ex-deportista y el dolor te está limitando para entrenar.",
      "Ya probaste tratamientos que calman el síntoma, pero el problema reaparece.",
    ],
    faqs: [
      {
        q: "¿Qué diferencia hay entre osteopatía y kinesiología?",
        a: "La osteopatía se centra en la evaluación y el tratamiento manual de la movilidad articular y de los tejidos, buscando el origen de la restricción. La kinesiología pone el foco en la rehabilitación activa: ejercicio, control motor y progresión de carga. En Sakros las combinamos cuando tu caso lo requiere, porque la terapia manual funciona mejor acompañada de trabajo activo.",
      },
      {
        q: "¿La osteopatía tiene respaldo científico?",
        a: "La osteopatía estructural (articulaciones y tejido blando) tiene evidencia favorable para dolor lumbar y cervical, sobre todo combinada con ejercicio. Otras técnicas, como las viscerales o craneales, tienen evidencia más limitada y lo explicamos así. Puedes ver el detalle en nuestra página de Evidencia y Metodología.",
      },
      {
        q: "¿Cuántas sesiones voy a necesitar?",
        a: "Depende de lo que muestre la evaluación y de cómo respondas a las primeras sesiones. En la primera consulta te explicamos qué encontramos y te proponemos un plan con objetivos concretos, que vamos ajustando según tu evolución.",
      },
    ],
    legacyPaths: ["/service-page/osteopat%C3%ADa", "/service-page/osteopatía"],
  },
  {
    slug: "kinesiologia",
    image: "/images/servicios/kinesiologia.png",
    name: "Kinesiología",
    shortName: "Kinesiología",
    tagline: "Rehabilitación y recuperación funcional",
    description:
      "Rehabilitación de lesiones y recuperación funcional para volver a moverte con confianza. Programas progresivos de control motor adaptados a tu nivel de actividad.",
    bullets: [
      "Rehabilitación de lesiones deportivas",
      "Control motor y reeducación del movimiento",
      "Progresión adaptada a tu objetivo (volver a entrenar, no solo dejar de doler)",
      "Seguimiento de la evolución sesión a sesión",
    ],
    forWho: [
      "Te lesionaste haciendo deporte y quieres recuperarte bien, no a medias.",
      "Estás en rehabilitación después de un esguince, una tendinopatía o una cirugía.",
      "Tienes un dolor que se repite al correr, saltar o levantar peso.",
      "Quieres volver a tu nivel de actividad con un plan de carga progresivo y supervisado.",
    ],
    faqs: [
      {
        q: "¿Necesito una orden médica para atenderme?",
        a: "Para comenzar la evaluación kinesiológica no siempre es necesaria. Si tienes exámenes, informes o indicaciones de tu médico, tráelos: nos ayudan a entender mejor tu caso. Si durante la evaluación vemos algo que requiere estudio médico, te lo diremos y te derivaremos.",
      },
      {
        q: "¿Las sesiones son solo máquinas y calor?",
        a: "No. Las modalidades pasivas (como TENS o ultrasonido) tienen evidencia débil como tratamiento principal, así que no son el eje de nuestras sesiones. Trabajamos principalmente con ejercicio terapéutico, control motor y terapia manual cuando corresponde.",
      },
      {
        q: "¿Cuándo sabré que estoy listo para volver a entrenar?",
        a: "Usamos criterios objetivos, como fuerza, control del movimiento y tolerancia al gesto deportivo, en vez de guiarnos solo por la ausencia de dolor. Así la vuelta al deporte se basa en cómo está tu cuerpo y no solo en el calendario.",
      },
    ],
    legacyPaths: [
      "/service-page/kinesiolog%C3%ADa-vi%C3%B1a-del-mar",
      "/service-page/kinesiología-viña-del-mar",
    ],
  },
  {
    slug: "posturologia",
    image: "/images/servicios/posturologia.png",
    name: "Posturología",
    shortName: "Posturología",
    tagline: "Evaluación y corrección postural",
    description:
      "Evaluación clínica de la postura y su efecto en el dolor recurrente o en el rendimiento deportivo, considerando pie, visión, oclusión y sistema nervioso central como entradas del sistema postural.",
    bullets: [
      "Evaluación postural clínica",
      "Análisis de entradas posturales (pie, visión, oclusión)",
      "Plan de corrección individualizado",
      "Seguimiento de la respuesta al tratamiento",
    ],
    forWho: [
      "Tienes un dolor recurrente que no ha respondido bien al tratamiento habitual.",
      "Notas asimetrías en tu postura o apoyo y quieres saber si influyen en tu dolor.",
      "Tienes molestias que parecen relacionadas con la pisada, la mandíbula o la visión.",
      "Eres deportista y buscas afinar el equilibrio y la estabilidad.",
    ],
    faqs: [
      {
        q: "¿Qué evalúa la posturología clínica?",
        a: "Evalúa cómo tu sistema nervioso organiza la postura a partir de distintas entradas: el apoyo del pie, la visión, la oclusión dental y la propiocepción. El objetivo es identificar si alguna de ellas está contribuyendo a tu dolor o a un desequilibrio.",
      },
      {
        q: "¿Una mala postura siempre causa dolor?",
        a: "No. No toda asimetría postural causa dolor, y no todo dolor tiene una causa postural. Por eso en Sakros evaluamos la postura como una variable más dentro del cuadro completo, no como la explicación automática de cada síntoma.",
      },
      {
        q: "¿Puede que me deriven a otro profesional?",
        a: "Sí. Si la evaluación sugiere que una entrada como la oclusión o la visión requiere estudio específico, te recomendaremos consultar con el especialista que corresponda y coordinaremos el enfoque.",
      },
    ],
    legacyPaths: [
      "/service-page/posturolog%C3%ADa-cl%C3%ADnica-1",
      "/service-page/posturología-clínica-1",
    ],
  },
  {
    slug: "plantillas-ortopedicas",
    image: "/images/servicios/plantillas-ortopedicas.png",
    name: "Plantillas Ortopédicas Personalizadas",
    shortName: "Plantillas Ortopédicas",
    tagline: "Soporte biomecánico hecho a tu medida",
    description:
      "Plantillas ortopédicas personalizadas a partir de un estudio biomecánico de tu pisada, pensadas para corregir apoyos que generan dolor o limitan el rendimiento deportivo.",
    bullets: [
      "Estudio biomecánico de la pisada",
      "Fabricación a medida, no genérica",
      "Pensadas para volver a entrenar sin dolor de pie, rodilla o cadera",
      "Revisión y ajuste post-entrega",
    ],
    forWho: [
      "Tienes dolor en la planta del pie, el talón, la rodilla o la cadera al caminar o correr.",
      "Te han dicho que tienes pie plano, cavo o una pisada con alteraciones.",
      "Usas plantillas genéricas y no notas mejoría.",
      "Entrenas o corres con frecuencia y quieres cuidar tu apoyo.",
    ],
    faqs: [
      {
        q: "¿En qué se diferencian de las plantillas de farmacia?",
        a: "Las plantillas genéricas usan un molde estándar. Las nuestras se diseñan a partir de un estudio biomecánico de tu pisada y se fabrican a tu medida. La evidencia en deportistas es más favorable para diseños personalizados basados en estudio biomecánico.",
      },
      {
        q: "¿Necesito hacer primero el estudio biomecánico?",
        a: "Sí. El estudio biomecánico del pie es la base para diseñar la plantilla: analizamos tu apoyo y tus presiones plantares para decidir qué corregir y qué no.",
      },
      {
        q: "¿Las plantillas se revisan después de entregarlas?",
        a: "Sí. Hacemos una revisión posterior a la entrega para ver cómo te adaptas y ajustarlas si es necesario.",
      },
    ],
    legacyPaths: ["/service-page/motion-balance", "/laboratorio-plantillas"],
  },
  {
    slug: "actividad-fisica-dirigida",
    image: "/images/servicios/actividad-fisica-dirigida.png",
    name: "Actividad Física Dirigida",
    shortName: "Actividad Física Dirigida",
    tagline: "Movimiento terapéutico guiado",
    description:
      "Sesiones de movimiento guiado para la etapa entre 'ya no me duele' y 'ya puedo entrenar como antes' — el puente que la rehabilitación tradicional suele dejar sin cubrir.",
    bullets: [
      "Puente entre rehabilitación y vuelta al deporte",
      "Progresión de carga y exigencia supervisada",
      "Trabajo individual o en grupos pequeños",
    ],
    forWho: [
      "Ya terminaste la rehabilitación pero aún no te sientes seguro para entrenar solo.",
      "Quieres retomar la actividad física después de un tiempo largo sin moverte.",
      "Eres adulto mayor y buscas mantener fuerza, equilibrio y autonomía.",
      "Prefieres entrenar con supervisión profesional y una progresión planificada.",
    ],
    faqs: [
      {
        q: "¿En qué se diferencia de ir al gimnasio?",
        a: "Las sesiones las guía un profesional que conoce tu historia clínica y ajusta la carga según cómo respondes. El objetivo no es solo entrenar, sino hacer el puente entre la rehabilitación y tu actividad habitual con una progresión controlada.",
      },
      {
        q: "¿Las sesiones son individuales o grupales?",
        a: "Trabajamos de forma individual o en grupos pequeños, según tu objetivo y tu etapa de recuperación.",
      },
      {
        q: "¿Sirve para adultos mayores?",
        a: "Sí. Tenemos sesiones orientadas a adultos mayores, enfocadas en fuerza, equilibrio y movilidad para mantener la autonomía en el día a día.",
      },
    ],
    legacyPaths: ["/booking-calendar/actividad-f%C3%ADsica-dirigida"],
  },
  {
    slug: "estudio-biomecanico-pie",
    image: "/images/servicios/estudio-biomecanico-pie.png",
    name: "Estudio Biomecánico del Pie",
    shortName: "Estudio Biomecánico del Pie",
    tagline: "Análisis de la pisada",
    description:
      "Análisis detallado de tu pisada y apoyo para identificar patrones que generan sobrecarga, dolor o riesgo de lesión al volver a entrenar.",
    bullets: [
      "Análisis de pisada y apoyo plantar",
      "Detección de sobrecargas y compensaciones",
      "Base para la fabricación de plantillas a medida",
    ],
    forWho: [
      "Tienes dolor de pie, rodilla, cadera o espalda que empeora al caminar o correr.",
      "Te lesionas con frecuencia y quieres descartar un problema de apoyo.",
      "Estás pensando en usar plantillas y quieres una base objetiva para diseñarlas.",
      "Vas a volver a entrenar y quieres conocer cómo pisas antes de aumentar la carga.",
    ],
    faqs: [
      {
        q: "¿Qué incluye el estudio biomecánico?",
        a: "Analizamos tu pisada y tu apoyo plantar con plataforma de presiones y escáner para identificar sobrecargas y compensaciones.",
      },
      {
        q: "¿Qué debo llevar al estudio?",
        a: "Ropa cómoda que permita ver piernas y pies, y el calzado que usas habitualmente para entrenar o caminar. Si tienes plantillas o exámenes previos, tráelos también.",
      },
      {
        q: "¿El estudio siempre termina en plantillas?",
        a: "No. El estudio sirve para entender tu apoyo; si no hay indicación de plantillas, te lo diremos. En otros casos, los hallazgos orientan el tratamiento kinésico u osteopático.",
      },
    ],
    legacyPaths: [],
  },
];
