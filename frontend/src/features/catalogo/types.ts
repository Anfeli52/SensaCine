export interface Pelicula {
  id: number;
  titulo: string;
  sinopsis: string | null;
  duracionMinutos: number;
  genero: string | null;
  clasificacion: string | null;
  posterUrl: string | null;
  estado: string;
  precioBaseExperiencia: number;
}
