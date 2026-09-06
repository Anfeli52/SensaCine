import { Usuario } from "@prisma/client";

export interface CreateUsuarioInput {
  nombre: string;
  email: string;
  passwordHash: string;
}

// El service SOLO conoce esta interfaz, nunca a Prisma directamente.
// Si mañana cambian de tecnología (otro ORM, otra base de datos),
// solo se reescribe auth.repository.ts — el service no se entera.
export interface IUsuarioRepository {
  create(data: CreateUsuarioInput): Promise<Usuario>;
  findByEmail(email: string): Promise<Usuario | null>;
}
