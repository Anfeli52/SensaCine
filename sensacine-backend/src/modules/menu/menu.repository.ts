import { prisma } from "../../infrastructure/prisma/client";

export class MenuRepository {
    async peliculaExiste(idPelicula: number): Promise<boolean> {
        const pelicula = await prisma.pelicula.findUnique({
            where: { id: idPelicula },
            select: { id: true },
        });
        return !!pelicula;
    }

    async obtenerProductosPorPelicula(idPelicula: number) {
        return prisma.producto.findMany({
            where: { idPelicula, estado: "activo" },
            orderBy: { ordenMenu: "asc" },
        });
    }
}