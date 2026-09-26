import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evidencia y Metodología — En qué nos basamos",
  description:
    "Cómo evaluamos y tratamos en Sakros: qué tiene evidencia firme, qué es razonamiento clínico y qué sigue en debate. Transparencia sobre nuestras herramientas terapéuticas.",
};

/* ------------------------------------------------------------------ */
/*  Contenido clasificado por nivel de evidencia                       */
/* ------------------------------------------------------------------ */

const evidenceLevels = [
  {
    label: "Evidencia firme",
    tag: "firme",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    iconColor: "text-emerald-600",
    description:
      "Respaldado por revisiones sistemáticas, ensayos clínicos consistentes o consenso profesional amplio. Usamos estos enfoques como columna vertebral de nuestros tratamientos.",
    items: [
      {
        title: "Ejercicio terapéutico progresivo",
        body: "El ejercicio dosificado y supervisado es la intervención con más evidencia para la recuperación funcional tras lesiones musculoesqueléticas. Mejora la fuerza, el control motor y la tolerancia a la carga, y reduce el riesgo de recaída. Lo usamos en todas las fases del tratamiento, no solo al final.",
        refs: "Blanchard & Glasgow, 2014; Beyer et al., 2015 — ensayos controlados en tendinopatía y rehabilitación deportiva.",
      },
      {
        title: "Terapia manual para dolor musculoesquelético",
        body: "Técnicas de movilización articular y manipulación vertebral muestran efectos positivos a corto y mediano plazo sobre el dolor lumbar, cervical y de extremidades, especialmente cuando se combinan con ejercicio. Lo combinamos siempre con trabajo activo del paciente.",
        refs: "Coulter et al., 2018; Gross et al., 2015 — revisiones Cochrane sobre manipulación y movilización.",
      },
      {
        title: "Educación al paciente sobre dolor",
        body: "Explicar al paciente qué es el dolor, por qué persiste y qué lo modula tiene un efecto medible en la reducción de la kinesiofobia (miedo al movimiento) y en la adherencia al tratamiento. Lo integramos desde la primera sesión.",
        refs: "Louw et al., 2011; Watson et al., 2019 — neurociencia del dolor aplicada.",
      },
      {
        title: "Control motor y estabilización",
        body: "El reentrenamiento del control motor — la capacidad de activar la musculatura correcta en el momento correcto — está respaldado para lumbalgia recurrente, inestabilidad de hombro y lesiones de rodilla. Es uno de los 4 pilares de nuestro método.",
        refs: "Hodges & Richardson, 1996; Sahrmann, 2002; Hides et al., 2001.",
      },
      {
        title: "Readaptación deportiva con cargas progresivas",
        body: "Volver al deporte sin una progresión controlada de cargas es uno de los principales factores de re-lesión. Los protocolos de return-to-sport con criterios objetivos (fuerza, salto, gestos deportivos) reducen significativamente la tasa de recaída.",
        refs: "Grindem et al., 2016; Ardern et al., 2016 — protocolos de vuelta al deporte tras LCA.",
      },
    ],
  },
  {
    label: "Razonamiento clínico",
    tag: "razonamiento",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    iconColor: "text-amber-600",
    description:
      "Enfoques con base fisiológica razonable, estudios preliminares positivos y amplia experiencia clínica, aunque sin el mismo volumen de evidencia de nivel I que los anteriores. Los usamos cuando el cuadro clínico lo justifica y lo explicamos al paciente.",
    items: [
      {
        title: "Osteopatía: enfoque visceral y craneal",
        body: "La osteopatía estructural (articulaciones y tejido blando) tiene evidencia firme para dolor lumbar y cervical. Las técnicas viscerales y craneales parten de modelos fisiológicos plausibles — relación entre restricciones de movilidad visceral y dolor referido, influencia de tensiones durales — pero la evidencia de alta calidad es todavía limitada. Las usamos como complemento dentro de un plan que siempre incluye ejercicio.",
        refs: "Licciardone et al., 2005; Franke et al., 2014 — metaanálisis sobre osteopatía en dolor lumbar. Cerritelli et al., 2021 — estado de la evidencia en técnicas craneales.",
      },
      {
        title: "Posturología clínica: integración pie-ojo-oclusión",
        body: "La posturología evalúa las entradas sensoriales (pie, visión, oclusión dental, propiocepción) que el sistema nervioso central usa para organizar la postura. El modelo tiene base neurofisiológica sólida y se usa ampliamente en Europa, aunque la cantidad de ensayos controlados aleatorizados es aún menor que en kinesiología convencional. La usamos cuando el dolor es recurrente y no responde al abordaje habitual.",
        refs: "Gagey & Weber, 1999; Da Cunha, 2001; Roll & Roll, 1988 — neurofisiología del sistema postural fino.",
      },
      {
        title: "Psiconeuroinmunología (PNI) clínica",
        body: "La PNI estudia la relación entre estrés crónico, inflamación de bajo grado, eje intestino-cerebro y dolor persistente. Hay evidencia creciente de que factores como el sueño, la alimentación y el estrés modulan la respuesta inflamatoria y la sensibilización central. Integramos estos factores en la evaluación cuando el cuadro sugiere un componente sistémico.",
        refs: "Nijs et al., 2017 — sensibilización central; Haddad et al., 2020 — relación entre estrés, inflamación y dolor crónico.",
      },
      {
        title: "Plantillas ortopédicas personalizadas a medida",
        body: "Las plantillas personalizadas muestran buenos resultados en fascitis plantar, dolor patelofemoral y sobrecarga de miembro inferior en deportistas. La evidencia es más fuerte para diseños basados en estudio biomecánico que para plantillas genéricas de farmacia.",
        refs: "Mills et al., 2010; Nigg et al., 2017 — revisiones sobre ortesis plantares en deporte.",
      },
    ],
  },
  {
    label: "En debate",
    tag: "debatido",
    color: "bg-slate-200 text-slate-700 border-slate-300",
    iconColor: "text-slate-500",
    description:
      "Temas donde existe divergencia real en la evidencia o en la comunidad profesional. Preferimos ser transparentes con esto en vez de presentarlo como si estuviera resuelto.",
    items: [
      {
        title: "Mecanismo exacto de las técnicas manuales",
        body: "Sabemos que la terapia manual funciona — los resultados clínicos son consistentes. Lo que sigue en discusión es por qué funciona exactamente: si el efecto es principalmente mecánico (reposicionar una estructura), neurofisiológico (modular la señal de dolor) o contextual (expectativa y alianza terapéutica). En la práctica, esto no cambia que la usemos; cambia cómo la explicamos.",
        refs: "Bialosky et al., 2009; 2018 — modelos neurofisiológicos de la terapia manual.",
      },
      {
        title: "Correlación entre hallazgos posturales y dolor",
        body: "No toda asimetría postural causa dolor, y no todo dolor tiene una causa postural. La relación entre postura estática y dolor es menos lineal de lo que se pensaba. En Sakros evaluamos la postura como una variable más, no como la explicación automática de cada síntoma.",
        refs: "Laird et al., 2014; Grob et al., 2007 — revisiones sobre postura y dolor lumbar.",
      },
      {
        title: "Uso de electroestimulación y ultrasonido como tratamiento principal",
        body: "Las modalidades pasivas (TENS, ultrasonido, magnetoterapia) tienen evidencia débil como tratamiento aislado. Pueden tener un rol complementario para modulación del dolor en fase aguda, pero no sustituyen el ejercicio ni la terapia manual. En Sakros no las usamos como pilar del tratamiento.",
        refs: "Chou et al., 2017; Foster et al., 2018 — guías de práctica clínica para dolor lumbar.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Componente de página                                               */
/* ------------------------------------------------------------------ */

export default function EvidenciaMetodologiaPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      {/* Encabezado */}
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
        Evidencia y Metodología
      </h1>
      <p className="text-lg text-slate-600 mb-4 max-w-3xl">
        Preferimos mostrarte en qué nos basamos — incluyendo lo que todavía está en
        discusión — en vez de presentar todo como si fuera igual de sólido. Así trabaja
        un equipo que confía en lo que hace.
      </p>
      <p className="text-slate-500 mb-12 max-w-3xl">
        Cada enfoque que usamos en Sakros está clasificado en uno de tres niveles. Esto
        no significa que uno sea &ldquo;mejor&rdquo; que otro — significa que tienen
        distinto grado de respaldo científico, y creemos que tienes derecho a saberlo.
      </p>

      {/* Leyenda de niveles */}
      <div className="flex flex-wrap gap-3 mb-12">
        {evidenceLevels.map((level) => (
          <span
            key={level.tag}
            className={`inline-block rounded-full border px-4 py-1.5 text-xs font-semibold ${level.color}`}
          >
            {level.label}
          </span>
        ))}
      </div>

      {/* Secciones de evidencia */}
      <div className="space-y-16">
        {evidenceLevels.map((level) => (
          <section key={level.tag} id={level.tag}>
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${level.color}`}
              >
                {level.label}
              </span>
            </div>
            <p className="text-slate-600 mb-8">{level.description}</p>

            <div className="space-y-8">
              {level.items.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 p-6"
                >
                  <h3 className="font-semibold text-slate-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 mb-4">{item.body}</p>
                  <p className="text-xs text-slate-400">
                    <span className="font-medium text-slate-500">
                      Referencias:
                    </span>{" "}
                    {item.refs}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Cómo trabajamos */}
      <section className="mt-16 rounded-2xl bg-slate-50 border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          Cómo se traduce esto en tu tratamiento
        </h2>
        <div className="space-y-4 text-slate-600">
          <p>
            En la práctica, cada paciente recibe una evaluación individualizada donde
            combinamos herramientas de los tres niveles según lo que su caso necesita.
            La diferencia es que te explicamos qué estamos haciendo y por qué — no damos
            por hecho que todo lo que hacemos tiene el mismo respaldo.
          </p>
          <p>
            Si algo de lo que usamos cambia de categoría porque aparece nueva evidencia
            (a favor o en contra), actualizamos esta página. No tenemos interés en
            defender una técnica si la ciencia deja de respaldarla.
          </p>
        </div>
      </section>

      {/* Credencial del autor */}
      <section className="mt-12 flex items-start gap-4 rounded-2xl border border-slate-200 p-6">
        <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-lg shrink-0">
          JA
        </div>
        <div>
          <p className="font-semibold text-slate-900">Joaquín Adi</p>
          <p className="text-sm text-slate-500 mb-2">
            Kinesiólogo · Osteópata D.O. · Director Clínico de Sakros
          </p>
          <p className="text-sm text-slate-500">
            Contenido revisado y actualizado por el equipo clínico de Sakros.
            Última actualización: septiembre 2026.
          </p>
        </div>
      </section>

      {/* CTA */}
      <div className="mt-12 text-center">
        <p className="text-slate-600 mb-4">
          Si tienes dudas sobre un tratamiento específico, pregúntanos directamente
          en tu evaluación.
        </p>
        <Link
          href="/reserva"
          className="inline-block rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Reserva tu evaluación
        </Link>
      </div>

      {/* Aviso médico */}
      <p className="mt-16 text-xs text-slate-400 border-t border-slate-200 pt-6">
        La información de esta página tiene fines educativos e informativos. No
        reemplaza la evaluación ni el diagnóstico de un profesional de la salud. Los
        resultados de cualquier tratamiento dependen de cada caso individual.
      </p>
    </div>
  );
}
