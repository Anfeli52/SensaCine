import { prisma } from "../../infrastructure/prisma/client";
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

  findById(id: number) {
    return prisma.sala.findUnique({
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

  create(data: { nombre: string; capacidad: number; estado?: string }) {
    return prisma.sala.create({
      data,
    });
  }

  async createAsientos(asientos: { idSala: number; fila: string; numero: number }[]) {
    await prisma.asiento.createMany({
      data: asientos,
      skipDuplicates: true,
    });
  }

  update(id: number, data: UpdateSalaInput) {
    return prisma.sala.update({
      where: { id },
      data,
    });
  }

  async deleteAsientosBySala(idSala: number) {
    await prisma.asiento.deleteMany({
      where: { idSala },
    });
  }

  delete(id: number) {
    return prisma.sala.delete({
      where: { id },
    });
  }
}
