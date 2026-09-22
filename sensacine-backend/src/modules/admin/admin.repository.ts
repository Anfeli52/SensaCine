import { prisma } from "../../infrastructure/prisma/client";
import { Rol } from "@prisma/client";

export class AdminRepository {
  async obtenerUsuarios() {
    return prisma.usuario.findMany({
      orderBy: {
        fechaRegistro: "desc",
      },
    });
  }

  async actualizarRol(id: number, rol: Rol) {
    return prisma.usuario.update({where: {id}, data: {rol}});
  }

  async actualizarEstado(id: number, estado: string) {
    return prisma.usuario.update({where: {id}, data: {estado}});
  }
}