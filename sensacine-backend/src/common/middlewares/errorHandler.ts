import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../errors/AppError";
import { logger } from "../../infrastructure/logger/winston";

// Middleware de error de Express: SIEMPRE va al final de app.ts, con 4 parámetros.
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  // Errores de negocio esperados (ej: "duración debe ser mayor a 0")
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Violación de restricción única de Prisma (ej: email duplicado -> P2002)
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    return res.status(409).json({ error: "El recurso ya existe (dato duplicado)" });
  }

  // Cualquier otro error: no se expone el detalle interno al cliente
  logger.error(err instanceof Error ? err.stack ?? err.message : String(err));
  return res.status(500).json({ error: "Error interno del servidor" });
}
