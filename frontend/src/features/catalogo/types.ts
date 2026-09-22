export type PeliculaEstado = "activa" | "inactiva" | "proximamente";

export interface Pelicula {
  id: number;
  titulo: string;
  sinopsis: string | null;
  duracionMinutos: number;
  genero: string | null;
  clasificacion: string | null;
  posterUrl: string | null;
  estado: PeliculaEstado;
  precioBaseExperiencia: number;
}

export interface CreatePeliculaInput {
  titulo: string;
  sinopsis?: string | null;
  duracionMinutos: number;
  genero?: string | null;
  clasificacion?: string | null;
  posterUrl?: string | null;
  estado?: PeliculaEstado;
  precioBaseExperiencia: number;
}

export interface UpdatePeliculaInput {
  titulo?: string;
  sinopsis?: string | null;
  duracionMinutos?: number;
  genero?: string | null;
  clasificacion?: string | null;
  posterUrl?: string | null;
  estado?: PeliculaEstado;
  precioBaseExperiencia?: number;
}

