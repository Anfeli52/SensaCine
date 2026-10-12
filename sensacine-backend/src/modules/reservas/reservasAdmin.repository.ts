import { Prisma } from "@prisma/client";
import { prisma } from "../../infrastructure/prisma/client";

const reservasAdminInclude = {
    usuario: {
        select: {
            id: true,
            nombre: true,
            email: true,
        },
    },
    funcion: {
        include: {
            pelicula: {
                select: {
                    id: true,
                    titulo: true,
                    posterUrl: true,
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
        },
    },
} satisfies Prisma.ReservaInclude;

export class ReservasAdminRepository {
    async getAll() {
        return prisma.reserva.findMany({
            include: reservasAdminInclude,
            orderBy: {
                fechaReserva: "desc",
            },
        });
    }

    async getById(idReserva: number) {
        return prisma.reserva.findUnique({
            where: {
                id: idReserva,
            },
            include: reservasAdminInclude,
        });
    }
}