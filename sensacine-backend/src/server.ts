import { env } from "./config/env";
import { app } from "./app";
import { logger } from "./infrastructure/logger/winston";
import { createServer } from "http";
import { initSocket } from "./infrastructure/socket/socket";

const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(env.PORT, () => {
  logger.info(` Servidor SensaCine escuchando en http://localhost:${env.PORT}`);
});
