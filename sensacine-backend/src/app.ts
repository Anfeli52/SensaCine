import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./modules/auth/auth.routes";
import { errorHandler } from "./common/middlewares/errorHandler";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// A medida que se implementen los demás módulos, se montan aquí, por ejemplo:
// app.use("/api/peliculas", peliculaRoutes);
// app.use("/api/reservas", reservaRoutes);
app.use("/api/auth", authRoutes);

// El errorHandler SIEMPRE va de último, después de montar todas las rutas.
app.use(errorHandler);
