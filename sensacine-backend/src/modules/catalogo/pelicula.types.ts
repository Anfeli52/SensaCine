import { Pelicula, Prisma } from "@prisma/client";

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
  findById(id: number): Promise<Pelicula | null>;
  create(data: CreatePeliculaInput): Promise<Pelicula>;
  update(id: number, data: UpdatePeliculaInput): Promise<Pelicula>;
  delete(id: number): Promise<Pelicula>;
}
