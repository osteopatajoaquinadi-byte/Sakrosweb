import type { Metadata } from "next";
import { businessId, pageMetadata } from "@/lib/seo";
import Image from "next/image";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = pageMetadata({
  title: "Quiénes Somos — Equipo de osteopatía y kinesiología",
  description:
    "Equipo de osteopatía, kinesiología y posturología en Viña del Mar, dirigido por Joaquín Adi, kinesiólogo y osteópata D.O.",
  path: "/quienes-somos",
});

export default function QuienesSomosPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Joaquín Adi",
    jobTitle: "Kinesiólogo y Osteópata (D.O.)",
    url: `${siteConfig.url}/quienes-somos`,
    image: `${siteConfig.url}/images/joaquin-adi.jpg`,
    worksFor: { "@id": businessId },
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Quiénes Somos</h1>

      <section className="mb-12">
        <p className="text-slate-600">
          Somos un centro de bienestar corporal integral en Viña del Mar, donde
          el tratamiento individualizado se obtiene a través de un equipo de
          trabajo compuesto por un osteópata, una posturóloga y un equipo
          kinésico especializado en terapias manuales, control motor y
          movimiento.
        </p>
        <p className="text-slate-600 mt-4">
          En Sakros vas a encontrar todas las herramientas para recuperar tu
          estado de salud y sacarle el mejor rendimiento posible a tu cuerpo.
          Abordamos no solo desde el síntoma, sino buscando el origen de este,
          contemplando evaluación biomecánica articular, integración del SNC,
          alimentación, hábitos diarios y movimiento.
        </p>
      </section>

      {/* Joaquín */}
      <section className="mb-12">
        <div className="grid gap-8 md:grid-cols-[280px_1fr] items-start">
          <div>
            <Image
              src="/images/joaquin-adi.jpg"
              alt="Joaquín Adi — Osteópata, director de Sakros"
              width={400}
              height={500}
              className="rounded-2xl object-cover w-full"
            />
            <h2 className="text-xl font-bold text-slate-900 mt-4">
              Joaquín Adi A.
            </h2>
            <p className="text-sm text-teal-700 font-medium">Osteópata</p>
            <p className="text-xs text-slate-500 mt-1">
              D.O. · MSc PNIc · Faculty EOM Internacional
            </p>
          </div>
          <div className="text-slate-600 space-y-3">
            <p>
              Durante mi formación profesional como kinesiólogo, el enfoque del
              razonamiento clínico es buscar las mejores herramientas para
              evaluar y tratar al sistema músculoesquelético. Gracias a esto
              conocí la terapia manual ortopédica, que me brindó un pensamiento
              más global y mejores herramientas manuales.
            </p>
            <p>
              Al cabo de un tiempo y por una búsqueda constante para mejorar el
              estado de salud, llegué a la osteopatía, la cual me ha ayudado a
              tener un entendimiento global del cuerpo humano, desde su
              anatomía, biomecánica y fisiología, integrando al picante como un
              ser individual, con sus propias vivencias personales, y por ende su
              propia representación del dolor.
            </p>
            <p>
              En este proceso, he encontrado que la evaluación es la clave y
              poder brindar al paciente herramientas manuales sumado a un
              movimiento óptimo junto con hábitos saludables para retomar el
              control y mantenimiento de su propia salud.
            </p>
          </div>
        </div>
      </section>

      {/* Anikken */}
      <section className="mb-12">
        <div className="grid gap-8 md:grid-cols-[280px_1fr] items-start">
          <div>
            <Image
              src="/images/anikken-arentsen.jpg"
              alt="Anikken Arentsen — Posturóloga, co-directora de Sakros"
              width={400}
              height={500}
              className="rounded-2xl object-cover w-full"
            />
            <h2 className="text-xl font-bold text-slate-900 mt-4">
              Anikken Arentsen A.
            </h2>
            <p className="text-sm text-teal-700 font-medium">Posturóloga</p>
          </div>
          <div className="text-slate-600 space-y-3">
            <p>
              En la búsqueda de diferentes posibilidades para entregar
              herramientas únicas a mis pacientes, encontré esta bella formación
              llamada posturología clínica, que me ha permitido ayudar a mis
              pacientes, tanto grandes como pequeños, a abrir sus horizontes y
              posibilidades, entregando un cuerpo más armónico y funcional,
              estando preparado para adquirir nuevas habilidades y tener mejor
              calidad de vida.
            </p>
            <p>
              Mi enfoque no va solamente a mejorar la calidad de la postura, sino
              a abarcar todos los mecanismos neurofisiológicos que tienen
              finalmente como resultado la postura, lo que me ha llevado a
              incursionar en trastornos sensoriales, déficit atencional, espectro
              autista, entre otros, con excelente avances y resultados.
            </p>
          </div>
        </div>
      </section>

      {/* Camilo */}
      <section className="mb-12">
        <div className="grid gap-8 md:grid-cols-[280px_1fr] items-start">
          <div>
            <Image
              src="/images/camilo-zamora.jpg"
              alt="Camilo Zamora — Kinesiólogo de Sakros"
              width={400}
              height={500}
              className="rounded-2xl object-cover w-full"
            />
            <h2 className="text-xl font-bold text-slate-900 mt-4">
              Camilo Zamora
            </h2>
            <p className="text-sm text-teal-700 font-medium">Kinesiólogo</p>
            <p className="text-xs text-slate-500 mt-1">
              Universidad Andrés Bello · Osteopatía en formación (EOM)
            </p>
          </div>
          <div className="text-slate-600 space-y-3">
            <p>
              Soy kinesiólogo de la Universidad Andrés Bello y me estoy formando
              como osteópata en la Escuela de Osteopatía de Madrid. Trabajo en el
              área musculoesquelética, con foco en el movimiento y en ver a la
              persona en su totalidad, no solo la lesión.
            </p>
            <p>
              El deporte es parte de mi vida, y eso me ayuda a entender lo que
              significa volver a moverse bien. Creo que no hay dos pacientes
              iguales, por eso cada tratamiento es personalizado. Mi objetivo es
              que te sientas cómodo en cada sesión y recibas la mejor atención
              posible.
            </p>
          </div>
        </div>
      </section>

      {/* Para quién */}
      <section>
        <h2 className="text-xl font-semibold text-slate-900 mb-3">
          ¿Para quién es Sakros?
        </h2>
        <p className="text-slate-600">
          Para ex-deportistas y deportistas activos que quieren volver a entrenar
          sin dolor, y en general para cualquier persona que busque una
          evaluación real del origen de su molestia antes de un plan de
          tratamiento.
        </p>
      </section>
    </div>
  );
}
