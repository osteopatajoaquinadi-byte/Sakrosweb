// Remitente de los correos. Mientras sakros.cl no esté verificado en Resend,
// se usa la dirección de prueba (que solo entrega al dueño de la cuenta).
// Al verificar el dominio basta con definir EMAIL_FROM_ADDRESS en Vercel,
// por ejemplo "reservas@sakros.cl", sin tocar código.
const FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || "onboarding@resend.dev";

export function emailFrom(name: string): string {
  return `${name} <${FROM_ADDRESS}>`;
}
