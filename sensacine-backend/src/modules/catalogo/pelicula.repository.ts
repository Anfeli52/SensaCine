import { prisma } from "../../infrastructure/prisma/client";
import { CreatePeliculaInput, IPeliculaRepository, UpdatePeliculaInput } from "./pelicula.types";

export class PrismaPeliculaRepository implements IPeliculaRepository {
  findAll(options?: { estado?: string }) {
    const where = options?.estado ? { estado: options.estado } : {};
    return prisma.pelicula.findMany({
      where,
      orderBy: { id: "asc" },
    });
  }

  findById(id: number) {
    return prisma.pelicula.findUnique({
      where: { id },
    });
  }

  create(data: CreatePeliculaInput) {
    return prisma.pelicula.create({
      data,
    });
  }

  update(id: number, data: UpdatePeliculaInput) {
    return prisma.pelicula.update({
      where: { id },
      data,
    });
  }

  delete(id: number) {
    return prisma.pelicula.delete({
      where: { id },
    });
  }
}
