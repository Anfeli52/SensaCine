import { prisma } from "../../infrastructure/prisma/client";
import { getCinemaTodayUtcMidnight } from "../../common/helpers/dateUtils";
import { ICocinaRepository } from "./cocina.types";

export class CocinaRepository implements ICocinaRepository {
  // 1. Obtener funciones programadas a futuro ordenadas cronológicamente
  async getFuncionesFuturas() {
    return prisma.funcion.findMany({
      where: {
        estado: "programada",
        sala: { estado: "activa" },
        fecha: { gte: getCinemaTodayUtcMidnight() },
      },
      include: {
        pelicula: true,
        sala: true,
      },
      orderBy: [
        { fecha: "asc" },
        { horaInicio: "asc" },
      ],
    });
  }

  // 2. Obtener reservas asociadas a una función
  async getReservasPorFuncion(idFuncion: number) {
    return prisma.reserva.findMany({
      where: {
        idFuncion,
        estado: { not: "Cancelado" },
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        asientos: {
          include: {
            asiento: true,
          },
        },
      },
    });
  }

  // 3. Obtener reservas asociadas a un conjunto de funciones
  async getReservasPorFunciones(idsFunciones: number[]) {
    return prisma.reserva.findMany({
      where: {
        idFuncion: { in: idsFunciones },
        estado: { not: "Cancelado" },
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        asientos: {
          include: {
            asiento: true,
          },
        },
      },
    });
  }
}
