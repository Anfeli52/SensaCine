import { prisma } from "../../infrastructure/prisma/client";
import { DbClient } from "../auditoria/auditoria.types";
import { FuncionConDetalles, FuncionFilterOptions, IFuncionRepository } from "./funcion.types";
import { Prisma } from "@prisma/client";
import { getCinemaTodayUtcMidnight } from "../../common/helpers/dateUtils";

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
      where.fecha = {
        gte: getCinemaTodayUtcMidnight(),
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

  findById(id: number, tx?: DbClient): Promise<FuncionConDetalles | null> {
    const client = tx ?? prisma;
    return client.funcion.findUnique({
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
    excludeId?: number,
    tx?: DbClient
  ): Promise<FuncionConDetalles[]> {
    const client = tx ?? prisma;
    return client.funcion.findMany({
      where: {
        idSala,
        fecha,
        estado: { not: "cancelada" },
        id: excludeId ? { not: excludeId } : undefined,
        horaInicio: { lt: horaFin },
        horaFin: { gt: horaInicio },
      },
      include: {
        pelicula: true,
        sala: true,
      },
    });
  }

  create(
    data: {
      idPelicula: number;
      idSala: number;
      fecha: Date;
      horaInicio: Date;
      horaFin: Date;
      precioAsientoOficial: number | Prisma.Decimal;
      estado?: string;
    },
    tx?: DbClient
  ): Promise<FuncionConDetalles> {
    const client = tx ?? prisma;
    return client.funcion.create({
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
    },
    tx?: DbClient
  ): Promise<FuncionConDetalles> {
    const client = tx ?? prisma;
    return client.funcion.update({
      where: { id },
      data,
      include: {
        pelicula: true,
        sala: true,
      },
    });
  }

  delete(id: number, tx?: DbClient) {
    const client = tx ?? prisma;
    return client.funcion.delete({
      where: { id },
    });
  }
}
