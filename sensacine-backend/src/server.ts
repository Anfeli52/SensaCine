import { env } from "./config/env";
import { app } from "./app";
import { logger } from "./infrastructure/logger/winston";

app.listen(env.PORT, () => {
  logger.info(` Servidor SensaCine escuchando en http://localhost:${env.PORT}`);
});
