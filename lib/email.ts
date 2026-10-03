// Remitente de los correos. Mientras sakros.cl no esté verificado en Resend,
// se usa la dirección de prueba (que solo entrega al dueño de la cuenta).
// Al verificar el dominio basta con definir EMAIL_FROM_ADDRESS en Vercel,
// por ejemplo "reservas@sakros.cl", sin tocar código.
const FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || "onboarding@resend.dev";

export function emailFrom(name: string): string {
  return `${name} <${FROM_ADDRESS}>`;
}

// Interruptor general de los avisos del calendario (confirmaciones de
// reserva, reservas del panel y recordatorios). Apagado salvo que
// EMAILS_ENABLED=true: mientras sakros.cl siga en Wix, los pacientes reciben
// los avisos de Wix y el calendario nuevo no debe duplicarlos.
export function calendarNotificationsEnabled(): boolean {
  return process.env.EMAILS_ENABLED === "true" && Boolean(process.env.RESEND_API_KEY);
}
