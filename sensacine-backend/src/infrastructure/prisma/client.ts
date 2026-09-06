import { PrismaClient } from "@prisma/client";

// Una sola instancia de PrismaClient para toda la aplicación.
// Si cada módulo creara su propio `new PrismaClient()`, se agotarían
// las conexiones disponibles de MySQL bajo carga.
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["warn", "error"],
});
