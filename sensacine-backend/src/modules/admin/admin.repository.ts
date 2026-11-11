import { prisma } from "../../infrastructure/prisma/client";
import { Rol, Usuario } from "@prisma/client";
import { DbClient } from "../auditoria/auditoria.types";

export interface IAdminRepository {
  obtenerUsuarios(): Promise<Usuario[]>;
  obtenerPorId?(id: number, tx?: DbClient): Promise<Usuario | null>;
  actualizarRol(id: number, rol: Rol, tx?: DbClient): Promise<Usuario>;
  actualizarEstado(id: number, estado: string, tx?: DbClient): Promise<Usuario>;
}

export class AdminRepository implements IAdminRepository {
  async obtenerUsuarios() {
    return prisma.usuario.findMany({
      orderBy: {
        fechaRegistro: "desc",
      },
    });
  }

  async obtenerPorId(id: number, tx?: DbClient) {
    const client = tx ?? prisma;
    return client.usuario.findUnique({
      where: { id },
    });
  }

  async actualizarRol(id: number, rol: Rol, tx?: DbClient) {
    const client = tx ?? prisma;
    return client.usuario.update({
      where: { id },
      data: { rol },
    });
  }

  async actualizarEstado(id: number, estado: string, tx?: DbClient) {
    const client = tx ?? prisma;
    return client.usuario.update({
      where: { id },
      data: { estado },
    });
  }
}
