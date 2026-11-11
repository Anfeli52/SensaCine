// ---- Consulta de reseñas por película (HU-21) ----
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

// ---- Calificación de película y registro de reseña de función asistida (HU-19 / HU-20) ----
export const MAX_COMENTARIO_RESENA = 1000;

export interface ResenaInput {
    idReserva: number;
    calificacionPelicula: number;
    calificacionExperiencia: number;
    comentario?: string;
}

// La reseña propia no lleva el nombre del usuario (a diferencia de `Resena`)
export interface MiResena {
    id: number;
    calificacionPelicula: number;
    calificacionExperiencia: number;
    comentario: string | null;
    fechaCreacion: string;
}

export interface CrearResenaResponse {
    mensaje: string;
    resena: MiResena & { idReserva: number };
}
