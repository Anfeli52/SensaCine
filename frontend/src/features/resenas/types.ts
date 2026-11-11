export const MAX_COMENTARIO_RESENA = 1000;

export interface ResenaInput {
    idReserva: number;
    calificacionPelicula: number;
    calificacionExperiencia: number;
    comentario?: string;
}

export interface Resena {
    id: number;
    calificacionPelicula: number;
    calificacionExperiencia: number;
    comentario: string | null;
    fechaCreacion: string;
}

export interface CrearResenaResponse {
    mensaje: string;
    resena: Resena & { idReserva: number };
}
