import { Pelicula, Prisma } from "@prisma/client";
import { DbClient } from "../auditoria/auditoria.types";

export interface CreatePeliculaInput {
  titulo: string;
  sinopsis?: string | null;
  duracionMinutos: number;
  genero?: string | null;
  clasificacion?: string | null;
  posterUrl?: string | null;
  estado?: string;
  precioBaseExperiencia: number | Prisma.Decimal;
}

export interface UpdatePeliculaInput {
  titulo?: string;
  sinopsis?: string | null;
  duracionMinutos?: number;
  genero?: string | null;
  clasificacion?: string | null;
  posterUrl?: string | null;
  estado?: string;
  precioBaseExperiencia?: number | Prisma.Decimal;
}

export interface IPeliculaRepository {
  findAll(options?: { estado?: string }): Promise<Pelicula[]>;
  findById(id: number, tx?: DbClient): Promise<Pelicula | null>;
  create(data: CreatePeliculaInput, tx?: DbClient): Promise<Pelicula>;
  update(id: number, data: UpdatePeliculaInput, tx?: DbClient): Promise<Pelicula>;
  delete(id: number, tx?: DbClient): Promise<Pelicula>;
}
