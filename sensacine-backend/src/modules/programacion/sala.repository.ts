import { prisma } from "../../infrastructure/prisma/client";
import { DbClient } from "../auditoria/auditoria.types";
import { ISalaRepository, UpdateSalaInput } from "./sala.types";

export class PrismaSalaRepository implements ISalaRepository {
  findAll() {
    return prisma.sala.findMany({
      include: {
        _count: {
          select: {
            funciones: true,
            asientos: true,
          },
        },
      },
      orderBy: { id: "asc" },
    });
  }

  findById(id: number, tx?: DbClient) {
    const client = tx ?? prisma;
    return client.sala.findUnique({
      where: { id },
      include: {
        asientos: {
          orderBy: [{ fila: "asc" }, { numero: "asc" }],
        },
        _count: {
          select: {
            funciones: true,
            asientos: true,
          },
        },
      },
    });
  }

  create(data: { nombre: string; capacidad: number; estado?: string }, tx?: DbClient) {
    const client = tx ?? prisma;
    return client.sala.create({
      data,
    });
  }

  async createAsientos(
    asientos: { idSala: number; fila: string; numero: number }[],
    tx?: DbClient
  ) {
    const client = tx ?? prisma;
    await client.asiento.createMany({
      data: asientos,
      skipDuplicates: true,
    });
  }

  update(id: number, data: UpdateSalaInput, tx?: DbClient) {
    const client = tx ?? prisma;
    return client.sala.update({
      where: { id },
      data,
    });
  }

  async deleteAsientosBySala(idSala: number, tx?: DbClient) {
    const client = tx ?? prisma;
    await client.asiento.deleteMany({
      where: { idSala },
    });
  }

  delete(id: number, tx?: DbClient) {
    const client = tx ?? prisma;
    return client.sala.delete({
      where: { id },
    });
  }
}
