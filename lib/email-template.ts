// Plantilla de correo con la imagen de Sakros (logo, colores, pie de página).
// HTML con estilos en línea y tablas, para que se vea bien en Gmail, Outlook y
// Apple Mail; cada correo lleva además su versión en texto plano.
import { siteConfig } from "@/lib/site-config";

const TEAL = "#0f766e";
const TEAL_DARK = "#115e59";
const INK = "#0f172a";
const MUTED = "#475569";
const LINE = "#e2e8f0";

const TONES = {
  pending: { bg: "#fffbeb", fg: "#92400e", border: "#fde68a" },
  confirmed: { bg: "#ecfdf5", fg: "#065f46", border: "#a7f3d0" },
  info: { bg: "#f0fdfa", fg: TEAL_DARK, border: "#99f6e4" },
} as const;

type Tone = keyof typeof TONES;

export type BrandedEmail = {
  preheader: string;
  badge?: { text: string; tone: Tone };
  title: string;
  greeting: string;
  paragraphs: string[];
  details?: [string, string][];
  list?: { title: string; items: string[] };
  cta?: { label: string; href: string };
  box?: { title: string; lines: string[]; tone: Tone; link?: { label: string; href: string } };
  // Muestra el recuadro antes del botón (ej. datos de transferencia).
  boxFirst?: boolean;
  tips?: string[];
  closing: string[];
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}`;
export const phoneLabel = "+56 9 4539 9692";

export function renderBrandedEmail(e: BrandedEmail): { html: string; text: string } {
  const p = (t: string) =>
    `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:${MUTED}">${esc(t)}</p>`;

  const badge = e.badge
    ? `<span style="display:inline-block;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;letter-spacing:.3px;background:${TONES[e.badge.tone].bg};color:${TONES[e.badge.tone].fg};border:1px solid ${TONES[e.badge.tone].border}">${esc(e.badge.text)}</span>`
    : "";

  const details = e.details?.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 20px;border:1px solid ${LINE};border-radius:12px;border-collapse:separate;overflow:hidden">${e.details
        .map(
          ([k, v], i) =>
            `<tr><td style="padding:11px 16px;font-size:13px;color:${MUTED};width:38%;${i ? `border-top:1px solid ${LINE};` : ""}">${esc(k)}</td><td style="padding:11px 16px;font-size:14px;font-weight:600;color:${INK};${i ? `border-top:1px solid ${LINE};` : ""}">${esc(v)}</td></tr>`
        )
        .join("")}</table>`
    : "";

  const list = e.list
    ? `<p style="margin:0 0 6px;font-size:14px;font-weight:700;color:${INK}">${esc(e.list.title)}</p><ol style="margin:0 0 20px;padding-left:20px;color:${MUTED};font-size:14px;line-height:1.7">${e.list.items
        .map((i) => `<li>${esc(i)}</li>`)
        .join("")}</ol>`
    : "";

  const cta = e.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:4px 0 20px"><tr><td style="border-radius:999px;background:${TEAL}"><a href="${esc(e.cta.href)}" style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px">${esc(e.cta.label)}</a></td></tr></table>`
    : "";

  const box = e.box
    ? `<div style="margin:0 0 20px;padding:14px 16px;border-radius:12px;background:${TONES[e.box.tone].bg};border:1px solid ${TONES[e.box.tone].border}"><p style="margin:0 0 6px;font-size:14px;font-weight:700;color:${TONES[e.box.tone].fg}">${esc(e.box.title)}</p>${e.box.lines
        .map((l) => `<p style="margin:0;font-size:14px;line-height:1.6;color:${INK}">${esc(l)}</p>`)
        .join("")}${e.box.link ? `<p style="margin:10px 0 0;font-size:14px;font-weight:700"><a href="${esc(e.box.link.href)}" style="color:${TEAL};text-decoration:underline">${esc(e.box.link.label)}</a></p>` : ""}</div>`
    : "";

  const tips = e.tips?.length
    ? `<p style="margin:0 0 6px;font-size:14px;font-weight:700;color:${INK}">Para tu sesión</p><ul style="margin:0 0 20px;padding-left:20px;color:${MUTED};font-size:14px;line-height:1.7">${e.tips
        .map((t) => `<li>${esc(t)}</li>`)
        .join("")}</ul>`
    : "";

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(e.title)}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Helvetica,Arial,sans-serif">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(e.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${LINE}">
<tr><td style="padding:24px 28px 18px;text-align:center;border-bottom:4px solid ${TEAL}"><a href="${siteConfig.url}" style="text-decoration:none"><img src="${siteConfig.url}/images/logo-sakros-email.png" width="150" alt="Sakros" style="display:inline-block;border:0;width:150px;height:auto"></a></td></tr>
<tr><td style="padding:28px 28px 8px">
${badge ? `<div style="margin:0 0 14px">${badge}</div>` : ""}
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:${INK}">${esc(e.title)}</h1>
${p(e.greeting)}
${e.paragraphs.map(p).join("")}
${details}${list}${e.boxFirst ? box + cta : cta + box}${tips}
${e.closing.map((c, i) => {
  const last = i === e.closing.length - 1;
  const spaced = i < e.closing.length - 2;
  return `<p style="margin:0 0 ${spaced ? 14 : 0}px;font-size:15px;line-height:1.6;color:${last ? INK : MUTED};${last ? "font-weight:700;" : ""}">${esc(c)}</p>`;
}).join("")}
</td></tr>
<tr><td style="padding:24px 28px 28px"></td></tr>
<tr><td style="padding:18px 28px;background:#f8fafc;border-top:1px solid ${LINE};font-size:12px;line-height:1.7;color:${MUTED};text-align:center">
<strong style="color:${INK}">Sakros</strong> · Osteopatía, kinesiología y posturología<br>
${esc(siteConfig.address.street)}, ${esc(siteConfig.address.city)}<br>
<a href="${whatsappUrl}" style="color:${TEAL};text-decoration:none">WhatsApp ${phoneLabel}</a> · <a href="${siteConfig.instagram}" style="color:${TEAL};text-decoration:none">Instagram</a> · <a href="${siteConfig.url}" style="color:${TEAL};text-decoration:none">sakros.cl</a>
</td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    e.title,
    "",
    e.greeting,
    "",
    ...e.paragraphs.flatMap((t) => [t, ""]),
    ...(e.details ?? []).map(([k, v]) => `${k}: ${v}`),
    e.details?.length ? "" : null,
    ...(e.list ? [e.list.title, ...e.list.items.map((i, n) => `  ${n + 1}. ${i}`), ""] : []),
    ...(e.cta ? [`${e.cta.label}: ${e.cta.href}`, ""] : []),
    ...(e.box ? [e.box.title, ...e.box.lines, ...(e.box.link ? [`${e.box.link.label}: ${e.box.link.href}`] : []), ""] : []),
    ...(e.tips?.length ? ["Para tu sesión:", ...e.tips.map((t) => `- ${t}`), ""] : []),
    ...e.closing,
    "",
    "—",
    `Sakros · ${siteConfig.address.street}, ${siteConfig.address.city}`,
    `WhatsApp ${phoneLabel} · ${siteConfig.url}`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  return { html, text };
}

export const sessionTips = [
  "Llega 5 a 10 minutos antes.",
  "Usa ropa cómoda que permita moverte.",
  "Si tienes exámenes, imágenes o informes médicos relacionados, tráelos.",
];

export const changePolicy = `Si necesitas cambiar o cancelar tu hora, avísanos con al menos 24 horas de anticipación por WhatsApp al ${phoneLabel}.`;
