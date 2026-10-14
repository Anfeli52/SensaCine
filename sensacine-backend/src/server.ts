import { env } from "./config/env";
import { app } from "./app";
import { logger } from "./infrastructure/logger/winston";
import { createServer } from "http";
import { initSocket } from "./infrastructure/socket/socket";
import { bloqueoService } from "./di/container";

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
