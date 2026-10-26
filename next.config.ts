import type { NextConfig } from "next";

// Redirects 301 desde las URLs indexadas del sitio Wix anterior hacia sus
// equivalentes nuevas. Objetivo: no perder el posicionamiento que ya existe
// en Search Console al migrar de plataforma.
//
// PENDIENTE (Juaco): confirmar de quién es "osteopatiayposturologia.cl" —
// aparecía como título/dominio en 3 páginas del Wix (/treatments,
// /contact-8, /general-9). Si es un dominio tuyo que sigue vivo, hay que
// decidir si se redirige también a sakros.cl o se deja operando aparte.
//
// PENDIENTE: /service-page/motion-balance apuntaba tanto a "Plantillas
// personalizadas" como a "Estudio biomecánico del pie" en el sitio viejo
// (URL duplicada para dos servicios distintos). Se redirige aquí a
// plantillas-ortopedicas por ser la página de conversión; si prefieres que
// vaya a estudio-biomecanico-pie, se cambia en un minuto.
const nextConfig: NextConfig = {
  // Sakros Go: app estática en public/go (index, fotos y video).
  async rewrites() {
    return [
      { source: "/go", destination: "/go/index.html" },
      // Landing de venta de Sakros Go (página estática).
      { source: "/sakros-go", destination: "/sakros-go/index.html" },
    ];
  },
  async redirects() {
    return [
      { source: "/treatments", destination: "/servicios", permanent: true },
      { source: "/contact-8", destination: "/contacto", permanent: true },
      { source: "/plans-pricing", destination: "/packs-tratamiento", permanent: true },
      {
        source: "/laboratorio-plantillas",
        destination: "/servicios/plantillas-ortopedicas",
        permanent: true,
      },
      {
        source: "/service-page/osteopat%C3%ADa",
        destination: "/servicios/osteopatia",
        permanent: true,
      },
      {
        source: "/service-page/kinesiolog%C3%ADa-vi%C3%B1a-del-mar",
        destination: "/servicios/kinesiologia",
        permanent: true,
      },
      {
        source: "/service-page/posturolog%C3%ADa-cl%C3%ADnica-1",
        destination: "/servicios/posturologia",
        permanent: true,
      },
      {
        source: "/service-page/motion-balance",
        destination: "/servicios/plantillas-ortopedicas",
        permanent: true,
      },
      {
        source: "/booking-calendar/actividad-f%C3%ADsica-dirigida",
        destination: "/servicios/actividad-fisica-dirigida",
        permanent: true,
      },
      // "/general-9" quedó en el listado que pegaste sin contenido claro;
      // por ahora va al home. Ajustar si corresponde a otra página.
      { source: "/general-9", destination: "/", permanent: true },
      // Vistas en Search Console (export del 2 de octubre) que aún no tenían destino.
      {
        source: "/service-page/kinesiolog%C3%ADa",
        destination: "/servicios/kinesiologia",
        permanent: true,
      },
      { source: "/category/:path*", destination: "/servicios", permanent: true },
      // 404 en Search Console (18 oct): rehabilitación de piso pélvico es kinesiología.
      {
        source: "/service-page/rehab-piso-pelvico",
        destination: "/servicios/kinesiologia",
        permanent: true,
      },
      // Otras páginas antiguas de Wix vistas en Search Console (25 oct).
      { source: "/paywall", destination: "/", permanent: true },
      { source: "/members", destination: "/", permanent: true },
      { source: "/testimonios", destination: "/", permanent: true },
      { source: "/giftcards", destination: "/packs-tratamiento", permanent: true },
      { source: "/pricing-plans/:path*", destination: "/packs-tratamiento", permanent: true },
      { source: "/payment-request-page", destination: "/reserva", permanent: true },
      { source: "/educaci%C3%B3n", destination: "/evidencia-metodologia", permanent: true },
      {
        source: "/copia-de-formaci%C3%B3nes-sakros",
        destination: "/evidencia-metodologia",
        permanent: true,
      },
      // Cualquier otra página de servicio o reserva antigua de Wix.
      { source: "/service-page/:path*", destination: "/servicios", permanent: true },
      { source: "/booking-calendar/:path*", destination: "/reserva", permanent: true },
    ];
  },
};

export default nextConfig;
