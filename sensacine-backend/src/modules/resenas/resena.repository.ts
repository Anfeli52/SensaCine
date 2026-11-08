import { prisma } from "../../infrastructure/prisma/client";
import { IResenasRepository } from "./resena.types";

export class PrismaResenasRepository implements IResenasRepository {
    findPeliculaById(id: number) {
        return prisma.pelicula.findUnique({
            where: { id },
        });
    }

    findByPeliculaId(idPelicula: number) {
        return prisma.resena.findMany({
            where: {
                reserva: {
                    funcion: {
                        idPelicula,
                    },
                },
            },
            include: {
                reserva: {
                    include: {
                        usuario: {
                            select: { nombre: true },
                        },
                    },
                },
            },
            orderBy: {
                fechaCreacion: "desc",
            },
        });
    }
}
