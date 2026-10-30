import { Rol } from "@prisma/client";
import { AppError } from "../../common/errors/AppError";
import { prisma } from "../../infrastructure/prisma/client";
import { AuditoriaActor, DbClient } from "../auditoria/auditoria.types";
import { AuditoriaService } from "../auditoria/auditoria.service";
import { IAdminRepository } from "./admin.repository";
import { UsuarioResponseDTO } from "./dtos/UsuarioResponseDTO";

export class AdminService {
  constructor(
    private readonly adminRepository: IAdminRepository,
    private readonly auditoriaService?: AuditoriaService
  ) {}

  async obtenerUsuarios(): Promise<UsuarioResponseDTO[]> {
    const usuarios = await this.adminRepository.obtenerUsuarios();

    return usuarios.map((usuario) => ({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      estado: usuario.estado,
      fechaRegistro: usuario.fechaRegistro,
    }));
  }

  async actualizarRol(id: number, rol: Rol, actor?: AuditoriaActor): Promise<UsuarioResponseDTO> {
    const existing = this.adminRepository.obtenerPorId
      ? await this.adminRepository.obtenerPorId(id)
      : null;

    if (this.adminRepository.obtenerPorId && !existing) {
      throw new AppError("Usuario no encontrado", 404);
    }

    const operacion = async (tx?: DbClient) => {
      const usuario = tx
        ? await this.adminRepository.actualizarRol(id, rol, tx)
        : await this.adminRepository.actualizarRol(id, rol);

      if (this.auditoriaService && actor) {
        await this.auditoriaService.registrar(
          {
            actor,
            accion: "EDITAR_ROL",
            entidad: "Usuario",
            entidadId: id,
            valorAnterior: existing ? { rol: existing.rol } : null,
            valorNuevo: { rol: usuario.rol },
            metadata: {
              usuarioObjetivoEmail: usuario.email,
              usuarioObjetivoNombre: usuario.nombre,
            },
          },
          tx
        );
      }

      return {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        estado: usuario.estado,
        fechaRegistro: usuario.fechaRegistro,
      };
    };

    if (this.auditoriaService && actor) {
      return prisma.$transaction((tx) => operacion(tx));
    }
    return operacion();
  }

  async actualizarEstado(
    id: number,
    estado: string,
    actor?: AuditoriaActor
  ): Promise<UsuarioResponseDTO> {
    const existing = this.adminRepository.obtenerPorId
      ? await this.adminRepository.obtenerPorId(id)
      : null;

    if (this.adminRepository.obtenerPorId && !existing) {
      throw new AppError("Usuario no encontrado", 404);
    }

    const accion =
      estado.toLowerCase() === "inactivo" || estado.toLowerCase() === "desactivado"
        ? "DESACTIVAR"
        : "ACTIVAR";

    const operacion = async (tx?: DbClient) => {
      const usuario = tx
        ? await this.adminRepository.actualizarEstado(id, estado, tx)
        : await this.adminRepository.actualizarEstado(id, estado);

      if (this.auditoriaService && actor) {
        await this.auditoriaService.registrar(
          {
            actor,
            accion,
            entidad: "Usuario",
            entidadId: id,
            valorAnterior: existing ? { estado: existing.estado } : null,
            valorNuevo: { estado: usuario.estado },
            metadata: {
              usuarioObjetivoEmail: usuario.email,
              usuarioObjetivoNombre: usuario.nombre,
            },
          },
          tx
        );
      }

      return {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        estado: usuario.estado,
        fechaRegistro: usuario.fechaRegistro,
      };
    };

    if (this.auditoriaService && actor) {
      return prisma.$transaction((tx) => operacion(tx));
    }
    return operacion();
  }
}
