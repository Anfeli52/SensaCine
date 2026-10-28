import { EstadoOrdenCocina } from "@prisma/client";
import { AppError } from "../../common/errors/AppError";
import { ICocinaRepository, ListadoCocinaResponse } from "./cocina.types";

export class CocinaService {
  constructor(private readonly cocinaRepo: ICocinaRepository) {}

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

  async actualizarEstadoOrden(idOrden: number, estado: EstadoOrdenCocina) {
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

    const ordenActualizada = await this.cocinaRepo.actualizarEstadoOrden(idOrden, estado);

    if (!ordenActualizada) {
      throw new AppError("Orden de cocina no encontrada", 404);
    }

    return {
      mensaje: "Estado de la orden actualizado exitosamente",
      orden: ordenActualizada,
    };
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
