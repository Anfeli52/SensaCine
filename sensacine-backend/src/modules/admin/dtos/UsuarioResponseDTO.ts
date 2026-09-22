import { Rol } from "@prisma/client";

export interface UsuarioResponseDTO {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  estado: string;
  fechaRegistro: Date;
}