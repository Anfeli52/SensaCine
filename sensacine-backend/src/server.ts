import { env } from "./config/env";
import { app } from "./app";
import { logger } from "./infrastructure/logger/winston";
import { createServer } from "http";
import { initSocket } from "./infrastructure/socket/socket";
import { bloqueoService, notificacionService } from "./di/container";

const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(env.PORT, () => {
  logger.info(` Servidor SensaCine escuchando en http://localhost:${env.PORT}`);
});

// Barrendero: libera los asientos "Pendiente" vencidos y avisa por WebSocket a quienes ven la función.
const INTERVALO_BARRIDO_MS = 5_000;
setInterval(() => {
  bloqueoService.liberarVencidos().catch((e) => logger.error(`Error liberando bloqueos vencidos: ${e}`));
}, INTERVALO_BARRIDO_MS).unref();

// Invita a reseñar las funciones que ya terminaron (una sola vez por reserva; ver NotificacionService).
const INTERVALO_SOLICITUD_RESENA_MS = 60_000;
let enviandoSolicitudes = false;
setInterval(() => {
  if (enviandoSolicitudes) return; // evita barridos solapados si el correo tarda
  enviandoSolicitudes = true;
  notificacionService
    .enviarSolicitudesResena()
    .then((n) => n && logger.info(`Invitaciones a reseñar enviadas: ${n}`))
    .catch((e) => logger.error(`Error enviando invitaciones a reseñar: ${e}`))
    .finally(() => {
      enviandoSolicitudes = false;
    });
}, INTERVALO_SOLICITUD_RESENA_MS).unref();
