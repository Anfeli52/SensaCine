import { EstadoOrdenCocina, OrdenCocina } from "@prisma/client";
import { prisma } from "../../infrastructure/prisma/client";
import { getCinemaTodayUtcMidnight } from "../../common/helpers/dateUtils";
import { FuncionCocina, ICocinaRepository, ReservaCocina } from "./cocina.types";

export class CocinaRepository implements ICocinaRepository {
  // 1. Obtener funciones programadas a futuro ordenadas cronológicamente
  async getFuncionesFuturas(): Promise<FuncionCocina[]> {
    return prisma.funcion.findMany({
      where: {
        estado: "programada",
        sala: { estado: "activa" },
        fecha: { gte: getCinemaTodayUtcMidnight() },
      },
      include: {
        pelicula: {
          include: {
            productos: {
              where: {
                estado: "activo",
              },
              orderBy: {
                ordenMenu: "asc",
              },
            },
          },
        },
        sala: true,
      },
      orderBy: [
        { fecha: "asc" },
        { horaInicio: "asc" },
      ],
    });
  }

  // 2. Obtener reservas asociadas a una función
  async getReservasPorFuncion(idFuncion: number): Promise<ReservaCocina[]> {
    const reservas = await prisma.reserva.findMany({
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
            restricciones: {
              include: {
                restriccion: true,
                producto: true,
              },
            },
            ordenesCocina: {
              orderBy: {
                id: "desc",
              },
            },
          },
        },
      },
    });

    await this.asegurarOrdenesParaReservas(reservas);
    return reservas;
  }

  // 3. Obtener reservas asociadas a un conjunto de funciones
  async getReservasPorFunciones(idsFunciones: number[]): Promise<ReservaCocina[]> {
    const reservas = await prisma.reserva.findMany({
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
            restricciones: {
              include: {
                restriccion: true,
                producto: true,
              },
            },
            ordenesCocina: {
              orderBy: {
                id: "desc",
              },
            },
          },
        },
      },
    });

    await this.asegurarOrdenesParaReservas(reservas);
    return reservas;
  }

  // Garantiza que cada asiento de reserva tenga al menos una orden de cocina registrada
  private async asegurarOrdenesParaReservas(reservas: ReservaCocina[]): Promise<void> {
    for (const reserva of reservas) {
      for (const asiento of reserva.asientos) {
        if (!asiento.ordenesCocina || asiento.ordenesCocina.length === 0) {
          const nuevaOrden = await prisma.ordenCocina.create({
            data: {
              idReservaAsiento: asiento.id,
              estado: EstadoOrdenCocina.Pendiente,
            },
          });
          asiento.ordenesCocina = [nuevaOrden];
        }
      }
    }
  }

  // 4. Actualizar el estado de una orden de cocina
  async actualizarEstadoOrden(id: number, nuevoEstado: EstadoOrdenCocina): Promise<OrdenCocina | null> {
    // Buscar por ID de orden
    const orden = await prisma.ordenCocina.findUnique({
      where: { id },
    });

    if (orden) {
      return prisma.ordenCocina.update({
        where: { id },
        data: { estado: nuevoEstado },
      });
    }

    // Si no se encuentra por ID de orden, buscar si es idReservaAsiento
    const ordenPorAsiento = await prisma.ordenCocina.findFirst({
      where: { idReservaAsiento: id },
      orderBy: { id: "desc" },
    });

    if (ordenPorAsiento) {
      return prisma.ordenCocina.update({
        where: { id: ordenPorAsiento.id },
        data: { estado: nuevoEstado },
      });
    }

    // Si no existe pero el asiento existe, crearla directamente
    const reservaAsiento = await prisma.reservaAsiento.findUnique({
      where: { id },
    });

    if (reservaAsiento) {
      return prisma.ordenCocina.create({
        data: {
          idReservaAsiento: reservaAsiento.id,
          estado: nuevoEstado,
        },
      });
    }

    return null;
  }

  // 5. Obtener orden por ID
  async obtenerOrdenPorId(id: number): Promise<OrdenCocina | null> {
    const orden = await prisma.ordenCocina.findUnique({
      where: { id },
    });

    if (orden) {
      return orden;
    }

    return prisma.ordenCocina.findFirst({
      where: { idReservaAsiento: id },
      orderBy: { id: "desc" },
    });
  }
}
