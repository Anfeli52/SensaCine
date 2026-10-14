import { env } from "../../config/env";
import { IEmailSender } from "../../modules/notificaciones/notificacion.types";
import { GmailApiEmailSender } from "./GmailApiEmailSender";
import { NodemailerEmailSender } from "./NodemailerEmailSender";

export type ProveedorCorreo = "gmail_api" | "smtp";

export const gmailApiConfigurada = (): boolean =>
  !!(env.GMAIL_CLIENT_ID && env.GMAIL_CLIENT_SECRET && env.GMAIL_REFRESH_TOKEN);

/**
 * Elige cómo salen los correos según el .env:
 *  1. Gmail API (HTTPS) si están GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET y GMAIL_REFRESH_TOKEN
 *  2. SMTP en cualquier otro caso (si tampoco hay SMTP_HOST, cada envío falla con un mensaje claro)
 */
export function createEmailSender(): { sender: IEmailSender; proveedor: ProveedorCorreo } {
  if (gmailApiConfigurada()) {
    return {
      proveedor: "gmail_api",
      sender: new GmailApiEmailSender({
        clientId: env.GMAIL_CLIENT_ID!,
        clientSecret: env.GMAIL_CLIENT_SECRET!,
        refreshToken: env.GMAIL_REFRESH_TOKEN!,
        from: env.MAIL_FROM,
      }),
    };
  }
  return {
    proveedor: "smtp",
    sender: new NodemailerEmailSender({
      host: env.SMTP_HOST || undefined,
      port: env.SMTP_PORT,
      user: env.SMTP_USER || undefined,
      pass: env.SMTP_PASS || undefined,
      from: env.MAIL_FROM,
    }),
  };
}
