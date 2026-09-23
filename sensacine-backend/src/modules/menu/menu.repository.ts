import { prisma } from "../../infrastructure/prisma/client";
import { CreateProductoDTO } from "./dtos/CreateProductoDTO";
import { UpdateProductoDTO } from "./dtos/UpdateProductoDTO";

export class MenuRepository {
    async peliculaExiste(idPelicula: number): Promise<boolean> {
        const pelicula = await prisma.pelicula.findUnique({
            where: { id: idPelicula },
            select: { id: true }
        });

        return !!pelicula;
    }

    async obtenerProductosPorPelicula(idPelicula: number) {
        return prisma.producto.findMany({
            where: { idPelicula, estado: "activo" },
            orderBy: { ordenMenu: "asc" }
        });
    }

    async obtenerTodosLosProductos() {
        return prisma.producto.findMany({
            orderBy: [
                { idPelicula: "asc" },
                { ordenMenu: "asc" }
            ],
        });
    }

    async obtenerProductoPorId(id: number) {
        return prisma.producto.findUnique({
            where: { id }
        });
    }

    async crearProducto(data: CreateProductoDTO) {
        return prisma.producto.create({
            data
        });
    }

    async actualizarProducto(id: number, data: UpdateProductoDTO) {
        return prisma.producto.update({
            where: { id },
            data
        });
    }

    async eliminarProducto(id: number) {
        return prisma.producto.delete({
            where: { id }
        });
    }

    async ordenMenuExiste(idPelicula: number,ordenMenu: number,idProductoExcluir?: number): Promise<boolean> {
        const producto = await prisma.producto.findFirst({
            where: {
                idPelicula,
                ordenMenu,
                ...(idProductoExcluir !== undefined && {
                    id: {not: idProductoExcluir}
                }),
            },
            select: {id: true},
        });

        return !!producto;
    }
}