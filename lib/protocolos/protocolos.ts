import type { Protocolo } from "./types";

/* ══════════════════════════════════════════════════════════
   Protocolos base — Sakros

   Cada resumen se redactó a partir de los artículos citados, verificados
   en PubMed (PMID y DOI). Son plantillas: el profesional ajusta plazos,
   dosis y criterios a cada paciente y al informe quirúrgico.
   `revisado` pasa a true cuando un profesional del equipo valida el texto.
   ══════════════════════════════════════════════════════════ */

export const PROTOCOLOS: Protocolo[] = [
  // ─────────────────────────────────────────────────────────
  {
    id: "lca-reconstruccion",
    titulo: "Reconstrucción de ligamento cruzado anterior (LCA)",
    area: "kinesiologia",
    sinonimos: ["lca", "acl", "ligamento cruzado", "cruzado anterior", "plastia", "rodilla", "reconstruccion"],
    descripcion:
      "Rehabilitación post reconstrucción de LCA con progresión por criterios, desde la prehabilitación hasta el retorno al deporte (9–12 meses).",
    pubmed: "anterior cruciate ligament reconstruction AND rehabilitation",
    actualizado: "2026-10",
    origen: "base",
    revisado: false,
    evidencia: [
      { texto: "El ejercicio es la base de la rehabilitación; aún no hay evidencia sobre la relación dosis-respuesta (volumen o intensidad). La mayoría de las recomendaciones de la guía Aspetar tienen certeza baja a muy baja y se apoyan en consenso de expertos.", certeza: "baja" },
      { texto: "Se recomienda una fase de prehabilitación y tres fases postoperatorias guiadas por criterios, no solo por tiempo, con pruebas de fuerza, saltos, calidad de movimiento y factores psicológicos. La rehabilitación debería durar 9–12 meses.", certeza: "moderada" },
      { texto: "El ejercicio de cadena cinética abierta para el cuádriceps, sumado al de cadena cerrada, mejora la fuerza, la función y los resultados reportados por el paciente, sin efectos adversos sobre el injerto, sobre todo si se inicia alrededor de la semana 4.", certeza: "baja" },
      { texto: "Las modalidades (crioterapia, electroestimulación) sirven como complemento en la fase temprana para controlar dolor y derrame y permitir ejercicio antes.", certeza: "baja" },
      { texto: "Conviene retrasar el retorno al deporte, medir la fuerza de cuádriceps con frecuencia y mantener un programa de prevención secundaria después del alta.", certeza: "baja" },
    ],
    banderasRojas: [
      "Fiebre, calor y enrojecimiento progresivos (sospecha de artritis séptica)",
      "Dolor de pantorrilla, edema o disnea (sospecha de TVP/TEP)",
      "Derrame a tensión que no responde a manejo",
      "Pérdida súbita de extensión con bloqueo (posible cíclope o lesión meniscal)",
    ],
    escalas: ["IKDC subjetivo", "KOOS", "ACL-RSI (preparación psicológica)", "Índice de simetría de extremidades (LSI) en fuerza y saltos"],
    fases: [
      {
        nombre: "Fase 0 · Prehabilitación",
        semanas: "Hasta la cirugía",
        objetivos: ["Rodilla sin derrame", "Extensión completa y flexión ≥ 120°", "Fuerza de cuádriceps lo más simétrica posible", "Educación sobre la cirugía y las expectativas"],
        terapiaManual: ["Movilización patelar (deslizamientos superior, inferior, medial y lateral) para prevenir rigidez", "Tejido blando de cuádriceps e isquiotibiales si hay inhibición o contractura"],
        precauciones: ["Evitar pivotes y deportes de contacto", "Controlar la inestabilidad en las actividades diarias"],
        criteriosAvance: ["Derrame ≤ trazas", "Extensión 0°", "Marcha normal", "LSI de cuádriceps ≥ 80–90 % si es posible"],
        ejercicios: [{ id: "quad-set" }, { id: "slr" }, { id: "mini-squat" }, { id: "bridge" }, { id: "single-leg-balance" }, { id: "bike" }],
      },
      {
        nombre: "Fase 1 · Protección y control del derrame",
        semanas: "Semanas 0–2",
        objetivos: ["Controlar dolor y derrame", "Extensión pasiva completa (0°)", "Flexión ≥ 90°", "Activar el cuádriceps sin déficit de extensión activa"],
        terapiaManual: ["Movilización patelar diaria en todas las direcciones", "Movilizaciones tibiofemorales suaves (grados I–II) orientadas a recuperar la extensión completa", "Drenaje y masaje de tejidos blandos para el edema", "Crioterapia, compresión y electroestimulación del cuádriceps como complemento"],
        precauciones: ["Respetar las indicaciones del cirujano (meniscos suturados, injerto)", "Muletas hasta lograr una marcha sin cojera", "Crioterapia y compresión como complemento"],
        criteriosAvance: ["Extensión 0° simétrica", "SLR sin déficit de extensión", "Marcha sin muletas ni cojera", "Derrame ≤ 1+ (prueba de barrido)"],
        ejercicios: [{ id: "quad-set" }, { id: "slr" }, { id: "heel-slide" }, { id: "prone-hang" }, { id: "calf-raise", dosis: "3 × 15 bipodal" }, { id: "bridge", dosis: "3 × 10" }],
      },
      {
        nombre: "Fase 2 · Fuerza inicial",
        semanas: "Semanas 2–8",
        objetivos: ["Flexión completa", "Hipertrofia y fuerza de cuádriceps e isquiotibiales", "Control neuromuscular en apoyo monopodal"],
        terapiaManual: ["Movilización patelar y de la cicatriz (incisión y zona donante) cuando esté cerrada", "Movilizaciones tibiofemorales para el final de la flexión si sigue limitada", "Tejido blando de cuádriceps, isquiotibiales y pantorrilla según hallazgos"],
        precauciones: ["Cadena abierta de cuádriceps en rango 90°–45° desde la semana ~4, sin dolor ni derrame", "Con injerto de isquiotibiales: curl femoral con carga después de la semana 6 (o según el cirujano)", "Vigilar el derrame 24 h después de cada progresión"],
        criteriosAvance: ["Rango de movimiento completo", "Sin derrame", "LSI de cuádriceps ≥ 70 %", "Sentadilla monopodal a 45° sin valgo dinámico"],
        ejercicios: [{ id: "leg-press" }, { id: "knee-ext", dosis: "3 × 10–15 en rango 90°–45°" }, { id: "squat" }, { id: "step-up" }, { id: "hamstring-curl" }, { id: "single-bridge" }, { id: "single-leg-balance" }, { id: "bike", dosis: "15–20 min con resistencia" }],
      },
      {
        nombre: "Fase 3 · Fuerza, control y carrera",
        semanas: "Semanas 8–16",
        objetivos: ["Fuerza máxima progresiva", "Iniciar carrera en línea recta", "Pliometría bipodal de baja intensidad"],
        terapiaManual: ["Solo si persiste un déficit de movilidad o de tejido blando: la sesión se centra en el ejercicio"],
        precauciones: ["Iniciar carrera solo con criterios cumplidos, no por fecha", "Progresar la carga de impacto como máximo 10–20 % por semana"],
        criteriosAvance: ["LSI de cuádriceps ≥ 80 %", "Carrera de 20–30 min sin dolor ni derrame", "Hop tests con LSI ≥ 80 %"],
        ejercicios: [{ id: "split-squat" }, { id: "rdl" }, { id: "step-down" }, { id: "knee-ext", dosis: "3 × 8–12, rango completo progresivo" }, { id: "nordic" }, { id: "running-prog" }, { id: "hop-progression", dosis: "Saltos bipodales: 3 × 8" }],
      },
      {
        nombre: "Fase 4 · Potencia y agilidad",
        semanas: "Meses 4–9",
        objetivos: ["Pliometría monopodal", "Cambios de dirección planificados y reactivos", "Entrenamiento específico del deporte sin contacto"],
        terapiaManual: [],
        precauciones: ["Incluir tareas cognitivas o reactivas (doble tarea)", "Monitorear la confianza psicológica (ACL-RSI)"],
        criteriosAvance: ["LSI ≥ 90 % en fuerza de cuádriceps e isquiotibiales", "LSI ≥ 90 % en batería de saltos", "Buena calidad de movimiento en cortes y aterrizajes", "ACL-RSI adecuado"],
        ejercicios: [{ id: "hop-progression" }, { id: "agility" }, { id: "split-squat" }, { id: "nordic" }, { id: "rdl" }],
      },
      {
        nombre: "Fase 5 · Retorno al deporte y prevención secundaria",
        semanas: "Desde el mes 9",
        objetivos: ["Retorno gradual al entrenamiento con el equipo y luego a la competencia", "Programa de prevención de lesiones permanente"],
        terapiaManual: [],
        precauciones: ["El riesgo de nueva lesión es mayor antes de los 9 meses", "Mantener fuerza 2 veces por semana durante la temporada"],
        criteriosAvance: ["Alta: cumple la batería de retorno al deporte y completa entrenamientos sin síntomas"],
        ejercicios: [{ id: "nordic" }, { id: "single-leg-balance", dosis: "Con perturbaciones, 3 × 30 s" }, { id: "hop-progression" }, { id: "agility" }],
      },
    ],
    referencias: [
      { pmid: "36731908", doi: "10.1136/bjsports-2022-106158", cita: "Kotsifaki R, et al. Aspetar clinical practice guideline on rehabilitation after anterior cruciate ligament reconstruction. Br J Sports Med. 2023;57(9):500-514." },
      { pmid: "27539507", doi: "10.1136/bjsports-2015-095898", cita: "van Melick N, et al. Evidence-based clinical practice update: practice guidelines for ACL rehabilitation based on a systematic review and multidisciplinary consensus. Br J Sports Med. 2016;50(24):1506-1515." },
      { pmid: "34903114", doi: "10.1177/19417381211056873", cita: "Brinlee AW, et al. ACL Reconstruction Rehabilitation: Clinical Data, Biologic Healing, and Criterion-Based Milestones to Inform a Return-to-Sport Guideline. Sports Health. 2022;14(5):770-779." },
      { pmid: "39985872", doi: "10.1016/j.ptsp.2025.02.005", cita: "Fontanier V, et al. Effect of open kinetic chain exercises during the first weeks of ACL reconstruction rehabilitation: a systematic review and meta-analysis. Phys Ther Sport. 2025;72:95-108." },
      { pmid: "39925169", doi: "10.1002/ksa.12600", cita: "van Melick N, et al. Anterior cruciate ligament reconstruction rehabilitation: Decades of change. Knee Surg Sports Traumatol Arthrosc. 2025;33(4):1178-1182." },
    ],
  },

  // ─────────────────────────────────────────────────────────
  {
    id: "menisco",
    titulo: "Lesión de menisco (sutura, meniscectomía o tratamiento conservador)",
    area: "kinesiologia",
    sinonimos: ["menisco", "meniscal", "meniscectomia", "sutura meniscal", "raiz meniscal", "rodilla"],
    descripcion:
      "Protocolo basado en el consenso EU-US 2024. Las fases están escritas para una sutura meniscal; tras una meniscectomía parcial se avanza solo por criterios y suele ser más rápido (retorno en 4–8 semanas).",
    pubmed: "(meniscus OR meniscal) AND rehabilitation",
    actualizado: "2026-10",
    origen: "base",
    revisado: false,
    evidencia: [
      { texto: "La rehabilitación depende del tipo de lesión y del tratamiento realizado, y es igual tras una cirugía de menisco medial o lateral.", certeza: "baja" },
      { texto: "Tras una meniscectomía, la progresión debe basarse en hitos clínicos y no en plazos fijos. Tras una sutura o reconstrucción, debe combinar plazos y criterios.", certeza: "baja" },
      { texto: "En lesiones degenerativas, el tratamiento conservador con kinesiterapia es la primera opción, y puede serlo también en algunas roturas agudas.", certeza: "moderada" },
      { texto: "El retorno al deporte debe basarse en criterios y en tiempo, combinando cuestionarios del paciente con pruebas de rendimiento.", certeza: "baja" },
      { texto: "Tras reparar la raíz posterior del menisco medial, los protocolos son muy heterogéneos. Una mayor fuerza de cuádriceps se asocia a mejores resultados y posiblemente a menos extrusión meniscal (evidencia retrospectiva).", certeza: "muy baja" },
    ],
    banderasRojas: [
      "Bloqueo articular verdadero (rodilla trabada) que no cede",
      "Derrame a tensión o hemartrosis",
      "Signos de infección o de trombosis venosa profunda en el postoperatorio",
    ],
    escalas: ["KOOS", "IKDC subjetivo", "Lysholm", "Pruebas de salto y fuerza (LSI)"],
    fases: [
      {
        nombre: "Fase 1 · Protección del reparo",
        semanas: "Semanas 0–4 (hasta 6 en suturas radiales o de raíz)",
        objetivos: ["Proteger la sutura", "Controlar dolor y derrame", "Extensión completa", "Activar el cuádriceps"],
        terapiaManual: ["Movilización patelar suave", "Drenaje linfático manual y tejido blando para controlar el edema", "Sin movilizaciones que compriman o roten la rodilla en flexión mientras se protege la sutura"],
        precauciones: ["Carga y rango según el cirujano: en suturas radiales o de raíz se suele indicar descarga inicial", "Flexión limitada a 90° las primeras 4 semanas en suturas", "Sin sentadilla con carga ni flexión profunda", "Tras meniscectomía parcial: carga según tolerancia desde el día 1"],
        criteriosAvance: ["Extensión 0°", "SLR sin déficit de extensión", "Derrame mínimo", "Autorización del cirujano para progresar la carga"],
        ejercicios: [{ id: "quad-set" }, { id: "slr" }, { id: "heel-slide", dosis: "2 × 15, hasta 90°" }, { id: "prone-hang" }, { id: "bridge", dosis: "3 × 10" }],
      },
      {
        nombre: "Fase 2 · Carga progresiva y rango completo",
        semanas: "Semanas 4/6–12",
        objetivos: ["Marcha normal con carga completa", "Rango completo de forma progresiva", "Fuerza en cadena cerrada en rango medio"],
        terapiaManual: ["Movilización patelar y de la cicatriz", "Movilizaciones tibiofemorales progresivas para recuperar la flexión, sin forzar la flexión profunda antes de la semana 12 (sutura)", "Tejido blando de cuádriceps, isquiotibiales y cintilla iliotibial según hallazgos"],
        precauciones: ["Sentadilla hasta 60–90°, sin flexión profunda con carga antes de la semana ~12", "Evitar torsión con el pie fijo"],
        criteriosAvance: ["Flexión ≥ 120°", "Marcha y escaleras sin dolor", "Sentadilla monopodal a 45° controlada"],
        ejercicios: [{ id: "mini-squat" }, { id: "leg-press", dosis: "3 × 12, 0–60°" }, { id: "step-up" }, { id: "clamshell" }, { id: "calf-raise" }, { id: "single-leg-balance" }, { id: "bike" }],
      },
      {
        nombre: "Fase 3 · Fuerza y control neuromuscular",
        semanas: "Semanas 12–16",
        objetivos: ["Fuerza de cuádriceps y glúteos con rango completo", "Iniciar carrera en línea recta"],
        terapiaManual: ["Según hallazgos: la sesión se centra en el ejercicio"],
        precauciones: ["Progresar el impacto solo sin derrame en las 24 h siguientes"],
        criteriosAvance: ["LSI de cuádriceps ≥ 80 %", "Trote de 10–20 min sin síntomas"],
        ejercicios: [{ id: "squat" }, { id: "split-squat" }, { id: "step-down" }, { id: "rdl" }, { id: "single-bridge" }, { id: "running-prog" }],
      },
      {
        nombre: "Fase 4 · Retorno al deporte",
        semanas: "Meses 4–6 (sutura) · semanas 4–8 (meniscectomía)",
        objetivos: ["Pliometría, agilidad y gesto deportivo", "Retorno gradual a la competencia"],
        terapiaManual: [],
        precauciones: ["Considerar estado del cartílago y alineación del eje en lesiones degenerativas"],
        criteriosAvance: ["LSI ≥ 90 % en fuerza y saltos", "KOOS deporte/recreación adecuado", "Sin derrame ni dolor tras el entrenamiento"],
        ejercicios: [{ id: "hop-progression" }, { id: "agility" }, { id: "nordic" }, { id: "split-squat" }],
      },
    ],
    referencias: [
      { pmid: "40416991", doi: "10.1177/23259671251343088", cita: "Pujol N, et al. The Formal EU-US Meniscus Rehabilitation 2024 Consensus (ESSKA-AOSSM-AASPT). Part I: Rehabilitation management after meniscus surgery. Orthop J Sports Med. 2025;13(5)." },
      { pmid: "40501314", doi: "10.1002/ksa.12689", cita: "Prill R, et al. The Formal EU-US Meniscus Rehabilitation 2024 Consensus. Part II: Prevention, non-operative treatment and return to sport. Knee Surg Sports Traumatol Arthrosc. 2025;33(8):3014-3024." },
      { pmid: "42299826", doi: "10.1002/ksa.70491", cita: "Tageldein MM, et al. Postoperative rehabilitation after transtibial pullout repair of medial meniscus posterior root tears: a systematic review and meta-analysis. Knee Surg Sports Traumatol Arthrosc. 2026;34(7):2647-2660." },
      { pmid: "42050703", doi: "10.1186/s13018-026-06877-2", cita: "Zhao W, et al. The role of quadriceps strength and quadriceps-focused rehabilitation following medial meniscus posterior root repair: a systematic review. J Orthop Surg Res. 2026;21(1)." },
      { pmid: "42701879", doi: "10.1002/arj.70456", cita: "Dzidzishvili L, et al. An International Delphi Consensus on Meniscus Radial Tears: From Diagnosis to Management and Rehabilitation. Arthroscopy. 2026." },
    ],
  },

  // ─────────────────────────────────────────────────────────
  {
    id: "hombro-manguito",
    titulo: "Dolor de hombro relacionado con el manguito rotador (tendinopatía / dolor subacromial)",
    area: "kinesiologia",
    sinonimos: ["hombro", "manguito rotador", "tendinopatia", "subacromial", "pinzamiento", "impingement", "supraespinoso", "bursitis"],
    descripcion:
      "Manejo conservador del dolor de hombro relacionado con el manguito rotador, centrado en ejercicio progresivo de fuerza y control motor (12 semanas o más).",
    pubmed: "(rotator cuff related shoulder pain OR subacromial pain OR rotator cuff tendinopathy) AND exercise",
    actualizado: "2026-10",
    origen: "base",
    revisado: false,
    evidencia: [
      { texto: "Todas las guías de práctica clínica recomiendan tratamiento activo con ejercicio. En el dolor de hombro temprano, la resonancia magnética no suele estar indicada.", certeza: "moderada" },
      { texto: "Los programas de control motor reducen la discapacidad un poco más que el ejercicio inespecífico a corto y mediano plazo, aunque no el dolor a corto plazo.", certeza: "moderada" },
      { texto: "Las intervenciones con fortalecimiento o ejercicio activo mejoran la fuerza en todas las direcciones; las que no incluyen ejercicio no tienen efecto sobre la fuerza.", certeza: "moderada" },
      { texto: "El fortalecimiento concéntrico fue el tipo de ejercicio mejor clasificado para el dolor y la función en un metaanálisis en red; el excéntrico y el de control motor son alternativas razonables.", certeza: "baja" },
      { texto: "La estabilización escapular reduce el dolor y la discapacidad frente a la kinesiterapia convencional, sin mejorar el rango de movimiento.", certeza: "baja" },
    ],
    banderasRojas: [
      "Traumatismo con pérdida súbita de la elevación activa (sospecha de rotura masiva o luxación)",
      "Fiebre, enrojecimiento o calor articular",
      "Antecedente oncológico, pérdida de peso o dolor nocturno no mecánico",
      "Dolor referido de origen visceral o cardíaco (dolor con el esfuerzo, disnea)",
      "Déficit neurológico o síntomas radiculares cervicales",
    ],
    escalas: ["SPADI", "QuickDASH", "EVA de dolor", "Dinamometría de rotación externa y abducción"],
    fases: [
      {
        nombre: "Fase 1 · Calmar y educar",
        semanas: "Semanas 0–2",
        objetivos: ["Reducir la irritabilidad", "Educar sobre la modificación de la carga (no reposo absoluto)", "Mantener la movilidad"],
        terapiaManual: ["Movilizaciones glenohumerales suaves (grados I–II) con fines analgésicos", "Movilización o manipulación de la columna torácica y de la unión cervicotorácica como complemento analgésico de corto plazo", "Tejido blando de trapecio superior, pectoral menor y musculatura posterior del hombro"],
        precauciones: ["Dolor durante el ejercicio aceptable hasta 3–5/10 si se normaliza en 24 h", "Evitar temporalmente las cargas repetidas sobre la cabeza que provocan síntomas"],
        criteriosAvance: ["Dolor de reposo ≤ 3/10", "Tolera isométricos sin aumento de síntomas al día siguiente"],
        ejercicios: [{ id: "pendulum" }, { id: "iso-er" }, { id: "row-band", dosis: "3 × 12 con banda suave" }, { id: "chin-tuck", dosis: "2 × 10" }, { id: "open-book" }],
      },
      {
        nombre: "Fase 2 · Fuerza del manguito y control escapular",
        semanas: "Semanas 2–6",
        objetivos: ["Fuerza de rotadores externos e internos", "Control escapular", "Elevación activa sin compensaciones"],
        terapiaManual: ["Movilización glenohumeral posterior e inferior si falta rotación interna o elevación", "Movilización con movimiento (Mulligan) en elevación si reduce el dolor durante el gesto", "Siempre combinada con ejercicio: la terapia manual sola no mejora la fuerza"],
        precauciones: ["Progresar la carga cuando el ejercicio resulte fácil (RPE < 5)", "Mantener la técnica antes de aumentar el peso"],
        criteriosAvance: ["Elevación activa completa con dolor ≤ 3/10", "Fuerza de rotación externa ≥ 80 % del lado sano"],
        ejercicios: [{ id: "er-band" }, { id: "ir-band" }, { id: "side-lying-er" }, { id: "scaption" }, { id: "row-band" }, { id: "serratus-punch" }, { id: "wall-slide" }],
      },
      {
        nombre: "Fase 3 · Fuerza progresiva y elevación sobre la cabeza",
        semanas: "Semanas 6–12",
        objetivos: ["Fuerza con cargas mayores (8–12 repeticiones a RPE 7–8)", "Fuerza funcional sobre la cabeza", "Movilidad de rotación interna si está limitada"],
        terapiaManual: ["Solo si persiste un déficit de movilidad; prioridad al ejercicio con carga"],
        precauciones: ["Introducir la carga sobre la cabeza de forma gradual"],
        criteriosAvance: ["SPADI con mejora clínicamente relevante", "Fuerza ≥ 90 % del lado sano", "Tolera las demandas laborales o deportivas simuladas"],
        ejercicios: [{ id: "side-lying-er", dosis: "3 × 8–12, carga progresiva" }, { id: "overhead-press" }, { id: "scaption", dosis: "3 × 8–12, carga progresiva" }, { id: "row-band", dosis: "3 × 10, banda fuerte" }, { id: "sleeper" }, { id: "plank" }],
      },
      {
        nombre: "Fase 4 · Retorno a la actividad y mantención",
        semanas: "Desde la semana 12",
        objetivos: ["Volver al deporte o al trabajo", "Rutina de mantención 2 veces por semana"],
        terapiaManual: [],
        precauciones: ["Si no hay mejoría tras 12 semanas de ejercicio bien dosificado, reevaluar y considerar derivar"],
        criteriosAvance: ["Alta: sin limitación funcional y con autonomía en el programa"],
        ejercicios: [{ id: "overhead-press" }, { id: "side-lying-er" }, { id: "serratus-punch" }, { id: "plank" }],
      },
    ],
    referencias: [
      { pmid: "38848304", doi: "10.2519/jospt.2024.12453", cita: "Lafrance S, et al. The efficacy of exercise therapy for rotator cuff-related shoulder pain according to the FITT principle: a systematic review with meta-analyses. J Orthop Sports Phys Ther. 2024;54(8):499-512." },
      { pmid: "41620837", doi: "10.2519/jospt.2025.13445", cita: "Zhang B, et al. Addressing shoulder weakness in individuals with rotator cuff-related shoulder pain: a systematic review with meta-analysis. J Orthop Sports Phys Ther. 2026;56(2):67-84." },
      { pmid: "41276811", doi: "10.1186/s13018-025-06514-4", cita: "Zhang W, et al. Effects of seven types of exercise in the treatment of rotator cuff-related shoulder pain: a systematic review and Bayesian network meta-analysis. J Orthop Surg Res. 2025;20(1):1075." },
      { pmid: "37832814", doi: "10.1016/j.apmr.2023.09.022", cita: "Lowry V, et al. A systematic review of clinical practice guidelines on the diagnosis and management of various shoulder disorders. Arch Phys Med Rehabil. 2024;105(2):411-426." },
      { pmid: "38497039", doi: "10.3389/fneur.2024.1357763", cita: "Zhong Z, et al. Effect of scapular stabilization exercises on subacromial pain (impingement) syndrome: a systematic review and meta-analysis. Front Neurol. 2024;15:1357763." },
    ],
  },

  // ─────────────────────────────────────────────────────────
  {
    id: "cefalea-tensional-cervicogenica",
    titulo: "Cefalea tensional y cefalea cervicogénica",
    area: "osteopatia",
    sinonimos: ["cefalea", "dolor de cabeza", "cefalea tensional", "cervicogenica", "jaqueca", "cefalea cronica", "cuello", "cervical"],
    descripcion:
      "Abordaje multimodal con terapia manual cervical, ejercicio de fuerza y control motor, y educación. Aplicable a cefalea tensional episódica o crónica y a cefalea cervicogénica (8–12 semanas).",
    pubmed: "(tension-type headache OR cervicogenic headache) AND (manual therapy OR exercise OR physiotherapy)",
    actualizado: "2026-10",
    origen: "base",
    revisado: false,
    evidencia: [
      { texto: "En la cefalea cervicogénica, los enfoques multimodales no farmacológicos (terapia manual + ejercicio, con o sin otras técnicas) superan a las terapias aisladas y a los fármacos a corto plazo en intensidad, frecuencia y HIT-6.", certeza: "baja" },
      { texto: "La terapia manual cervical reduce la intensidad de la cefalea cervicogénica a corto plazo frente a placebo, pero el efecto no se mantiene a 12 meses.", certeza: "baja" },
      { texto: "La movilización tipo SNAG mejora dolor, discapacidad cervical y el test de flexión-rotación, con beneficios sostenidos. La manipulación puede ser la técnica más efectiva a corto plazo, según la experiencia del clínico.", certeza: "baja" },
      { texto: "En la cefalea tensional, el ejercicio reduce la intensidad del dolor. El ejercicio de fuerza reduce la frecuencia, mientras que la elongación aislada se asoció a más días con cefalea.", certeza: "muy baja" },
      { texto: "La depresión, la ansiedad, el miedo al dolor y la autoeficacia se asocian a la frecuencia y la discapacidad por cefalea: conviene evaluarlos y abordarlos con un enfoque biopsicosocial.", certeza: "moderada" },
    ],
    banderasRojas: [
      "Cefalea súbita \"la peor de mi vida\" (en trueno)",
      "Inicio después de los 50 años o cambio reciente del patrón habitual",
      "Fiebre, rigidez de nuca, pérdida de peso o antecedente oncológico o de inmunosupresión",
      "Déficit neurológico focal, alteración de conciencia, papiledema",
      "Cefalea que empeora con Valsalva, al acostarse o que despierta de noche",
      "Embarazo o puerperio; traumatismo cervical o craneal reciente",
      "Signos de disfunción arterial cervical (mareo, diplopía, disartria, disfagia, caída súbita) antes de la terapia manual",
    ],
    escalas: ["HIT-6", "Diario de cefalea (frecuencia, intensidad, duración, medicación)", "NDI (índice de discapacidad cervical)", "Test de flexión-rotación"],
    fases: [
      {
        nombre: "Fase 1 · Evaluación, alivio y educación",
        semanas: "Semanas 0–2",
        objetivos: ["Descartar banderas rojas y clasificar la cefalea (criterios ICHD-3)", "Reducir intensidad y frecuencia", "Iniciar diario de cefalea", "Educar sobre los desencadenantes y el uso de analgésicos"],
        terapiaManual: ["SNAG de C1–C2 en rotación (guiado por el test de flexión-rotación)", "Movilización cervical alta y torácica; manipulación solo tras la evaluación de riesgo vascular y con consentimiento", "Inhibición suboccipital y tejido blando de trapecio superior, esternocleidomastoideo y elevador de la escápula", "Técnicas craneales o miofasciales suaves si el paciente las tolera y responde"],
        precauciones: ["Antes de manipular la columna cervical: evaluar el riesgo vascular y obtener consentimiento informado", "Derivar al médico si hay abuso de analgésicos (≥ 10–15 días al mes)"],
        criteriosAvance: ["Sin banderas rojas", "Reducción inicial de la intensidad o mejor tolerancia a la movilidad cervical"],
        ejercicios: [{ id: "chin-tuck" }, { id: "cervical-rot-snag" }, { id: "diaphragmatic" }, { id: "breathing-478" }],
      },
      {
        nombre: "Fase 2 · Control motor y fuerza cervicoescapular",
        semanas: "Semanas 2–6",
        objetivos: ["Resistencia de flexores profundos del cuello", "Fuerza de la musculatura escapular y cervical", "Mantener los efectos de la terapia manual (1 sesión por semana)"],
        terapiaManual: ["Mantener 1 sesión semanal de terapia manual según la respuesta (el efecto es de corto plazo)", "Movilización torácica y costal para la postura y la respiración"],
        precauciones: ["Priorizar el ejercicio de fuerza sobre la elongación aislada"],
        criteriosAvance: ["Mantiene la flexión cráneo-cervical 10 × 10 s sin compensaciones", "Disminución ≥ 30 % de días con cefalea"],
        ejercicios: [{ id: "ccf" }, { id: "row-band" }, { id: "er-band" }, { id: "shrug" }, { id: "wall-slide" }, { id: "open-book" }],
      },
      {
        nombre: "Fase 3 · Fuerza, aeróbico y autonomía",
        semanas: "Semanas 6–12",
        objetivos: ["Programa de fuerza autónomo 2–3 veces por semana", "Actividad aeróbica regular", "Estrategias de autocuidado ante las crisis"],
        terapiaManual: ["Retirar progresivamente la terapia manual a medida que el paciente gana autonomía con el ejercicio"],
        precauciones: ["Si no hay mejoría a las 8–12 semanas, derivar a neurología"],
        criteriosAvance: ["Alta: reducción de la frecuencia ≥ 50 %, HIT-6 con mejora relevante y paciente autónomo"],
        ejercicios: [{ id: "shrug", dosis: "3 × 10, carga progresiva" }, { id: "row-band", dosis: "3 × 10, banda fuerte" }, { id: "overhead-press", dosis: "3 × 10, carga liviana" }, { id: "walking" }, { id: "plank" }],
      },
    ],
    referencias: [
      { pmid: "41569783", doi: "10.1002/ejp.70219", cita: "Koonalinthip N, et al. The comparative efficacy of treatments for cervicogenic headache: a systematic review and network meta-analysis of randomised controlled trials. Eur J Pain. 2026;30(2):e70219." },
      { pmid: "41520459", doi: "10.1016/j.rehab.2025.102070", cita: "Martins L, et al. Efficacy of nonsurgical interventions for the management of adults with cervicogenic headache: a systematic review and meta-analyses. Ann Phys Rehabil Med. 2026;69(4):102070." },
      { pmid: "40452767", doi: "10.3389/fneur.2025.1566764", cita: "Xu X, Ling Y. Comparative safety and efficacy of manual therapy interventions for cervicogenic headache: a systematic review and network meta-analysis. Front Neurol. 2025;16:1566764." },
      { pmid: "40257956", doi: "10.1093/postmj/qgaf055", cita: "Tao QF, et al. Disentangling preventive effects of differential exercise types on tension-type headache: a component network meta-analysis of randomized controlled trials. Postgrad Med J. 2025;101(1201):1147-1155." },
      { pmid: "42867745", doi: "10.1007/s11916-026-01566-5", cita: "Barreira C, et al. Pharmacological and non-pharmacological approaches to manage tension-type headache: a systematic review. Curr Pain Headache Rep. 2026;30(1)." },
      { pmid: "41693420", doi: "10.1080/09638288.2026.2621641", cita: "Tol CHM, et al. Association between psychological factors and headache burden in patients with migraine and tension-type headache: a systematic review and meta-analysis. Disabil Rehabil. 2026;48(16):5117-5149." },
    ],
  },

  // ─────────────────────────────────────────────────────────
  {
    id: "colon-irritable",
    titulo: "Síndrome de intestino irritable (SII)",
    area: "osteopatia",
    sinonimos: ["intestino irritable", "colon irritable", "sii", "ibs", "visceral", "distension", "estreñimiento", "constipacion", "digestivo"],
    descripcion:
      "Abordaje osteopático y de ejercicio como complemento del manejo médico y nutricional del SII (diagnóstico según criterios de Roma IV), en 12 semanas.",
    pubmed: "irritable bowel syndrome AND (osteopathic OR manual therapy OR exercise OR yoga)",
    actualizado: "2026-10",
    origen: "base",
    revisado: false,
    evidencia: [
      { texto: "El tratamiento osteopático (OMT) frente a placebo o ninguna intervención reduce el dolor abdominal y el estreñimiento, pero no la puntuación global de síntomas (IBS-SSS) ni la diarrea. Es seguro y sin efectos adversos graves.", certeza: "baja" },
      { texto: "El ejercicio estructurado mejora la severidad de los síntomas (IBS-SSS); su efecto sobre la calidad de vida y la ansiedad no es concluyente.", certeza: "baja" },
      { texto: "El ejercicio aeróbico moderado, la carrera, el pilates y el yoga mejoran síntomas, calidad de vida y estado de ánimo, con efecto probable sobre el eje intestino-cerebro.", certeza: "baja" },
      { texto: "Las intervenciones de autoayuda por internet (por ejemplo, terapia cognitivo-conductual) mejoran la severidad de los síntomas, la calidad de vida y la sensibilidad visceral.", certeza: "baja" },
      { texto: "El aceite de menta y la fibra soluble tienen efecto favorable: es otro motivo para coordinar el manejo con medicina y nutrición.", certeza: "moderada" },
    ],
    banderasRojas: [
      "Inicio de los síntomas después de los 50 años",
      "Sangrado rectal, melena o anemia",
      "Pérdida de peso no intencionada",
      "Síntomas nocturnos que despiertan al paciente",
      "Fiebre o masa abdominal palpable",
      "Antecedente familiar de cáncer colorrectal, enfermedad inflamatoria intestinal o enfermedad celíaca",
      "Cambio reciente y persistente del hábito intestinal",
    ],
    escalas: ["IBS-SSS (severidad de síntomas)", "IBS-QOL (calidad de vida)", "Escala de Bristol (diario de deposiciones)", "HADS (ansiedad y depresión)"],
    fases: [
      {
        nombre: "Fase 1 · Evaluación y tratamiento osteopático",
        semanas: "Semanas 0–4",
        objetivos: ["Confirmar el diagnóstico médico y descartar banderas rojas", "Reducir el dolor abdominal y el estreñimiento (OMT 1 vez por semana: diafragma, técnicas abdominales viscerales, columna toracolumbar y pelvis)", "Educar sobre el eje intestino-cerebro", "Iniciar respiración diafragmática diaria"],
        terapiaManual: ["Técnicas sobre el diafragma (inhibición, estiramiento y técnicas respiratorias)", "Técnicas viscerales abdominales suaves: marco cólico, mesenterio, ángulos cólicos y región ileocecal", "Movilización de la columna toracolumbar (T10–L2) y de la charnela toracolumbar", "Técnicas sobre sacro y pelvis; técnicas suaves de regulación autonómica"],
        precauciones: ["El OMT complementa el manejo médico y nutricional, no lo reemplaza", "Coordinar con nutrición (dieta baja en FODMAP guiada, fibra soluble)"],
        criteriosAvance: ["Sin banderas rojas", "Tolera las técnicas abdominales", "Reducción inicial del dolor abdominal"],
        ejercicios: [{ id: "diaphragmatic" }, { id: "crocodile" }, { id: "knee-to-chest" }, { id: "pelvic-tilt" }, { id: "walking", dosis: "20 min, 3–5 días por semana" }],
      },
      {
        nombre: "Fase 2 · Ejercicio estructurado",
        semanas: "Semanas 4–8",
        objetivos: ["Ejercicio aeróbico moderado 3–5 veces por semana", "Yoga o pilates 2–3 veces por semana", "OMT cada 2 semanas según la respuesta"],
        terapiaManual: ["OMT cada 2 semanas según la respuesta del dolor abdominal y del estreñimiento", "Enseñar automasaje abdominal en el sentido del colon como herramienta para la casa"],
        precauciones: ["Intensidad moderada (RPE 4–6/10); el ejercicio intenso puede empeorar los síntomas en algunos pacientes"],
        criteriosAvance: ["Reducción ≥ 50 puntos en IBS-SSS", "Adherencia ≥ 3 sesiones de ejercicio por semana"],
        ejercicios: [{ id: "walking", dosis: "30–40 min, 3–5 días por semana" }, { id: "yoga-flow" }, { id: "cat-camel" }, { id: "open-book" }, { id: "dead-bug" }, { id: "breathing-478" }],
      },
      {
        nombre: "Fase 3 · Autonomía y mantención",
        semanas: "Semanas 8–12",
        objetivos: ["Rutina autónoma de ejercicio y respiración", "Plan ante las crisis", "OMT de mantención mensual si aporta beneficio"],
        terapiaManual: ["OMT de mantención mensual solo si aporta beneficio claro"],
        precauciones: ["Si persisten síntomas relevantes, considerar derivar a psicología (TCC o hipnoterapia dirigida al intestino)"],
        criteriosAvance: ["Alta: IBS-SSS en rango leve (< 175) o mejora sostenida con autonomía"],
        ejercicios: [{ id: "walking" }, { id: "yoga-flow" }, { id: "bird-dog" }, { id: "bridge" }, { id: "diaphragmatic", dosis: "5 min diarios" }],
      },
    ],
    referencias: [
      { pmid: "37685480", doi: "10.3390/healthcare11172442", cita: "Buffone F, et al. Effectiveness of osteopathic manipulative treatment in adults with irritable bowel syndrome: a systematic review and meta-analysis. Healthcare (Basel). 2023;11(17):2442." },
      { pmid: "24917634", doi: "10.7556/jaoa.2014.098", cita: "Müller A, et al. Effectiveness of osteopathic manipulative therapy for managing symptoms of irritable bowel syndrome: a systematic review. J Am Osteopath Assoc. 2014;114(6):470-9." },
      { pmid: "41884124", doi: "10.3389/fmed.2026.1771521", cita: "Wu J, et al. Evaluation of the effectiveness of exercise therapy for irritable bowel syndrome: a systematic review and meta-analysis. Front Med. 2026;13:1771521." },
      { pmid: "41756281", doi: "10.3389/fimmu.2026.1730624", cita: "Quan Z, et al. The effects of different exercise interventions on clinical outcomes of irritable bowel syndrome and their potential mechanisms: a systematic review and network meta-analysis. Front Immunol. 2026;17:1730624." },
      { pmid: "41108584", doi: "10.1002/cph4.70061", cita: "Pavan F, et al. The effectiveness of yoga for irritable bowel syndrome: a systematic review. Compr Physiol. 2025;15(5):e70061." },
      { pmid: "42166786", doi: "10.2196/87216", cita: "Xu X, et al. Efficacy of internet-based self-help interventions for irritable bowel syndrome: systematic review and meta-analysis of randomized controlled trials. J Med Internet Res. 2026;28:e87216." },
      { pmid: "42572206", doi: "10.1002/ptr.70421", cita: "Meyer A, et al. Systematic review and meta-analysis: plant-based therapy for irritable bowel syndrome. Phytother Res. 2026;40(10):5918-5950." },
    ],
  },
];

function normalizar(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Búsqueda local por título, sinónimos y descripción (sin tildes ni mayúsculas). */
export function buscarProtocolos(consulta: string): Protocolo[] {
  const q = normalizar(consulta.trim());
  if (!q) return PROTOCOLOS;
  // Palabras genéricas que no distinguen una patología de otra
  const genericas = new Set(["dolor", "del", "los", "las", "con", "para", "post", "protocolo", "rehabilitacion", "tratamiento", "lesion"]);
  const palabras = q.split(/\s+/).filter((w) => w.length > 2 && !genericas.has(w));
  return PROTOCOLOS.filter((p) => {
    const texto = normalizar([p.titulo, p.descripcion, ...p.sinonimos].join(" "));
    return texto.includes(q) || palabras.some((w) => texto.includes(w));
  });
}
