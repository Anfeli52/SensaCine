import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./modules/auth/auth.routes";
import peliculaRoutes from "./modules/catalogo/pelicula.routes";
import { errorHandler } from "./common/middlewares/errorHandler";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/peliculas", peliculaRoutes);

// El errorHandler SIEMPRE va de último, después de montar todas las rutas.

app.use(errorHandler);
