import { EstadoReserva, Prisma } from "@prisma/client";
import { prisma } from "../../infrastructure/prisma/client";


const historialInclude = {
    funcion: {
        include: {
            pelicula: {
                select: {
                    id: true,
                    titulo: true,
                    posterUrl: true,
                    productos: {
                        where: {
                            estado: "activo",
                        },
                        select: {
                            id: true,
                            nombre: true,
                            descripcion: true,
                            categoria: true,
                            ordenMenu: true,
                            imagenUrl: true,
                        },
                        orderBy: [
                            { ordenMenu: "asc" },
                            { nombre: "asc" },
                        ],
                    },
                },
            },
            sala: {
                select: {
                    id: true,
                    nombre: true,
                },
            },
        },
    },
    asientos: {
        include: {
            asiento: {
                select: {
                    id: true,
                    fila: true,
                    numero: true,
                },
            },
            restricciones: {
                include: {
                    restriccion: {
                        select: {
                            id: true,
                            nombre: true,
                            tipo: true,
                            descripcion: true,
                        },
                    },
                    producto: {
                        select: {
                            id: true,
                            nombre: true,
                        },
                    },
                },
            },
        },
    },
} satisfies Prisma.ReservaInclude;


export type ReservaHistorial = Prisma.ReservaGetPayload<{ include: typeof historialInclude; }>;

export class HistorialReservaRepository {
    async getHistorialByUsuario(idUsuario: number) {
        const ahora = new Date();

        const inicioHoy = new Date(
            ahora.getFullYear(),
            ahora.getMonth(),
            ahora.getDate()
        );

        const horaActual = new Date(ahora);
        horaActual.setFullYear(1970, 0, 1);

        return prisma.reserva.findMany({
            where: {
                idUsuario,
                estado: { not: EstadoReserva.Cancelado },
                funcion: {
                    OR: [
                        { fecha: { lt: inicioHoy } },
                        {
                            fecha: inicioHoy,
                            horaFin: { lt: horaActual },
                        },
                    ],
                },
            },
            include: historialInclude,
            orderBy: { fechaReserva: "desc" },
        });
    }

    async getReservaById(idReserva: number, idUsuario: number) {
        return prisma.reserva.findFirst({
            where: {
                id: idReserva,
                idUsuario,
                estado: { not: EstadoReserva.Cancelado, },
            },
            include: historialInclude,
        });
    }
}
