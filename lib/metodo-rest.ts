// Configuración y textos del bot de Instagram para el Método REST acompañado.
// Los textos están aquí para poder ajustarlos sin tocar la lógica del bot.

export const REST_PROGRAM = {
  serviceSlug: "metodo-rest",
  professionalSlug: "joaquin",
  priceClp: 97000,
  // Link de pago (lo entrega Joaquín). Se puede sobreescribir en Vercel con
  // la variable REST_PAYMENT_URL sin tocar el código.
  paymentUrl: process.env.REST_PAYMENT_URL || "",
  // Palabra clave que activa el bot (se compara sin tildes ni mayúsculas).
  keyword: "sueno",
  // Horas mínimas de anticipación para ofrecer una sesión.
  minLeadHours: 3,
  // Días hacia adelante en que se buscan horas libres.
  searchDays: 14,
  slotsPerPage: 6,
  timeZone: "America/Santiago",
};

const price = `$${REST_PROGRAM.priceClp.toLocaleString("es-CL")}`;

export const REST_TEXTS = {
  intro:
    `¡Hola! 🌙 Gracias por escribir.\n\n` +
    `El Método REST acompañado es un programa para mejorar tu sueño que incluye:\n` +
    `• 1 sesión online conmigo (Joaquín)\n` +
    `• 21 días de seguimiento por WhatsApp, con respuesta 1 vez al día en horario laboral\n\n` +
    `Las preguntas del seguimiento se hacen en horario laboral (lunes a viernes).\n\n` +
    `El programa cuesta ${price} y se paga con un link de pago.\n\n` +
    `¿Te gustaría entrar al programa? Responde SÍ o NO.`,

  commentPublicReply: "¡Te envié la información por mensaje directo! 🌙",

  notInterested:
    "¡Perfecto, gracias por tu interés! Si más adelante quieres entrar al programa, escríbeme sueño y retomamos. 🌙",

  askYesNo: "¿Te gustaría entrar al Método REST acompañado? Responde SÍ o NO.",

  accepted: (paymentUrl: string) =>
    paymentUrl
      ? `¡Genial! 🙌 Este es el link de pago del programa (${price}):\n${paymentUrl}\n\n` +
        `Mientras tanto, agendemos tu sesión online. Necesito algunos datos.`
      : `¡Genial! 🙌 En breve te enviamos el link de pago del programa (${price}).\n\n` +
        `Mientras tanto, agendemos tu sesión online. Necesito algunos datos.`,

  askName: "¿Cuál es tu nombre y apellido?",
  askLastName: "¿Y tu apellido? Escríbeme tu nombre completo, por favor.",
  askEmail: "¿Cuál es tu correo electrónico?",
  badEmail: "Ese correo no parece válido. ¿Me lo escribes de nuevo? (ej: nombre@gmail.com)",
  askPhone: "¿Cuál es tu número de WhatsApp? (ej: +56 9 1234 5678). Por ahí hacemos el seguimiento.",
  badPhone: "No pude leer ese número. Escríbelo con código de país, por ejemplo: +56 9 1234 5678",

  slotsHeader: "Estas son las próximas horas disponibles para tu sesión online:",
  slotsFooter: "Responde con el número de la opción que prefieras, o escribe MÁS para ver otras horas.",
  noSlots:
    "En este momento no encuentro horas libres en las próximas 2 semanas. Joaquín te escribirá personalmente para coordinar. 🙏",
  noMoreSlots: "No hay más horas disponibles por ahora. Elige una de las opciones anteriores respondiendo con su número.",
  badSlot: "Responde solo con el número de una de las opciones (por ejemplo: 2), o escribe MÁS.",
  slotTaken: "Uy, esa hora se acaba de ocupar. Te muestro las horas actualizadas:",

  booked: (when: string, paymentUrl: string) =>
    `✅ ¡Listo! Tu sesión online quedó agendada para el ${when}.\n\n` +
    `Antes de la sesión te enviaremos el link de la videollamada.\n` +
    (paymentUrl ? `Recuerda completar el pago aquí: ${paymentUrl}\n` : "") +
    `\nDespués de la sesión comienzan tus 21 días de seguimiento por WhatsApp (respuesta 1 vez al día, en horario laboral). ¡Nos vemos! 🌙`,

  alreadyBooked: (when: string) =>
    `Ya tienes tu sesión agendada para el ${when}. Si necesitas cambiarla, escríbenos por WhatsApp en horario laboral. 🌙`,

  bookingError:
    "Tuve un problema al agendar 😕. Joaquín revisará tu solicitud y te escribirá personalmente para confirmar la hora.",
};
