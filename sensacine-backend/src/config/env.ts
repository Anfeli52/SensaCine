import "dotenv/config";
import { z } from "zod";

// Si falta o está mal alguna variable, la app falla al arrancar
// en vez de fallar a mitad de una petición en producción.
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL es obligatorio"),
  JWT_SECRET: z.string().min(8, "JWT_SECRET debe tener al menos 8 caracteres"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(10),
  // URL pública del frontend: se usa para los enlaces de los correos (p. ej. la invitación a reseñar)
  FRONTEND_URL: z.preprocess((v) => (v === "" ? undefined : v), z.string().url().default("http://localhost:5173")),

  // Correo (opcional). Sin SMTP la app arranca igual, pero los correos de confirmación
  // quedan registrados como "fallido" en la tabla notificacion y se avisa en el log.
  SMTP_HOST: z.string().trim().optional(),
  SMTP_PORT: z.preprocess((v) => (v === "" ? undefined : v), z.coerce.number().default(587)),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  // API de Gmail por HTTPS (OAuth2): si las tres están definidas se usa en lugar de SMTP
  GMAIL_CLIENT_ID: z.string().trim().optional(),
  GMAIL_CLIENT_SECRET: z.string().trim().optional(),
  GMAIL_REFRESH_TOKEN: z.string().trim().optional(),
  MAIL_FROM: z.preprocess((v) => (v === "" ? undefined : v), z.string().default("SensaCine <no-reply@sensacine.com>")),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Variables de entorno inválidas:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
