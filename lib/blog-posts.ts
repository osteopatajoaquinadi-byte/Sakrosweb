export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  // Marca de borrador: contenido estructural de ejemplo, pendiente de
  // revisión clínica de Juaco antes de publicar (lenguaje YMYL).
  draft: boolean;
  // Párrafos. "## Título" es un subtítulo y "[[video]]" marca dónde va el video.
  body: string[];
  video?: { src: string; poster?: string; nombre: string; detalle: string };
  referencias?: { texto: string; doi: string }[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "dolor-persistente-y-dolor-pelvico-cronico",
    title: "Dolor persistente y dolor pélvico crónico: qué dice la evidencia sobre osteopatía, terapia manual y sistema nervioso autónomo",
    excerpt:
      "Cuando el dolor dura más de 3 meses, ya no basta con mirar el tejido. Qué dice la investigación sobre tratar en conjunto el sistema musculoesquelético, el visceral y el nervioso autónomo.",
    date: "2026-10-25",
    draft: false,
    body: [
      "Hablamos de dolor persistente (o crónico) cuando dura más de 3 meses. A esa altura el dolor ya no se explica solo por lo que pasa en el tejido: el sistema nervioso aprende a amplificar las señales y el dolor se vuelve más intenso, más extenso y más fácil de gatillar. La Asociación Internacional para el Estudio del Dolor llama a este mecanismo dolor nociplástico, y hoy existen criterios clínicos para reconocerlo (Kosek y colaboradores, 2021).",
      "Esto no significa que el dolor sea «psicológico» ni que esté en tu cabeza. Significa que el tratamiento tiene que mirar más de un sistema a la vez.",
      "## Dolor pélvico crónico: un dolor con muchas capas",
      "El dolor pélvico crónico (en la pelvis, el periné, la zona baja del abdomen o la vejiga) suele mezclar varios factores: músculos del piso pélvico y de la cadera con puntos de tensión, órganos de la pelvis más sensibles, un sistema nervioso en alerta, y el impacto en el sueño, la sexualidad y el ánimo.",
      "El panel de dolor pélvico crónico de la Asociación Europea de Urología recomienda evaluar el componente miofascial (músculos y fascia) en todas las personas con este dolor, porque es muy frecuente y suele pasarse por alto. También concluye que el enfoque multidisciplinario es el más efectivo (Abreu-Mendes y colaboradores, 2022).",
      "En un ensayo clínico multicéntrico, la terapia física miofascial de la pelvis logró una respuesta global positiva en el 57 % de los pacientes, frente al 21 % de un masaje terapéutico general (FitzGerald y colaboradores, 2009). Es decir, importa qué estructuras se tratan y con qué criterio.",
      "## Osteopatía y terapia manual",
      "En dolor lumbar crónico inespecífico, un metaanálisis encontró evidencia de calidad moderada de que el tratamiento osteopático reduce el dolor y mejora la función de forma clínicamente relevante (Franke y colaboradores, 2014). Otro metaanálisis más reciente llegó a conclusiones similares y destacó la liberación miofascial (Dal Farra y colaboradores, 2021).",
      "En el dolor lumbar y de cintura pélvica durante el embarazo y el posparto, el tratamiento osteopático también mostró beneficios en dolor y función (Franke y colaboradores, 2017).",
      "La terapia manual funciona mejor como parte de un plan, junto con ejercicio y educación, que como tratamiento aislado.",
      "## El sistema visceral",
      "La osteopatía visceral trabaja la movilidad de los órganos y sus fijaciones. Hay que decirlo con claridad: una revisión sistemática encontró que las pruebas diagnósticas viscerales tienen baja fiabilidad entre evaluadores y que todavía no hay estudios sólidos que demuestren su eficacia (Guillaud y colaboradores, 2018).",
      "Por eso en Sakros la usamos como complemento cuando hay síntomas digestivos, urinarios o pélvicos asociados, dentro de un tratamiento más amplio, y nunca como promesa por sí sola.",
      "## El sistema nervioso autónomo",
      "El sistema nervioso autónomo regula la respuesta de estrés y de recuperación. Un metaanálisis de 2026 con más de 3.600 personas mostró que quienes tienen dolor musculoesquelético crónico presentan una variabilidad de la frecuencia cardíaca (VFC) más baja, sobre todo en los indicadores vagales: el cuerpo pasa más tiempo en modo alerta (Fernández-Morales y colaboradores, 2026).",
      "Entrenar la respiración lenta con biofeedback de VFC muestra resultados prometedores para reducir el dolor, el ánimo bajo y el estrés, aunque todavía con pocos estudios y de tamaño pequeño (Fournié y colaboradores, 2021; Pellow y colaboradores, 2025). En Sakros medimos la VFC y la usamos para guiar el trabajo de respiración y la dosis de ejercicio.",
      "## Entender el dolor también es tratamiento",
      "La educación en neurociencia del dolor (explicar qué está pasando en tu sistema nervioso) reduce el miedo a moverse de forma clínicamente relevante, aunque por sí sola cambia poco la intensidad del dolor (Watson y colaboradores, 2019). Por eso la combinamos con el tratamiento manual y el ejercicio.",
      "## Por qué tratar en conjunto",
      "Ningún tratamiento aislado tiene efectos grandes en el dolor persistente. Lo que mejor funciona es combinar: terapia manual y miofascial para bajar la sensibilidad local, trabajo del piso pélvico cuando corresponde, respiración y regulación del sistema nervioso autónomo, ejercicio progresivo para recuperar la confianza en el movimiento y educación para entender lo que te pasa.",
      "[[video]]",
      "## Cuándo consultar primero con tu médico",
      "Antes de cualquier tratamiento manual, consulta con tu médico si tienes fiebre, sangrado anormal, pérdida de peso sin explicación, dolor intenso que no cede de noche, síntomas urinarios o intestinales nuevos, o pérdida de fuerza o sensibilidad. Estas señales requieren descartar otras causas.",
    ],
    video: {
      src: "/images/testimonio-maria-paz-tadres.mp4",
      poster: "/images/testimonio-maria-paz-tadres.jpg",
      nombre: "María Paz Tadres",
      detalle: "Pinzamiento de cadera y dolor persistente",
    },
    referencias: [
      { texto: "Kosek E, et al. Chronic nociplastic pain affecting the musculoskeletal system: clinical criteria and grading system. Pain. 2021;162(11):2629-2634.", doi: "10.1097/j.pain.0000000000002324" },
      { texto: "Abreu-Mendes P, et al. Myofascial pelvic pain: best orientation and clinical practice. Position of the European Association of Urology Guidelines Panel on Chronic Pelvic Pain. Eur Urol Focus. 2023;9(1):172-177.", doi: "10.1016/j.euf.2022.07.007" },
      { texto: "FitzGerald MP, et al. Randomized multicenter feasibility trial of myofascial physical therapy for the treatment of urological chronic pelvic pain syndromes. J Urol. 2009;182(2):570-580.", doi: "10.1016/j.juro.2009.04.022" },
      { texto: "Franke H, Franke JD, Fryer G. Osteopathic manipulative treatment for nonspecific low back pain: a systematic review and meta-analysis. BMC Musculoskelet Disord. 2014;15:286.", doi: "10.1186/1471-2474-15-286" },
      { texto: "Dal Farra F, et al. Effectiveness of osteopathic interventions in chronic non-specific low back pain: a systematic review and meta-analysis. Complement Ther Med. 2021;56:102616.", doi: "10.1016/j.ctim.2020.102616" },
      { texto: "Franke H, et al. Osteopathic manipulative treatment for low back and pelvic girdle pain during and after pregnancy: a systematic review and meta-analysis. J Bodyw Mov Ther. 2017;21(4):752-762.", doi: "10.1016/j.jbmt.2017.05.014" },
      { texto: "Guillaud A, et al. Reliability of diagnosis and clinical efficacy of visceral osteopathy: a systematic review. BMC Complement Altern Med. 2018;18:65.", doi: "10.1186/s12906-018-2098-8" },
      { texto: "Fernández-Morales C, et al. Which moderating factors influence autonomic imbalance in chronic musculoskeletal pain? A systematic review and multilevel meta-regression of heart rate variability. Pain. 2026;167(7):1524-1537.", doi: "10.1097/j.pain.0000000000003958" },
      { texto: "Fournié C, et al. Heart rate variability biofeedback in chronic disease management: a systematic review. Complement Ther Med. 2021;60:102750.", doi: "10.1016/j.ctim.2021.102750" },
      { texto: "Pellow K, et al. Effectiveness of non-invasive vagus nerve stimulation vs heart rate variability biofeedback interventions for chronic pain conditions: a systematic review. Scand J Pain. 2025;25(1).", doi: "10.1515/sjpain-2024-0037" },
      { texto: "Watson JA, et al. Pain neuroscience education for adults with chronic musculoskeletal pain: a mixed-methods systematic review and meta-analysis. J Pain. 2019;20(10):1140.e1-1140.e22.", doi: "10.1016/j.jpain.2019.02.011" },
    ],
  },
  {
    slug: "volver-a-entrenar-despues-de-una-lesion",
    title: "Volver a entrenar después de una lesión: la etapa que casi nadie te explica",
    excerpt:
      "Dejar de sentir dolor no es lo mismo que estar listo para entrenar como antes. Qué pasa en esa etapa intermedia y por qué muchos vuelven a lesionarse ahí.",
    date: "2026-09-01",
    draft: true,
    body: [
      "Es común escuchar 'ya no me duele, así que ya puedo volver a entrenar normal'. En la práctica, entre el fin del dolor y la vuelta segura al deporte hay una etapa de readaptación de carga que suele quedar sin cubrir.",
      "En esa etapa el objetivo no es evitar el movimiento, sino progresarlo de forma controlada: volumen, intensidad y complejidad del gesto deportivo, en ese orden.",
      "// TODO (Juaco): reemplazar este contenido de ejemplo con tu propio criterio clínico y casos reales antes de publicar. Este texto es solo un borrador estructural.",
    ],
  },
  {
    slug: "dolor-recurrente-que-va-y-viene",
    title: "Dolor que aparece y desaparece: por qué no significa que 'ya se está yendo'",
    excerpt:
      "Un dolor intermitente suele señalar una compensación o sobrecarga sin resolver, no una mejora espontánea. Qué evaluar antes de asumir que el cuerpo se está arreglando solo.",
    date: "2026-09-08",
    draft: true,
    body: [
      "El patrón de 'duele, deja de doler, vuelve a doler' es una de las consultas más frecuentes en personas que ya volvieron a su actividad física.",
      "Antes de asumir que es parte normal de la recuperación, conviene descartar que sea una compensación biomecánica sostenida en el tiempo.",
      "// TODO (Juaco): reemplazar este contenido de ejemplo con tu propio criterio clínico antes de publicar.",
    ],
  },
];
