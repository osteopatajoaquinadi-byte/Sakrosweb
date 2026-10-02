import Script from "next/script";

// GA4. Solo se carga si NEXT_PUBLIC_GA_ID está definido en Vercel, así el
// sitio funciona igual mientras no exista la propiedad de Analytics.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function GoogleAnalytics() {
  if (!GA_ID) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');
document.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('a');if(!a)return;var h=a.href||'';var t=h.indexOf('wa.me')>-1?'whatsapp':h.indexOf('mpago.la')>-1?'mercado_pago':h.indexOf('tuu.cl')>-1?'tuu':h.indexOf('tel:')===0?'telefono':null;if(t)gtag('event','clic_contacto',{destino:t,pagina:location.pathname});},true);`}
      </Script>
    </>
  );
}

// Evento de conversión desde el cliente (reserva confirmada, etc.).
export function trackEvent(name: string, params: Record<string, string | number> = {}) {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
  gtag?.("event", name, params);
}
