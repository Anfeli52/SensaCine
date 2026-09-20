import { prisma } from "../../infrastructure/prisma/client";
import { FuncionConDetalles, FuncionFilterOptions, IFuncionRepository } from "./funcion.types";
import { Prisma } from "@prisma/client";

export class PrismaFuncionRepository implements IFuncionRepository {
  findAll(filters?: FuncionFilterOptions): Promise<FuncionConDetalles[]> {
    const where: Prisma.FuncionWhereInput = {};

    if (filters?.idSala) {
      where.idSala = filters.idSala;
    }

    if (filters?.idPelicula) {
      where.idPelicula = filters.idPelicula;
    }

    if (filters?.estado) {
      where.estado = filters.estado;
    } else if (filters?.soloFuturas) {
      where.estado = "programada";
    }

    if (filters?.soloFuturas) {
      where.sala = { estado: "activa" };
    }

    if (filters?.fecha) {
      where.fecha = new Date(filters.fecha);
    } else if (filters?.desdeFecha || filters?.hastaFecha) {
      where.fecha = {
        gte: filters?.desdeFecha ? new Date(filters.desdeFecha) : undefined,
        lte: filters?.hastaFecha ? new Date(filters.hastaFecha) : undefined,
      };
    } else if (filters?.soloFuturas) {
      const now = new Date();
      const todayMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      where.fecha = {
        gte: todayMidnight,
      };
    }


    return prisma.funcion.findMany({
      where,
      include: {
        pelicula: true,
        sala: true,
      },
      orderBy: [{ fecha: "asc" }, { horaInicio: "asc" }],
    });
  }

  findById(id: number): Promise<FuncionConDetalles | null> {
    return prisma.funcion.findUnique({
      where: { id },
      include: {
        pelicula: true,
        sala: true,
      },
    });
  }

  findConflicts(
    idSala: number,
    fecha: Date,
    horaInicio: Date,
    horaFin: Date,
    excludeId?: number
  ): Promise<FuncionConDetalles[]> {
    return prisma.funcion.findMany({
      where: {
        idSala,
        fecha,
        estado: { not: "cancelada" },
        id: excludeId ? { not: excludeId } : undefined,
        // Overlap: horaInicio < funcion.horaFin AND horaFin > funcion.horaInicio
        horaInicio: { lt: horaFin },
        horaFin: { gt: horaInicio },
      },
      include: {
        pelicula: true,
        sala: true,
      },
    });
  }

  create(data: {
    idPelicula: number;
    idSala: number;
    fecha: Date;
    horaInicio: Date;
    horaFin: Date;
    precioAsientoOficial: number | Prisma.Decimal;
    estado?: string;
  }): Promise<FuncionConDetalles> {
    return prisma.funcion.create({
      data,
      include: {
        pelicula: true,
        sala: true,
      },
    });
  }

  update(
    id: number,
    data: {
      idPelicula?: number;
      idSala?: number;
      fecha?: Date;
      horaInicio?: Date;
      horaFin?: Date;
      precioAsientoOficial?: number | Prisma.Decimal;
      estado?: string;
    }
  ): Promise<FuncionConDetalles> {
    return prisma.funcion.update({
      where: { id },
      data,
      include: {
        pelicula: true,
        sala: true,
      },
    });
  }

  delete(id: number) {
    return prisma.funcion.delete({
      where: { id },
    });
  }
}
