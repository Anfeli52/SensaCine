export interface Resena {
  id: number;
  usuario: string;
  calificacionPelicula: number;
  calificacionExperiencia: number;
  comentario: string | null;
  fechaCreacion: string;
}

export interface ResenasPorPelicula {
  pelicula: { id: number; titulo: string; };
  resumen: { totalResenas: number; promedioPelicula: number | null; promedioExperiencia: number | null; };
  resenas: Resena[];
}