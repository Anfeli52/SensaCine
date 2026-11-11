import { prisma } from "../../infrastructure/prisma/client";
import { CrearResenaInput, IRegistroResenaRepository, ReservaParaResena, ResenaGuardada } from "./registroResena.types";

const resenaSelect = {
    id: true,
    idReserva: true,
    calificacionPelicula: true,
    calificacionExperiencia: true,
    comentario: true,
    fechaCreacion: true,
} as const;

export class PrismaRegistroResenaRepository implements IRegistroResenaRepository {
    async getReservaDelUsuario(idReserva: number, idUsuario: number): Promise<ReservaParaResena | null> {
        const reserva = await prisma.reserva.findFirst({
            where: { id: idReserva, idUsuario },
            select: {
                id: true,
                estado: true,
                funcion: { select: { fecha: true, horaFin: true, pelicula: { select: { titulo: true } } } },
            },
        });
        if (!reserva) return null;
        return {
            id: reserva.id,
            estado: reserva.estado,
            fecha: reserva.funcion.fecha,
            horaFin: reserva.funcion.horaFin,
            pelicula: reserva.funcion.pelicula.titulo,
        };
    }

    getResenaByReserva(idReserva: number): Promise<ResenaGuardada | null> {
        return prisma.resena.findFirst({ where: { idReserva }, select: resenaSelect });
    }

    crear(data: CrearResenaInput): Promise<ResenaGuardada> {
        return prisma.resena.create({
            data: {
                idReserva: data.idReserva,
                calificacionPelicula: data.calificacionPelicula,
                calificacionExperiencia: data.calificacionExperiencia,
                comentario: data.comentario ?? null,
            },
            select: resenaSelect,
        });
    }
}
