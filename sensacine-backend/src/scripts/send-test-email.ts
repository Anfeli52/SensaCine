import dns from "dns/promises";
import net from "net";
import { env } from "../config/env";
import { createEmailSender, gmailApiConfigurada } from "../infrastructure/email/createEmailSender";
import { renderConfirmacionReserva } from "../modules/notificaciones/confirmacionReserva.template";

const PUERTOS_SMTP = [587, 465];

function probarConexion(host: string, port: number): Promise<string> {
  return new Promise((resolve) => {
    const inicio = Date.now();
    const socket = net.connect({ host, port, timeout: 5000 });
    socket.once("connect", () => { socket.destroy(); resolve(`abierto (${Date.now() - inicio} ms)`); });
    socket.once("timeout", () => { socket.destroy(); resolve("sin respuesta en 5 s (bloqueado o sin ruta)"); });
    socket.once("error", (e: NodeJS.ErrnoException) => resolve(`error ${e.code ?? e.message}`));
  });
}

// Cuando no se logra conectar: prueba cada dirección (IPv4/IPv6) y puerto para decir qué sirve y qué no
async function diagnosticarRed(host: string) {
  console.error(`\nDiagnóstico de red hacia ${host}:`);
  let abiertos: number[] = [];
  try {
    const direcciones = await dns.lookup(host, { all: true });
    for (const puerto of PUERTOS_SMTP) {
      for (const d of direcciones) {
        const r = await probarConexion(d.address, puerto);
        if (r.startsWith("abierto")) abiertos.push(puerto);
        console.error(`  IPv${d.family} ${d.address}:${puerto} -> ${r}`);
      }
    }
  } catch (e) {
    console.error(`  No se pudo resolver ${host}: ${e instanceof Error ? e.message : e}`);
    return;
  }
  abiertos = [...new Set(abiertos)];
  if (abiertos.length === 0) {
    console.error("\nConclusión: ningún puerto de correo es alcanzable desde esta red (firewall, proveedor de internet o VPN).");
    console.error("  - Prueba con otra red (por ejemplo, el hotspot del celular) o desactiva la VPN.");
    console.error("  - Si tu red bloquea el correo saliente, usa un servicio que envíe por HTTPS (puerto 443).");
  } else if (!abiertos.includes(env.SMTP_PORT)) {
    console.error(`\nConclusión: el puerto ${env.SMTP_PORT} no responde pero el ${abiertos.join(", ")} sí. Pon SMTP_PORT=${abiertos[0]} en .env y reinicia.`);
  } else {
    console.error(`\nConclusión: el puerto ${env.SMTP_PORT} sí responde; el problema no es de red. Revisa usuario/contraseña de aplicación.`);
  }
}

// Comprueba la configuración de correo (Gmail API o SMTP, la misma que usa la app) enviando un correo de ejemplo.
// Uso: npm run mail:test -- destino@correo.com
async function main() {
  const destino = process.argv[2];
  if (!destino) {
    console.error("Uso: npm run mail:test -- destino@correo.com");
    process.exit(1);
  }
  const { sender, proveedor } = createEmailSender();
  if (proveedor === "smtp" && !env.SMTP_HOST) {
    console.error("Falta configurar el correo en .env: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET y GMAIL_REFRESH_TOKEN (recomendado), o SMTP_HOST/SMTP_USER/SMTP_PASS. Ver .env.example.");
    process.exit(1);
  }
  console.log(`Enviando con ${proveedor === "gmail_api" ? "la API de Gmail (HTTPS)" : `SMTP (${env.SMTP_HOST}:${env.SMTP_PORT})`}...`);

  const mensaje = renderConfirmacionReserva({
    idReserva: 1,
    emailDestino: destino,
    nombreUsuario: "Prueba SensaCine",
    pelicula: "Oppenheimer",
    sala: "Sala 2 - IMAX Laser Sensorial",
    fecha: new Date(Date.UTC(2026, 9, 20)),
    horaInicio: new Date("1970-01-01T19:00:00Z"),
    horaFin: new Date("1970-01-01T22:00:00Z"),
    asientos: [
      { fila: "E", numero: 7, nombrePersona: "Prueba SensaCine" },
      { fila: "E", numero: 8, nombrePersona: "Invitado" },
    ],
    montoPagado: 64000,
    referenciaTransaccion: "TX-SENSA-PRUEBA",
  });

  await sender.send({ ...mensaje, subject: `[PRUEBA] ${mensaje.subject}` });
  console.log(`Correo de prueba enviado a ${destino}. Revisa la bandeja de entrada (y la carpeta de spam).`);
}

main().catch(async (e) => {
  const mensaje = e instanceof Error ? e.message : String(e);
  console.error("No se pudo enviar el correo:", mensaje);
  // El diagnóstico de puertos solo aplica a SMTP; la API de Gmail ya explica su propio error
  if (!gmailApiConfigurada() && env.SMTP_HOST && /no se pudo conectar|timeout|ETIMEDOUT/i.test(mensaje)) {
    await diagnosticarRed(env.SMTP_HOST);
  }
  process.exit(1);
});
