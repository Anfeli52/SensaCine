import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../errors/AppError";

export interface AuthenticatedUser {
  id: number;
  email: string;
  rol: string;
}

export interface AuthRequest extends Request {
  usuario?: AuthenticatedUser;
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Token de autenticación no proporcionado", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthenticatedUser;
    req.usuario = decoded;
    next();
  } catch (error) {
    throw new AppError("Token de autenticación inválido o expirado", 401);
  }
}

export function requireRole(...rolesPermitidos: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.usuario) {
      throw new AppError("Usuario no autenticado", 401);
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      throw new AppError("Acceso denegado: permisos insuficientes para esta operación", 403);
    }

    next();
  };
}
