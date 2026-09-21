import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./modules/auth/auth.routes";
import peliculaRoutes from "./modules/catalogo/pelicula.routes";
import salaRoutes from "./modules/programacion/sala.routes";
import funcionRoutes from "./modules/programacion/funcion.routes";
import adminRoutes from "./modules/admin/admin.routes";
import { errorHandler } from "./common/middlewares/errorHandler";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/peliculas", peliculaRoutes);
app.use("/api/salas", salaRoutes);
app.use("/api/funciones", funcionRoutes);
app.use("/api/admin", adminRoutes);
// El errorHandler SIEMPRE va de último, después de montar todas las rutas.

app.use(errorHandler);

