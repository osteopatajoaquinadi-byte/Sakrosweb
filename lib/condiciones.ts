// Páginas por molestia (playbook SEO de kinesiología). Cada una apunta a
// una búsqueda específica ("kinesiólogo lumbago viña del mar", etc.) y lleva
// a reservar. Contenido clínico prudente: sin promesas de resultados y con
// señales de alerta para derivar al médico.

export type Condition = {
  slug: string;
  service: string; // slug del servicio al que pertenece
  shortName: string; // nombre corto para tarjetas y migas
  cardText: string; // una línea para la tarjeta en la página del servicio
  metaTitle: string;
  description: string;
  h1: string;
  intro: string[];
  whenToConsult: string[];
  evaluation: string[];
  treatment: string[];
  redFlags: string[];
  faqs: { q: string; a: string }[];
};

export const conditions: Condition[] = [
  {
    slug: "dolor-lumbar",
    service: "kinesiologia",
    shortName: "Lumbago y dolor lumbar",
    cardText: "Dolor de espalda baja que vuelve o que no te deja entrenar.",
    metaTitle: "Kinesiología para lumbago y dolor lumbar en Viña del Mar",
    description:
      "Kinesiología para el dolor lumbar en Viña del Mar: evaluamos por qué vuelve el lumbago y armamos un plan de ejercicio y terapia manual para que retomes tu actividad.",
    h1: "Kinesiología para lumbago y dolor lumbar en Viña del Mar",
    intro: [
      "El dolor lumbar es una de las consultas más frecuentes en kinesiología. En la mayoría de los casos no se debe a una lesión grave, pero sí puede volver una y otra vez si no se trabaja lo que lo mantiene: cómo cargas, cómo te mueves y cuánto toleras el esfuerzo.",
      "En Sakros buscamos por qué aparece y por qué vuelve, para que no dependas del reposo o de los antiinflamatorios cada vez que la espalda avisa.",
    ],
    whenToConsult: [
      "El dolor lleva más de una o dos semanas o aparece cada cierto tiempo.",
      "Te cuesta agacharte, levantar peso o estar mucho rato sentado.",
      "El dolor baja hacia el glúteo o la pierna.",
      "Dejaste de entrenar o de hacer tus actividades por miedo a que vuelva.",
    ],
    evaluation: [
      "Conversación sobre cómo empezó, qué lo empeora y qué lo alivia.",
      "Evaluación del movimiento de la columna, la cadera y la musculatura que la sostiene.",
      "Pruebas para descartar compromiso de nervio y señales de alerta.",
      "Revisión de tu actividad diaria, trabajo y entrenamiento.",
    ],
    treatment: [
      "Ejercicio terapéutico progresivo: es la intervención con más respaldo para el dolor lumbar.",
      "Terapia manual cuando ayuda a moverte con menos dolor, siempre combinada con trabajo activo.",
      "Educación sobre el dolor, para que sepas qué es seguro hacer y qué no.",
      "Plan para volver al deporte o al trabajo con cargas graduales.",
    ],
    redFlags: [
      "Pérdida de control de la orina o de las deposiciones.",
      "Adormecimiento en la zona genital o entre las piernas.",
      "Debilidad en las piernas que va en aumento.",
      "Fiebre, baja de peso sin explicación o antecedente de cáncer.",
      "Dolor después de una caída o golpe fuerte.",
    ],
    faqs: [
      {
        q: "¿Necesito una resonancia antes de ir al kinesiólogo?",
        a: "En la mayoría de los casos no. Las imágenes se piden cuando hay señales de alerta o cuando el dolor no responde al tratamiento. Si ya tienes exámenes, tráelos a la evaluación.",
      },
      {
        q: "¿Es mejor hacer reposo cuando tengo lumbago?",
        a: "El reposo prolongado suele retrasar la recuperación. Lo habitual es mantenerse activo dentro de lo tolerable, y en la evaluación te indicamos qué movimientos son seguros para ti.",
      },
      {
        q: "¿Cuántas sesiones voy a necesitar?",
        a: "Depende de cuánto tiempo lleva el dolor y de tus objetivos. En la primera sesión te explicamos lo que encontramos y te proponemos un plan, que ajustamos según cómo respondes.",
      },
      {
        q: "¿Puedo seguir entrenando?",
        a: "Muchas veces sí, adaptando la carga. Parte del tratamiento es definir qué puedes mantener y cómo volver a lo que dejaste.",
      },
    ],
  },
  {
    slug: "rodilla",
    service: "kinesiologia",
    shortName: "Dolor de rodilla",
    cardText: "Dolor al correr, saltar, subir escaleras o después de una lesión.",
    metaTitle: "Kinesiología de rodilla en Viña del Mar",
    description:
      "Kinesiología de rodilla en Viña del Mar: dolor al correr o subir escaleras, esguinces, meniscos y rehabilitación de ligamentos, con un plan para volver a tu actividad.",
    h1: "Kinesiología de rodilla en Viña del Mar",
    intro: [
      "La rodilla soporta gran parte de la carga cuando caminas, corres o saltas. El dolor puede venir de una lesión puntual, como un esguince o un problema de menisco, o de una sobrecarga que se fue acumulando.",
      "Evaluamos la rodilla junto con la cadera, el tobillo y tu forma de moverte, porque muchas veces el problema no está solo donde duele.",
    ],
    whenToConsult: [
      "Te duele al correr, saltar, subir o bajar escaleras.",
      "Sientes la rodilla inestable o que \"se va\".",
      "Tuviste un esguince o una torsión y no recuperas confianza.",
      "Estás en rehabilitación después de una cirugía de ligamento o menisco.",
    ],
    evaluation: [
      "Historia de la lesión o de cómo apareció el dolor.",
      "Pruebas de estabilidad, movilidad y fuerza de la rodilla y la cadera.",
      "Análisis de gestos como la sentadilla, el salto o la carrera.",
      "Revisión de exámenes previos e indicaciones médicas, si las tienes.",
    ],
    treatment: [
      "Fortalecimiento progresivo de la musculatura que protege la rodilla.",
      "Trabajo de control del movimiento en los gestos que te generan dolor.",
      "Terapia manual cuando ayuda a recuperar movilidad.",
      "Vuelta al deporte con criterios de fuerza y función, no solo por calendario.",
    ],
    redFlags: [
      "No poder apoyar el pie después de un golpe o torsión.",
      "Rodilla muy hinchada, roja y caliente, especialmente con fiebre.",
      "Bloqueo de la rodilla que no se suelta.",
      "Deformidad visible después de una caída.",
    ],
    faqs: [
      {
        q: "¿Trabajan rehabilitación después de una cirugía de ligamento cruzado?",
        a: "Sí. Seguimos las indicaciones de tu traumatólogo y avanzamos por etapas, desde recuperar movilidad hasta volver al deporte con pruebas de fuerza y salto.",
      },
      {
        q: "Me duele la rodilla al correr, ¿tengo que dejar de correr?",
        a: "No siempre. Muchas veces basta con ajustar el volumen y trabajar la fuerza. En la evaluación vemos cuánto puedes mantener mientras te recuperas.",
      },
      {
        q: "¿Necesito orden médica?",
        a: "Para empezar la evaluación kinesiológica no siempre es necesaria. Si tienes una cirugía reciente, trae las indicaciones de tu médico.",
      },
      {
        q: "¿Sirven las plantillas para el dolor de rodilla?",
        a: "En algunos casos, cuando el apoyo del pie influye en la carga de la rodilla. Si lo vemos necesario, te sugerimos un estudio biomecánico del pie.",
      },
    ],
  },
  {
    slug: "hombro",
    service: "kinesiologia",
    shortName: "Dolor de hombro",
    cardText: "Dolor al elevar el brazo, en entrenamientos de empuje o en lanzadores y voleibolistas.",
    metaTitle: "Kinesiología de hombro en Viña del Mar",
    description:
      "Kinesiología de hombro en Viña del Mar: dolor al elevar el brazo, en press o en lanzadores y voleibolistas. Trabajamos el balance empuje-tracción y el control del manguito rotador.",
    h1: "Kinesiología de hombro en Viña del Mar",
    intro: [
      "El hombro es la articulación más móvil del cuerpo, y por eso depende tanto del control muscular como del balance entre los grupos que lo mueven. Casi todo el dolor que vemos en consulta no viene de una estructura rota, sino de un desbalance entre lo que empuja y lo que tracciona, y de un manguito rotador que dejó de hacer su trabajo de centrado de la cabeza humeral.",
      "Cuando ese control se pierde, el deltoides, sobre todo su porción anterior, toma el mando y aparece la típica molestia al elevar el brazo, al dormir sobre ese lado o al cargar peso por encima de la cabeza.",
    ],
    whenToConsult: [
      "Dolor al elevar el brazo, al vestirte o al dormir sobre ese lado.",
      "Molestia en press de banca, press militar, dominadas o fondos.",
      "Lanzadores, voleibolistas, tenistas o nadadores con dolor progresivo.",
      "Post operatorio de manguito rotador, inestabilidad o acromioplastía.",
      "Sensación de que el hombro \"se sale de lugar\" o no responde con fuerza.",
    ],
    evaluation: [
      "Historia detallada: cómo empezó, qué gestos lo gatillan y qué cargas sostiene.",
      "Evaluación de movilidad activa y pasiva, descartando pérdida de rotación interna por retracción capsular posterior.",
      "Pruebas de fuerza del manguito rotador (supraespinoso, infraespinoso, redondo menor, subescapular) y del balance entre empuje (pectoral, deltoides anterior) y tracción (romboides, trapecio medio e inferior, dorsal).",
      "Análisis del gesto deportivo o laboral: lanzamiento, saque, bloqueo, press, trabajo con brazos sobre la cabeza.",
    ],
    treatment: [
      "Reeducación del control motor del manguito rotador, para que vuelva a centrar la cabeza humeral antes de que entre el deltoides.",
      "Fortalecimiento de la tracción (dorsal, trapecio medio e inferior, romboides) para compensar el predominio de empuje que casi todos cargamos.",
      "Trabajo específico de rotadores externos: en lanzadores y voleibolistas la cápsula posterior se retrae por el acortamiento adaptativo de los rotadores externos, y recuperar esa movilidad es clave.",
      "Terapia manual puntual cuando ayuda a ganar rango sin dolor, siempre acompañada de ejercicio activo.",
      "Progresión de cargas con criterios objetivos para volver al deporte o al entrenamiento, no solo cuando deja de doler.",
    ],
    redFlags: [
      "Pérdida brusca de fuerza en el brazo después de un trauma: puede ser una rotura completa.",
      "Deformidad visible del hombro tras una caída o luxación.",
      "Dolor nocturno intenso, constante, que no cede con posición ni analgésicos.",
      "Fiebre, enrojecimiento o calor en la zona.",
      "Dolor que se irradia al pecho, mandíbula o brazo izquierdo con sudoración o dificultad para respirar: emergencia médica.",
    ],
    faqs: [
      {
        q: "¿Por qué me duele el hombro si nunca me lesioné?",
        a: "La mayoría de los dolores de hombro aparecen sin un trauma claro, y vienen de un desbalance acumulado. Casi todos entrenamos y vivimos con más empuje que tracción, el deltoides anterior y el pectoral toman el mando, y el manguito rotador deja de centrar bien la cabeza humeral. Ahí empieza el roce y el dolor.",
      },
      {
        q: "Soy voleibolista (o lanzador). ¿Por qué me duele cada vez más la parte posterior o superior?",
        a: "Es un patrón muy conocido: el gesto repetido de lanzar o rematar acorta de forma adaptativa a los rotadores externos, y eso termina retrayendo la cápsula posterior del hombro. Pierdes rotación interna, el hombro ya no se mueve centrado y aparece el dolor. Se trabaja recuperando esa movilidad y rebalanceando la fuerza del manguito.",
      },
      {
        q: "¿Puedo seguir entrenando mientras me recupero?",
        a: "Casi siempre sí, ajustando. Lo primero es sacar o modificar los ejercicios que te duelen (muchas veces press militar sobre la cabeza, fondos profundos o lanzamientos) y mantener lo que puedes hacer sin molestia, mientras trabajamos el déficit. La idea no es que pares, sino que entrenes distinto por un tiempo.",
      },
      {
        q: "Tengo un tip para mientras llego a la evaluación.",
        a: "Un tip útil, no una solución final: apoya una pelotita (de tenis o lacrosse) contra la pared, deja que presione sobre los rotadores externos del hombro (parte posterior, justo bajo el borde de la escápula) y mantén ahí entre 60 y 90 segundos. La idea es que la sintomatología baje levemente, no que desaparezca. Es un alivio temporal, no reemplaza la evaluación ni resuelve el desbalance de fondo.",
      },
      {
        q: "¿Necesito una ecografía o resonancia antes?",
        a: "En la mayoría de los casos no, al menos para empezar. Las imágenes se piden cuando hay señales específicas en la evaluación o cuando el dolor no responde al tratamiento. Si ya las tienes, tráelas; nos sirven para afinar el plan.",
      },
    ],
  },
  {
    slug: "deportiva",
    service: "kinesiologia",
    shortName: "Kinesiología deportiva",
    cardText: "Lesiones del deporte y vuelta segura a entrenar o competir.",
    metaTitle: "Kinesiología deportiva en Viña del Mar",
    description:
      "Kinesiología deportiva en Viña del Mar para runners, crossfit, pádel y deportistas: tratamos la lesión y planificamos la vuelta a entrenar con cargas progresivas.",
    h1: "Kinesiología deportiva en Viña del Mar",
    intro: [
      "Una lesión deportiva no termina cuando deja de doler. Entre el fin del dolor y volver a entrenar como antes hay una etapa de readaptación que, si se salta, aumenta el riesgo de volver a lesionarse.",
      "Trabajamos con corredores, deportistas de crossfit, pádel, ciclismo y gimnasio, y con personas que quieren retomar el deporte después de años.",
    ],
    whenToConsult: [
      "Tienes una lesión y quieres recuperarte sin perder más temporada de la necesaria.",
      "El dolor aparece siempre en el mismo gesto o a cierta carga de entrenamiento.",
      "Ya no te duele, pero no te sientes listo para volver.",
      "Quieres prevenir lesiones al aumentar tu volumen o preparar una competencia.",
    ],
    evaluation: [
      "Historia de entrenamiento, lesiones previas y objetivos deportivos.",
      "Evaluación de fuerza, movilidad y control en los gestos de tu deporte.",
      "Identificación de qué carga toleras hoy y cuál necesitas para volver.",
    ],
    treatment: [
      "Rehabilitación de la lesión con ejercicio progresivo y terapia manual cuando corresponde.",
      "Readaptación al gesto deportivo: carrera, salto, cambios de dirección o levantamientos.",
      "Plan de vuelta al entrenamiento con criterios objetivos de fuerza y función.",
      "Coordinación con tu entrenador cuando es útil.",
    ],
    redFlags: [
      "Dolor intenso que no cede con reposo o que despierta en la noche.",
      "Pérdida súbita de fuerza o imposibilidad de mover una articulación.",
      "Golpe en la cabeza con mareo, vómitos o confusión.",
      "Hinchazón importante inmediatamente después de una lesión.",
    ],
    faqs: [
      {
        q: "¿Cuándo puedo volver a competir?",
        a: "Cuando recuperas la fuerza y el control que exige tu deporte, no solo cuando deja de doler. Usamos pruebas objetivas para decidirlo contigo.",
      },
      {
        q: "¿Trabajan con mi entrenador?",
        a: "Sí, si te sirve. Compartimos el plan de carga para que el entrenamiento y la rehabilitación vayan en la misma dirección.",
      },
      {
        q: "¿Atienden solo a deportistas de alto rendimiento?",
        a: "No. La mayoría de nuestros pacientes son deportistas recreativos que quieren seguir entrenando sin dolor.",
      },
      {
        q: "¿Hacen evaluación para prevenir lesiones?",
        a: "Sí. Evaluamos fuerza, movilidad y control para ajustar tu entrenamiento antes de aumentar la carga o preparar una competencia.",
      },
    ],
  },
];

export function conditionsFor(serviceSlug: string): Condition[] {
  return conditions.filter((c) => c.service === serviceSlug);
}
