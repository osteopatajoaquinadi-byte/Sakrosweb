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
    tagline: "¿Dolor persistente, cefaleas, migrañas, problemas digestivos o mal dormir?",
    description:
      "Detrás de muchos de estos síntomas suele haber un sistema nervioso autónomo desregulado. Como kinesiólogo especializado en osteopatía y psiconeuroinmunología clínica, evalúo tu caso de forma integral y te acompaño con terapia manual, movimiento óptimo y hábitos saludables para regular tu sistema nervioso y devolverte el control de tu salud.",
    bullets: [
      "Atención personalizada para dolor musculoesquelético e intestinal",
      "Cefaleas, migrañas y alteraciones del sueño",
      "Enfoque integral: terapia manual, movimiento y hábitos",
      "Agenda tu evaluación y empieza a recuperar tu bienestar",
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
    tagline: "Evaluación clínica del sistema nervioso central y sus influencias",
    description:
      "Evaluación clínica del sistema nervioso central y sus influencias en: postura, desempeño escolar, desarrollo en general del sistema motor y deportivo. Tomando en cuenta para lo anterior la información recibida por captor ocular, los pies, sistema músculo esquelético y la respuesta a estos del sistema nervioso central.",
    bullets: [
      "Cambios visibles en alteraciones sensoriales y posturales",
      "Mejoría en síntomas de TDAH, espectro autista y retraso del desarrollo psicomotor",
      "Implementación de planes individualizados para el rendimiento deportivo (coordinación ojo-mano, reclutamiento muscular, eficiencia en gasto energético)",
      "Análisis específico caso a caso de acuerdo a la evaluación del paciente y sus necesidades",
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
    legacyPaths: [],
  },
];
