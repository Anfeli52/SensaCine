import { prisma } from "../../infrastructure/prisma/client";
import { DbClient } from "../auditoria/auditoria.types";
import { CreatePeliculaInput, IPeliculaRepository, UpdatePeliculaInput } from "./pelicula.types";

export class PrismaPeliculaRepository implements IPeliculaRepository {
  findAll(options?: { estado?: string }) {
    const where = options?.estado ? { estado: options.estado } : {};
    return prisma.pelicula.findMany({
      where,
      orderBy: { id: "asc" },
    });
  }

  findById(id: number, tx?: DbClient) {
    const client = tx ?? prisma;
    return client.pelicula.findUnique({
      where: { id },
    });
  }

  create(data: CreatePeliculaInput, tx?: DbClient) {
    const client = tx ?? prisma;
    return client.pelicula.create({
      data,
    });
  }

  update(id: number, data: UpdatePeliculaInput, tx?: DbClient) {
    const client = tx ?? prisma;
    return client.pelicula.update({
      where: { id },
      data,
    });
  }

  delete(id: number, tx?: DbClient) {
    const client = tx ?? prisma;
    return client.pelicula.delete({
      where: { id },
    });
  }
}
