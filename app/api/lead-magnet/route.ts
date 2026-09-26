import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Nombre y email son obligatorios." },
        { status: 400 },
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY no está configurada.");
      return NextResponse.json(
        { error: "El formulario no está disponible en este momento." },
        { status: 500 },
      );
    }

    const resend = new Resend(apiKey);

    // 1) Enviar la guía al usuario
    await resend.emails.send({
      from: "Sakros <onboarding@resend.dev>",
      to: email,
      subject: "Tu guía: 5 pasos para volver a entrenar después de una lesión",
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; color: #1e293b;">
          <h1 style="color: #0f766e; font-size: 22px;">Hola ${name},</h1>
          <p>Gracias por descargar la guía de Sakros. Aquí tienes los 5 pasos clave para volver a entrenar de forma segura después de una lesión:</p>

          <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h2 style="color: #0f766e; font-size: 18px; margin-top: 0;">Paso 1: Entiende por qué duele (no solo dónde)</h2>
            <p style="font-size: 14px;">El dolor que reaparece al entrenar rara vez viene del lugar exacto donde lo sientes. Un dolor de rodilla al correr puede originarse en una falta de control de cadera, una restricción de tobillo o una compensación lumbar. Antes de volver a cargar, necesitas una evaluación que mire el cuerpo completo — no solo la zona que duele.</p>
            <p style="font-size: 13px; color: #64748b;"><strong>Qué puedes hacer hoy:</strong> Anota cuándo duele, con qué movimientos y cuánto dura. Esa información vale oro para tu kinesiólogo.</p>
          </div>

          <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h2 style="color: #0f766e; font-size: 18px; margin-top: 0;">Paso 2: Recupera rango de movimiento antes de meter fuerza</h2>
            <p style="font-size: 14px;">Muchos deportistas intentan volver directamente al entrenamiento con la misma intensidad de antes. El problema es que si la articulación no tiene su rango completo, el cuerpo compensa — y la compensación es la antesala de la recaída. Primero el rango, después la carga.</p>
            <p style="font-size: 13px; color: #64748b;"><strong>Qué puedes hacer hoy:</strong> Compara la movilidad de ambos lados (tobillo, cadera, hombro). Si hay una diferencia notable, ahí hay trabajo pendiente.</p>
          </div>

          <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h2 style="color: #0f766e; font-size: 18px; margin-top: 0;">Paso 3: Reentrenamiento del control motor</h2>
            <p style="font-size: 14px;">Tu cuerpo "aprendió" a moverse con la lesión. Esos patrones compensatorios no se corrigen solos cuando el dolor baja. El control motor — activar la musculatura correcta en el momento correcto — se reentrena con ejercicios específicos, no con más repeticiones del mismo movimiento que duele.</p>
            <p style="font-size: 13px; color: #64748b;"><strong>Qué puedes hacer hoy:</strong> Presta atención a cómo haces un movimiento básico (sentadilla, zancada). ¿Los sientes simétricos? ¿Hay un lado que "tira" más?</p>
          </div>

          <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h2 style="color: #0f766e; font-size: 18px; margin-top: 0;">Paso 4: Carga progresiva — el puente que falta</h2>
            <p style="font-size: 14px;">Entre "ya no me duele" y "ya puedo entrenar como antes" hay una etapa que la rehabilitación tradicional suele saltar. La progresión de carga simulando los gestos de tu deporte es lo que marca la diferencia entre una vuelta segura y una recaída a las 3 semanas.</p>
            <p style="font-size: 13px; color: #64748b;"><strong>Qué puedes hacer hoy:</strong> Vuelve al 50% de tu intensidad habitual y sube un 10-15% por semana solo si no hay dolor ni inflamación al día siguiente.</p>
          </div>

          <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h2 style="color: #0f766e; font-size: 18px; margin-top: 0;">Paso 5: Prevención activa — no esperes a que vuelva a doler</h2>
            <p style="font-size: 14px;">La mayoría de las lesiones recurrentes se repiten porque no se corrigió la causa de fondo: una debilidad muscular, una mala mecánica de pisada, una falta de movilidad articular. Prevenir no es "estirar 5 minutos antes de entrenar". Es un trabajo activo y continuo sobre las debilidades que ya conoces.</p>
            <p style="font-size: 13px; color: #64748b;"><strong>Qué puedes hacer hoy:</strong> Incorpora 10 minutos de trabajo de movilidad y activación antes de cada sesión. No es calentamiento — es preparación del sistema nervioso.</p>
          </div>

          <div style="background: #0f766e; border-radius: 12px; padding: 24px; margin: 24px 0; color: white; text-align: center;">
            <h2 style="margin-top: 0; font-size: 18px;">¿Quieres un plan personalizado?</h2>
            <p style="font-size: 14px; opacity: 0.9;">Estos 5 pasos son un punto de partida. Para que funcionen de verdad en tu caso, necesitas una evaluación que identifique tus compensaciones específicas y arme un plan a tu medida.</p>
            <a href="https://www.sakros.cl/reserva" style="display: inline-block; background: white; color: #0f766e; padding: 12px 28px; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 8px;">Reserva tu evaluación en Sakros</a>
          </div>

          <p style="font-size: 12px; color: #94a3b8; margin-top: 32px;">
            Sakros — Kinesiología a tu medida · 9 Norte 555, Edificio Emporium, Of. 201, Viña del Mar.<br/>
            Esta guía tiene fines educativos e informativos y no reemplaza la evaluación de un profesional.
          </p>
        </div>
      `,
    });

    // 2) Notificar a Sakros del nuevo lead
    await resend.emails.send({
      from: "Sakros Web <onboarding@resend.dev>",
      to: "sakrosvina@gmail.com",
      subject: `Nuevo lead magnet descargado — ${name}`,
      text: `Nombre: ${name}\nEmail: ${email}\n\nDescargó la guía "5 pasos para volver a entrenar después de una lesión".\nPuedes contactarlo para ofrecer una evaluación.`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error procesando lead magnet:", error);
    return NextResponse.json(
      { error: "No pudimos enviar la guía. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
