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
    tagline: "Terapia manual para el dolor y la movilidad",
    description:
      "Evaluación y tratamiento manual orientado a encontrar el origen del dolor o la restricción de movimiento, no solo el síntoma. Trabajamos la biomecánica articular y su relación con el sistema nervioso.",
    bullets: [
      "Evaluación biomecánica articular completa",
      "Terapia manual osteopática",
      "Enfoque en la causa, no solo en el síntoma",
      "Integración con kinesiología y posturología cuando es necesario",
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
    tagline: "Evaluación y corrección postural",
    description:
      "Evaluación clínica de la postura y su efecto en el dolor recurrente o en el rendimiento deportivo, considerando pie, visión, oclusión y sistema nervioso central como entradas del sistema postural.",
    bullets: [
      "Evaluación postural clínica",
      "Análisis de entradas posturales (pie, visión, oclusión)",
      "Plan de corrección individualizado",
      "Seguimiento de la respuesta al tratamiento",
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
