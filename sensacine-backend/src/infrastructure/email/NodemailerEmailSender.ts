import nodemailer, { Transporter } from "nodemailer";
import { IEmailSender, MensajeCorreo } from "../../modules/notificaciones/notificacion.types";
import { logger } from "../logger/winston";

export interface SmtpConfig {
  host?: string;
  port: number;
  user?: string;
  pass?: string;
  from: string;
}

export class NodemailerEmailSender implements IEmailSender {
  private transporter: Transporter | null = null;

  constructor(private config: SmtpConfig) {}

  // Se crea al primer envío: si falta SMTP la app arranca igual y el error aparece (y se registra) al enviar
  private getTransporter(): Transporter {
    const { host, port, user, pass } = this.config;
    if (!host) throw new Error("SMTP no configurado: define SMTP_HOST, SMTP_USER y SMTP_PASS en .env");
    this.transporter ??= nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // 465 = TLS directo; 587/25 = STARTTLS
      auth: user ? { user, pass } : undefined,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
    return this.transporter;
  }

  async send(mensaje: MensajeCorreo): Promise<void> {
    let info;
    try {
      info = await this.getTransporter().sendMail({ from: this.config.from, ...mensaje });
    } catch (e) {
      throw this.explicar(e);
    }

    // Un destinatario rechazado por el servidor no es un envío exitoso
    const rechazados = info.rejected ?? [];
    if (rechazados.length > 0) throw new Error(`el servidor rechazó el destinatario: ${rechazados.join(", ")}`);

    const vistaPrevia = nodemailer.getTestMessageUrl(info); // solo existe con Ethereal
    logger.info(`Correo enviado a ${mensaje.to} (${info.messageId})${vistaPrevia ? ` vista previa: ${vistaPrevia}` : ""}`);
  }

  // Convierte los errores de red/credenciales de nodemailer en mensajes que dicen qué revisar
  private explicar(e: unknown): Error {
    const err = e as { code?: string; message?: string };
    const destino = `${this.config.host}:${this.config.port}`;
    switch (err.code) {
      case "ETIMEDOUT":
      case "ECONNECTION":
      case "ESOCKET":
      case "ECONNREFUSED":
      case "ENETUNREACH":
      case "EHOSTUNREACH":
        return new Error(`no se pudo conectar con el servidor de correo ${destino} (${err.message}). La red o el firewall pueden estar bloqueando ese puerto; prueba SMTP_PORT=465 u otra red`);
      case "EDNS":
      case "ENOTFOUND":
        return new Error(`no se encontró el servidor de correo "${this.config.host}" (${err.message}). Revisa SMTP_HOST`);
      case "EAUTH":
        return new Error(`${destino} rechazó el usuario o la contraseña (${err.message}). En Gmail usa una contraseña de aplicación, no la clave normal`);
      default:
        return e instanceof Error ? e : new Error(String(e));
    }
  }
}
