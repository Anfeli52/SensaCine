import { EstadoOrdenCocina } from "@prisma/client";
import { AppError } from "../../common/errors/AppError";
import { prisma } from "../../infrastructure/prisma/client";
import { AuditoriaActor, DbClient } from "../auditoria/auditoria.types";
import { AuditoriaService } from "../auditoria/auditoria.service";
import { ICocinaRepository, ListadoCocinaResponse } from "./cocina.types";

export class CocinaService {
  constructor(
    private readonly cocinaRepo: ICocinaRepository,
    private readonly auditoriaService?: AuditoriaService
  ) {}

  async listarFuncionesProgramadas(): Promise<ListadoCocinaResponse> {
    // 1. Encontrar las funciones programadas a futuro (ordenadas cronológicamente)
    const funciones = await this.cocinaRepo.getFuncionesFuturas();

    if (!funciones || funciones.length === 0) {
      return {
        mensaje: "No hay funciones disponibles",
        total: 0,
        funciones: [],
      };
    }

    // 2. Obtener las reservas asociadas a las funciones
    const idsFunciones = funciones.map((f) => f.id);
    const reservas = await this.cocinaRepo.getReservasPorFunciones(idsFunciones);

    // 3. Asociar a cada función sus reservas correspondientes
    const funcionesConReservas = funciones.map((funcion) => {
      const reservasDeFuncion = reservas.filter((r) => r.idFuncion === funcion.id);
      return {
        ...funcion,
        totalReservas: reservasDeFuncion.length,
        reservas: reservasDeFuncion,
      };
    });

    return {
      total: funcionesConReservas.length,
      funciones: funcionesConReservas,
    };
  }

  async obtenerFuncionConReservas(idFuncion: number) {
    const funciones = await this.cocinaRepo.getFuncionesFuturas();
    const funcion = funciones.find((f) => f.id === idFuncion);

    if (!funcion) {
      throw new AppError("Función no encontrada", 404);
    }

    const reservas = await this.cocinaRepo.getReservasPorFuncion(idFuncion);

    return {
      ...funcion,
      totalReservas: reservas.length,
      reservas,
    };
  }

  async actualizarEstadoOrden(
    idOrden: number,
    estado: EstadoOrdenCocina,
    actor?: AuditoriaActor
  ) {
    if (!Number.isInteger(idOrden) || idOrden <= 0) {
      throw new AppError("El identificador de la orden no es válido", 400);
    }

    const estadosValidos = [
      EstadoOrdenCocina.Pendiente,
      EstadoOrdenCocina.En_preparacion,
      EstadoOrdenCocina.Lista,
    ];

    if (!estadosValidos.includes(estado)) {
      throw new AppError(
        "Estado no válido. Los estados permitidos son: Pendiente, En preparación y Lista",
        400
      );
    }

    const ordenPrevia = this.cocinaRepo.obtenerOrdenConReserva
      ? await this.cocinaRepo.obtenerOrdenConReserva(idOrden)
      : null;

    const operacion = async (tx?: DbClient) => {
      const ordenActualizada = tx
        ? await this.cocinaRepo.actualizarEstadoOrden(idOrden, estado, tx)
        : await this.cocinaRepo.actualizarEstadoOrden(idOrden, estado);

      if (!ordenActualizada) {
        throw new AppError("Orden de cocina no encontrada", 404);
      }

      if (this.auditoriaService && actor) {
        await this.auditoriaService.registrar(
          {
            actor,
            accion: "CAMBIO_ESTADO",
            entidad: "OrdenCocina",
            entidadId: ordenActualizada.id,
            valorAnterior: { estado: ordenPrevia?.estado ?? EstadoOrdenCocina.Pendiente },
            valorNuevo: { estado: ordenActualizada.estado },
            metadata: {
              idPedido: ordenActualizada.id,
              idReserva: ordenPrevia?.reservaAsiento?.idReserva ?? null,
              idReservaAsiento: ordenActualizada.idReservaAsiento,
            },
          },
          tx
        );
      }

      return {
        mensaje: "Estado de la orden actualizado exitosamente",
        orden: ordenActualizada,
      };
    };

    if (this.auditoriaService && actor) {
      return prisma.$transaction((tx) => operacion(tx));
    }
    return operacion();
  }

  async obtenerOrdenPorId(idOrden: number) {
    if (!Number.isInteger(idOrden) || idOrden <= 0) {
      throw new AppError("El identificador de la orden no es válido", 400);
    }

    const orden = await this.cocinaRepo.obtenerOrdenPorId(idOrden);

    if (!orden) {
      throw new AppError("Orden de cocina no encontrada", 404);
    }

    return orden;
  }
}
