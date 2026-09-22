import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { logger } from "../logger/winston";

let io: Server | null = null;

export const roomFuncion = (idFuncion: number) => `funcion_${idFuncion}`;

// Se inicializa una sola vez desde server.ts. El resto del código usa getIO()
// en el momento de emitir, así no hay import circular con server.ts.
export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, { cors: { origin: "*" } });

  // Solo usuarios autenticados pueden conectarse (mismo JWT que la API REST)
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Token no proporcionado"));
    try {
      jwt.verify(token, env.JWT_SECRET);
      next();
    } catch {
      next(new Error("Token inválido o expirado"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("funcion:join", (idFuncion: unknown) => {
      const id = Number(idFuncion);
      if (Number.isInteger(id) && id > 0) socket.join(roomFuncion(id));
    });
    socket.on("funcion:leave", (idFuncion: unknown) => {
      const id = Number(idFuncion);
      if (Number.isInteger(id) && id > 0) socket.leave(roomFuncion(id));
    });
  });

  logger.info("Socket.IO inicializado");
  return io;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.IO no ha sido inicializado");
  return io;
}
