import { Rol } from "@prisma/client";
import { AdminRepository } from "./admin.repository";
import { UsuarioResponseDTO } from "./dtos/UsuarioResponseDTO";

export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

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

  async actualizarRol(id: number, rol: Rol): Promise<UsuarioResponseDTO> {
    const usuario = await this.adminRepository.actualizarRol(id, rol);

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      estado: usuario.estado,
      fechaRegistro: usuario.fechaRegistro,
    };
  }

  async actualizarEstado(id: number, estado: string): Promise<UsuarioResponseDTO> {
    const usuario = await this.adminRepository.actualizarEstado(id, estado);

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      estado: usuario.estado,
      fechaRegistro: usuario.fechaRegistro,
    };
  }
}