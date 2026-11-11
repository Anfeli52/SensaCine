import { Pelicula, Prisma } from "@prisma/client";

export type ResenaUsuario = Prisma.ResenaGetPayload<{
    include: {
        reserva: {
            include: {
                usuario: { select: { nombre: true } }
            }
        }
    }
}>

export interface IResenasRepository {
    findPeliculaById(id: number): Promise<Pelicula | null>;
    findByPeliculaId(idPelicula: number): Promise<ResenaUsuario[]>;
}
