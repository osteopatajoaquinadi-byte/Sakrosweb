"use client";

import type { ReactNode } from "react";

/* ── Iconos SVG por servicio ───────────────────────────── */

const icons: Record<string, ReactNode> = {
  osteopatia: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 text-white/90">
      {/* Columna vertebral */}
      <ellipse cx="32" cy="14" rx="5" ry="2.5" />
      <ellipse cx="32" cy="21" rx="6" ry="2.5" />
      <ellipse cx="32" cy="28" rx="6.5" ry="2.5" />
      <ellipse cx="32" cy="35" rx="6" ry="2.5" />
      <ellipse cx="32" cy="42" rx="5" ry="2.5" />
      <ellipse cx="32" cy="49" rx="4" ry="2" />
      {/* Manos */}
      <path d="M20 22c-5 3-7 10-4 18" strokeWidth="2" />
      <path d="M44 22c5 3 7 10 4 18" strokeWidth="2" />
    </svg>
  ),
  kinesiologia: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 text-white/90">
      {/* Camilla */}
      <rect x="10" y="36" width="36" height="4" rx="2" />
      <line x1="12" y1="40" x2="12" y2="50" />
      <line x1="44" y1="40" x2="44" y2="50" />
      {/* Paciente acostado */}
      <circle cx="42" cy="30" r="3.5" />
      <path d="M38 33c-3 1-8 2-14 2" />
      <path d="M20 35l-4 4" />
      {/* Terapeuta de pie */}
      <circle cx="54" cy="18" r="3.5" />
      <line x1="54" y1="22" x2="54" y2="38" />
      <path d="M54 28l-8 6" />
      <path d="M54 38l-3 8" />
      <path d="M54 38l3 8" />
    </svg>
  ),
  posturologia: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 text-white/90">
      {/* Cerebro */}
      <path d="M28 28c-2-6 2-12 8-12s8 6 8 10" />
      <path d="M28 28c-6 0-8 6-6 10s8 4 10 2" />
      <path d="M44 26c4 2 4 8 2 12s-8 4-10 2" />
      <path d="M32 38v0" />
      {/* Captores sensoriales */}
      <circle cx="16" cy="16" r="3" />{/* Ojo */}
      <ellipse cx="16" cy="16" rx="1.2" ry="1.2" fill="currentColor" />
      <circle cx="48" cy="16" r="3" />{/* Oído */}
      <path d="M47 14c1 0 2 1 2 2" />
      <circle cx="16" cy="48" r="3" />{/* Pie */}
      <path d="M15 46v3" />
      <circle cx="48" cy="48" r="3" />{/* Mano */}
      <path d="M47 46l2 3" />
      {/* Líneas de conexión */}
      <path d="M19 18l7 8" strokeDasharray="2 2" />
      <path d="M45 18l-7 8" strokeDasharray="2 2" />
      <path d="M19 46l9-8" strokeDasharray="2 2" />
      <path d="M45 46l-9-8" strokeDasharray="2 2" />
    </svg>
  ),
  "plantillas-ortopedicas": (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 text-white/90">
      {/* Pie */}
      <path d="M24 12c-2 8-6 16-6 24 0 6 4 10 10 12h8c6-2 8-6 8-10 0-4-2-6-4-8" />
      {/* Dedos */}
      <circle cx="34" cy="14" r="2.5" />
      <circle cx="39" cy="17" r="2" />
      <circle cx="42" cy="22" r="1.8" />
      {/* Plantilla debajo */}
      <path d="M16 52c0-2 4-4 12-4s14 2 14 4" strokeWidth="2" />
      <path d="M18 54c2 1 8 2 14 2s10-1 12-2" strokeWidth="2" />
    </svg>
  ),
  "actividad-fisica-dirigida": (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 text-white/90">
      {/* Corazón */}
      <path d="M32 52L14 34c-4-4-6-10-2-16 4-5 10-5 14-2l6 5 6-5c4-3 10-3 14 2 4 6 2 12-2 16L32 52z" />
      {/* Mancuerna dentro del corazón */}
      <rect x="22" y="30" width="6" height="4" rx="1" />
      <rect x="36" y="30" width="6" height="4" rx="1" />
      <line x1="28" y1="32" x2="36" y2="32" strokeWidth="2.5" />
    </svg>
  ),
  "estudio-biomecanico-pie": (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 text-white/90">
      {/* Pie lateral */}
      <path d="M12 42c0-4 2-10 8-16 4-4 10-8 16-10 4-1 8 0 10 2 2 3 2 6 0 10-2 6-2 10 0 14h-30c-3 0-4-1-4-2z" />
      {/* Línea de apoyo */}
      <line x1="8" y1="44" x2="50" y2="44" strokeWidth="2" />
      {/* Líneas de medición */}
      <line x1="16" y1="44" x2="16" y2="50" strokeDasharray="2 2" />
      <line x1="28" y1="44" x2="28" y2="50" strokeDasharray="2 2" />
      <line x1="40" y1="44" x2="40" y2="50" strokeDasharray="2 2" />
      {/* Arco plantar marcado */}
      <path d="M18 42c4-6 10-8 16-6" strokeDasharray="3 2" />
    </svg>
  ),
};

/* ── Componente ────────────────────────────────────────── */

type Props = {
  slug: string;
  name: string;
  tagline: string;
  /** "card" para la grilla de tarjetas, "hero" para la página individual del servicio */
  variant?: "card" | "hero";
};

export default function ServiceCardHeader({
  slug,
  name,
  tagline,
  variant = "card",
}: Props) {
  const icon = icons[slug];

  if (variant === "hero") {
    return (
      <div className="w-full rounded-2xl mb-8 bg-teal-900 flex items-center gap-8 px-8 py-10">
        {icon && <div className="shrink-0">{icon}</div>}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">{name}</h2>
          <p className="text-white/70 mt-1 text-sm md:text-base">{tagline}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-teal-900 flex flex-col items-center justify-center px-4 py-8 gap-3 min-h-[180px]">
      {icon}
      <div className="text-center">
        <p className="font-bold text-white text-lg">{name}</p>
        <p className="text-white/70 text-xs mt-1 leading-snug max-w-[220px] mx-auto">
          {tagline}
        </p>
      </div>
    </div>
  );
}
