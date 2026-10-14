import MailComposer from "nodemailer/lib/mail-composer";
import { IEmailSender, MensajeCorreo } from "../../modules/notificaciones/notificacion.types";
import { logger } from "../logger/winston";

export interface GmailApiConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  from: string;
  // Inyectables solo para pruebas
  fetchFn?: typeof fetch;
  tokenUrl?: string;
  sendUrl?: string;
  timeoutMs?: number;
}

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

/**
 * Envía por la API de Gmail (HTTPS, puerto 443) en vez de SMTP: sirve cuando la red bloquea los puertos de correo.
 * Usa OAuth2: con un refresh token se obtiene un access token temporal que se renueva solo.
 */
export class GmailApiEmailSender implements IEmailSender {
  private accessToken: { valor: string; expiraEnMs: number } | null = null;
  private renovando: Promise<string> | null = null;

  constructor(private config: GmailApiConfig) {}

  private get fetchFn(): typeof fetch {
    return this.config.fetchFn ?? fetch;
  }

  async send(mensaje: MensajeCorreo): Promise<void> {
    const raw = await this.construirMime(mensaje);
    const id = await this.enviar(raw, true);
    logger.info(`Correo enviado a ${mensaje.to} por Gmail API (${id})`);
  }

  // Nodemailer arma el mensaje MIME (codificación UTF-8, texto + HTML); Gmail lo recibe en base64url
  private construirMime(mensaje: MensajeCorreo): Promise<string> {
    const nodo = new MailComposer({ from: this.config.from, ...mensaje }).compile();
    return new Promise((resolve, reject) =>
      nodo.build((err: Error | null, buffer: Buffer) => (err ? reject(err) : resolve(buffer.toString("base64url"))))
    );
  }

  private async enviar(raw: string, puedeReintentar: boolean): Promise<string> {
    const token = await this.getAccessToken();
    const res = await this.llamar(this.config.sendUrl ?? SEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ raw }),
    });

    // El access token pudo caducar o revocarse justo ahora: se renueva una vez y se reintenta
    if (res.status === 401 && puedeReintentar) {
      this.accessToken = null;
      return this.enviar(raw, false);
    }
    if (!res.ok) throw new Error(await this.describirErrorEnvio(res));

    const cuerpo = (await res.json().catch(() => ({}))) as { id?: string };
    return cuerpo.id ?? "sin id";
  }

  private getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.accessToken.expiraEnMs) return Promise.resolve(this.accessToken.valor);
    // Si varios envíos coinciden, comparten una sola renovación
    this.renovando ??= this.renovarAccessToken().finally(() => {
      this.renovando = null;
    });
    return this.renovando;
  }

  private async renovarAccessToken(): Promise<string> {
    const res = await this.llamar(this.config.tokenUrl ?? TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: this.config.refreshToken,
        grant_type: "refresh_token",
      }),
    });
    const cuerpo = (await res.json().catch(() => ({}))) as {
      access_token?: string;
      expires_in?: number;
      error?: string;
      error_description?: string;
    };

    if (!res.ok || !cuerpo.access_token) throw new Error(this.describirErrorToken(cuerpo.error, cuerpo.error_description));

    // Se renueva un minuto antes de que venza
    this.accessToken = { valor: cuerpo.access_token, expiraEnMs: Date.now() + ((cuerpo.expires_in ?? 3600) - 60) * 1000 };
    return cuerpo.access_token;
  }

  private async llamar(url: string, init: RequestInit): Promise<Response> {
    try {
      return await this.fetchFn(url, { ...init, signal: AbortSignal.timeout(this.config.timeoutMs ?? 15_000) });
    } catch (e) {
      const err = e as { name?: string; cause?: { code?: string } };
      if (err.name === "TimeoutError" || err.name === "AbortError") {
        throw new Error("Google no respondió a tiempo (15 s). Revisa tu conexión a internet");
      }
      throw new Error(`no se pudo conectar con Google (${err.cause?.code ?? (e instanceof Error ? e.message : e)}). Revisa tu conexión a internet`);
    }
  }

  private describirErrorToken(codigo?: string, descripcion?: string): string {
    const detalle = descripcion ? ` (${descripcion})` : "";
    switch (codigo) {
      case "invalid_grant":
        return `el refresh token venció o fue revocado${detalle}. Genera uno nuevo en el OAuth Playground; en modo "Prueba" caduca a los 7 días, publica la app en la pantalla de consentimiento para evitarlo`;
      case "invalid_client":
        return `GMAIL_CLIENT_ID o GMAIL_CLIENT_SECRET son incorrectos${detalle}. Deben ser los de la credencial OAuth que usaste para generar el refresh token`;
      case "unauthorized_client":
        return `Google no autoriza este cliente OAuth${detalle}. Genera el refresh token con las mismas credenciales (ID y secreto) que usas en .env`;
      default:
        return `Google rechazó la renovación del acceso: ${codigo ?? "error desconocido"}${detalle}`;
    }
  }

  private async describirErrorEnvio(res: Response): Promise<string> {
    const cuerpo = (await res.json().catch(() => ({}))) as {
      error?: { message?: string; status?: string; errors?: { reason?: string }[] };
    };
    const mensaje = cuerpo.error?.message ?? res.statusText;
    const razon = cuerpo.error?.errors?.[0]?.reason;

    if (res.status === 403 && (razon === "accessNotConfigured" || /has not been used|is disabled/i.test(mensaje))) {
      return `la Gmail API no está activada en tu proyecto de Google Cloud (${mensaje}). Actívala en "APIs y servicios > Biblioteca"`;
    }
    if (res.status === 403 || razon === "insufficientPermissions") {
      return `el token no tiene permiso para enviar correo (${mensaje}). Autoriza de nuevo incluyendo el permiso https://www.googleapis.com/auth/gmail.send`;
    }
    if (res.status === 429) return `Google limitó los envíos temporalmente (${mensaje}). Intenta de nuevo más tarde`;
    return `la Gmail API respondió ${res.status}: ${mensaje}`;
  }
}
