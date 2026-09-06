import { prisma } from "../../infrastructure/prisma/client";
import { CreateUsuarioInput, IUsuarioRepository } from "./auth.types";

// Única pieza de todo el módulo auth que sabe que existe Prisma/MySQL.
export class PrismaUsuarioRepository implements IUsuarioRepository {
  create(data: CreateUsuarioInput) {
    return prisma.usuario.create({ data });
  }

  findByEmail(email: string) {
    return prisma.usuario.findUnique({ where: { email } });
  }
}
