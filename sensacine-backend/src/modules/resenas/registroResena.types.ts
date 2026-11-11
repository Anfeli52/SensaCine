import { EstadoReserva } from "@prisma/client";

export interface CrearResenaInput {
    idReserva: number;
    calificacionPelicula: number;
    calificacionExperiencia: number;
    comentario?: string | null;
}

export interface ReservaParaResena {
    id: number;
    estado: EstadoReserva;
    fecha: Date;
    horaFin: Date;
    pelicula: string;
}

export interface ResenaGuardada {
    id: number;
    idReserva: number;
    calificacionPelicula: number;
    calificacionExperiencia: number;
    comentario: string | null;
    fechaCreacion: Date;
}

export interface IRegistroResenaRepository {
    /** Reserva del usuario con lo necesario para validar que pueda reseñar; null si no existe o no es suya. */
    getReservaDelUsuario(idReserva: number, idUsuario: number): Promise<ReservaParaResena | null>;
    getResenaByReserva(idReserva: number): Promise<ResenaGuardada | null>;
    crear(data: CrearResenaInput): Promise<ResenaGuardada>;
}
