import { renderBrandedEmail } from "@/lib/email-template";

// Campañas de correo (Resend Broadcasts) para la lista de pacientes.

export const SEGMENTOS = {
  todos: { id: "60103fb3-f3f2-438b-bb4f-4610b6829ce6", label: "Todos los pacientes" },
  osteopatia: { id: "ac18f9f9-7a00-4488-b85b-c74ded40eb64", label: "Pacientes de Osteopatía" },
} as const;
export type Segmento = keyof typeof SEGMENTOS;

export type ContenidoCampana = {
  asunto: string;
  preheader: string;
  titulo: string;
  cuerpo: string; // párrafos separados por línea en blanco
  imagen?: string; // URL https
  ctaTexto?: string;
  ctaUrl?: string;
};

// Saludo con el nombre del contacto; Resend lo reemplaza al enviar.
export const NOMBRE_VAR = "{{{contact.first_name|}}}";
const BAJA_VAR = "{{{RESEND_UNSUBSCRIBE_URL}}}";

export function parrafos(cuerpo: string) {
  return cuerpo.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

/**
 * HTML de la campaña. `nombre` reemplaza el saludo (vista previa / prueba);
 * sin él se deja la variable de Resend. `bajaUrl` igual con la baja.
 */
export function renderCampana(c: ContenidoCampana, opts: { nombre?: string; bajaUrl?: string } = {}) {
  const nombre = opts.nombre ?? NOMBRE_VAR;
  const mail = renderBrandedEmail({
    preheader: c.preheader || c.titulo,
    title: c.titulo,
    image: c.imagen ? { src: c.imagen, alt: c.titulo } : undefined,
    // Sin coma: si el contacto no tiene nombre queda "Hola" y no "Hola ,"
    greeting: `Hola ${nombre}`.trim(),
    paragraphs: parrafos(c.cuerpo),
    cta: c.ctaTexto && c.ctaUrl ? { label: c.ctaTexto, href: c.ctaUrl } : undefined,
    closing: ["Un abrazo,", "Equipo Sakros"],
  });
  const baja = opts.bajaUrl ?? BAJA_VAR;
  const pie = `<p style="margin:16px 0 0;font-size:11px;line-height:1.6;color:#94a3b8;text-align:center;font-family:Helvetica,Arial,sans-serif">Recibes este correo porque te atendiste en Sakros. <a href="${baja}" style="color:#64748b;text-decoration:underline">Dejar de recibir estos correos</a></p>`;
  const html = mail.html.replace("</table></td></tr></table></body>", `</table>${pie}</td></tr></table></body>`);
  const text = `${mail.text}\n\nPara dejar de recibir estos correos: ${baja}\n`;
  return { html, text };
}

