"use client";

import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site-config";

// Botón de WhatsApp siempre visible (abajo a la derecha). No aparece en el
// panel del equipo, en la reserva (tiene sus propios botones) ni en los
// cuestionarios. Los clics se miden con el evento clic_contacto de GA4.
const OCULTO_EN = ["/equipo", "/reserva", "/cuestionario"];
const MENSAJE = "Hola, quiero agendar una hora en Sakros";

export default function WhatsAppFlotante() {
  const ruta = usePathname() ?? "";
  if (OCULTO_EN.some((p) => ruta === p || ruta.startsWith(`${p}/`))) return null;
  return (
    <a
      href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(MENSAJE)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:scale-105 hover:bg-[#1ebe5a] sm:bottom-6 sm:right-6"
    >
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-6 w-6 fill-current">
        <path d="M16.04 3C9.08 3 3.43 8.64 3.43 15.6c0 2.22.58 4.39 1.69 6.3L3.33 28.5l6.78-1.78a12.6 12.6 0 0 0 5.93 1.5h.01c6.95 0 12.6-5.65 12.6-12.6 0-3.37-1.31-6.53-3.69-8.91A12.52 12.52 0 0 0 16.04 3zm0 23.1h-.01a10.5 10.5 0 0 1-5.35-1.47l-.38-.23-4.02 1.06 1.07-3.92-.25-.4a10.45 10.45 0 0 1-1.6-5.55c0-5.79 4.71-10.5 10.51-10.5 2.8 0 5.44 1.1 7.42 3.08a10.43 10.43 0 0 1 3.07 7.43c0 5.8-4.71 10.5-10.46 10.5zm5.76-7.86c-.32-.16-1.87-.92-2.16-1.03-.29-.1-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.18.21-.37.24-.69.08-.32-.16-1.33-.49-2.54-1.57-.94-.84-1.57-1.87-1.75-2.19-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.18.21-.32.32-.53.1-.21.05-.4-.03-.55-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.53-.71-.54h-.61c-.21 0-.55.08-.84.4-.29.32-1.1 1.08-1.1 2.63s1.13 3.05 1.29 3.26c.16.21 2.22 3.39 5.38 4.75.75.32 1.34.52 1.8.66.75.24 1.44.21 1.98.13.6-.09 1.87-.76 2.13-1.5.26-.74.26-1.37.18-1.5-.08-.13-.29-.21-.61-.37z" />
      </svg>
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
