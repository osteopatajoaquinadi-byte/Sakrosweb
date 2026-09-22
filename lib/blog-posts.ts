export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  // Marca de borrador: contenido estructural de ejemplo, pendiente de
  // revisión clínica de Juaco antes de publicar (lenguaje YMYL).
  draft: boolean;
  body: string[];
};

export const blogPosts: BlogPost[] = [
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
