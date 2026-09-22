export type Rol = "cliente" | "admin" | "cocina";

export type EstadoUsuario = "activo" | "inactivo";

export interface UsuarioAdmin {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  estado: EstadoUsuario;
  fechaRegistro: string;
}