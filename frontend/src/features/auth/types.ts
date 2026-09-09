export type Rol = "cliente" | "admin" | "cocina";

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  nombre: string;
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  token: string;
  usuario: Usuario;
}
