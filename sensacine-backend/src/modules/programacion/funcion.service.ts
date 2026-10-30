import { AppError } from "../../common/errors/AppError";
import { getCinemaDateStr, getCinemaTimeStr } from "../../common/helpers/dateUtils";
import { prisma } from "../../infrastructure/prisma/client";
import { AuditoriaActor, DbClient } from "../auditoria/auditoria.types";
import { AuditoriaService } from "../auditoria/auditoria.service";
import { IPeliculaRepository } from "../catalogo/pelicula.types";
import {
  CreateFuncionInput,
  FuncionConDetalles,
  FuncionFilterOptions,
  FuncionResponseDTO,
  IFuncionRepository,
  UpdateFuncionInput,
} from "./funcion.types";
import { ISalaRepository } from "./sala.types";

export class FuncionService {
  constructor(
    private readonly funcionRepo: IFuncionRepository,
    private readonly peliculaRepo: IPeliculaRepository,
    private readonly salaRepo: ISalaRepository,
    private readonly auditoriaService?: AuditoriaService
  ) {}

  public parseDate(val: string | Date): Date {
    if (val instanceof Date) {
      return new Date(Date.UTC(val.getUTCFullYear(), val.getUTCMonth(), val.getUTCDate()));
    }
    const [year, month, day] = val.split("T")[0].split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  public parseTime(val: string | Date): Date {
    if (val instanceof Date) {
      return new Date(
        Date.UTC(1970, 0, 1, val.getUTCHours(), val.getUTCMinutes(), val.getUTCSeconds() || 0)
      );
    }
    const parts = val.split(":");
    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);
    const seconds = parts[2] ? Number(parts[2]) : 0;
    return new Date(Date.UTC(1970, 0, 1, hours, minutes, seconds));
  }

  public formatTime(date: Date): string {
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  public formatDate(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  private toDTO(funcion: FuncionConDetalles): FuncionResponseDTO {
    return {
      id: funcion.id,
      idPelicula: funcion.idPelicula,
      idSala: funcion.idSala,
      fecha: this.formatDate(funcion.fecha),
      horaInicio: this.formatTime(funcion.horaInicio),
      horaFin: this.formatTime(funcion.horaFin),
      precioAsientoOficial: Number(funcion.precioAsientoOficial),
      estado: funcion.estado,
      pelicula: funcion.pelicula
        ? {
            id: funcion.pelicula.id,
            titulo: funcion.pelicula.titulo,
            duracionMinutos: funcion.pelicula.duracionMinutos,
            genero: funcion.pelicula.genero,
            clasificacion: funcion.pelicula.clasificacion,
            posterUrl: funcion.pelicula.posterUrl,
          }
        : undefined,
      sala: funcion.sala
        ? {
            id: funcion.sala.id,
            nombre: funcion.sala.nombre,
            capacidad: funcion.sala.capacidad,
            estado: funcion.sala.estado,
          }
        : undefined,
    };
  }

  async listar(filters?: FuncionFilterOptions): Promise<FuncionResponseDTO[]> {
    const funciones = await this.funcionRepo.findAll(filters);
    let dtos = funciones.map((f) => this.toDTO(f));

    if (filters?.soloFuturas) {
      const todayStr = getCinemaDateStr();
      const currentTimeStr = getCinemaTimeStr();

      dtos = dtos.filter((f) => {
        if (f.fecha > todayStr) return true;
        if (f.fecha === todayStr) {
          return f.horaFin >= currentTimeStr || f.horaInicio >= currentTimeStr;
        }
        return false;
      });
    }

    return dtos;
  }

  async obtenerPorId(id: number): Promise<FuncionResponseDTO> {
    const funcion = await this.funcionRepo.findById(id);
    if (!funcion) {
      throw new AppError("Función no encontrada", 404);
    }
    return this.toDTO(funcion);
  }

  async crear(input: CreateFuncionInput, actor?: AuditoriaActor): Promise<FuncionResponseDTO> {
    const pelicula = await this.peliculaRepo.findById(input.idPelicula);
    if (!pelicula) {
      throw new AppError("La película seleccionada no existe", 404);
    }

    const sala = await this.salaRepo.findById(input.idSala);
    if (!sala) {
      throw new AppError("La sala seleccionada no existe", 404);
    }

    if (sala.estado !== "activa") {
      throw new AppError(`La sala '${sala.nombre}' no está activa (${sala.estado})`, 400);
    }

    const fecha = this.parseDate(input.fecha);
    const horaInicio = this.parseTime(input.horaInicio);

    let horaFin: Date;
    if (input.horaFin) {
      horaFin = this.parseTime(input.horaFin);
    } else {
      horaFin = new Date(horaInicio.getTime() + pelicula.duracionMinutos * 60 * 1000);
    }

    if (horaFin.getTime() <= horaInicio.getTime()) {
      throw new AppError("La hora de finalización debe ser posterior a la hora de inicio", 400);
    }

    const conflictos = await this.funcionRepo.findConflicts(
      input.idSala,
      fecha,
      horaInicio,
      horaFin
    );

    if (conflictos.length > 0) {
      const c = conflictos[0];
      const conflictPelicula = c.pelicula?.titulo || "Otra película";
      const inicioConflict = this.formatTime(c.horaInicio);
      const finConflict = this.formatTime(c.horaFin);

      throw new AppError(
        `Conflicto de horario: La sala '${sala.nombre}' ya tiene programada la película "${conflictPelicula}" de ${inicioConflict} a ${finConflict} en la fecha ${this.formatDate(fecha)}.`,
        409
      );
    }

    const operacion = async (tx?: DbClient) => {
      const datosCreacion = {
        idPelicula: input.idPelicula,
        idSala: input.idSala,
        fecha,
        horaInicio,
        horaFin,
        precioAsientoOficial: input.precioAsientoOficial,
        estado: input.estado ?? "programada",
      };

      const nuevaFuncion = tx
        ? await this.funcionRepo.create(datosCreacion, tx)
        : await this.funcionRepo.create(datosCreacion);

      if (this.auditoriaService && actor) {
        await this.auditoriaService.registrar(
          {
            actor,
            accion: "CREAR",
            entidad: "Funcion",
            entidadId: nuevaFuncion.id,
            valorAnterior: null,
            valorNuevo: nuevaFuncion,
            metadata: {
              pelicula: pelicula.titulo,
              sala: sala.nombre,
              fecha: this.formatDate(fecha),
              horaInicio: this.formatTime(horaInicio),
            },
          },
          tx
        );
      }

      return this.toDTO(nuevaFuncion);
    };

    if (this.auditoriaService && actor) {
      return prisma.$transaction((tx) => operacion(tx));
    }
    return operacion();
  }

  async actualizar(
    id: number,
    input: UpdateFuncionInput,
    actor?: AuditoriaActor
  ): Promise<FuncionResponseDTO> {
    const existing = await this.funcionRepo.findById(id);
    if (!existing) {
      throw new AppError("Función no encontrada", 404);
    }

    const idPelicula = input.idPelicula ?? existing.idPelicula;
    const idSala = input.idSala ?? existing.idSala;

    const pelicula = await this.peliculaRepo.findById(idPelicula);
    if (!pelicula) {
      throw new AppError("La película seleccionada no existe", 404);
    }

    const sala = await this.salaRepo.findById(idSala);
    if (!sala) {
      throw new AppError("La sala seleccionada no existe", 404);
    }

    const fecha = input.fecha ? this.parseDate(input.fecha) : existing.fecha;
    const horaInicio = input.horaInicio ? this.parseTime(input.horaInicio) : existing.horaInicio;

    let horaFin: Date;
    if (input.horaFin) {
      horaFin = this.parseTime(input.horaFin);
    } else if (input.horaInicio || input.idPelicula) {
      horaFin = new Date(horaInicio.getTime() + pelicula.duracionMinutos * 60 * 1000);
    } else {
      horaFin = existing.horaFin;
    }

    if (horaFin.getTime() <= horaInicio.getTime()) {
      throw new AppError("La hora de finalización debe ser posterior a la hora de inicio", 400);
    }

    const conflictos = await this.funcionRepo.findConflicts(
      idSala,
      fecha,
      horaInicio,
      horaFin,
      id
    );

    if (conflictos.length > 0) {
      const c = conflictos[0];
      const conflictPelicula = c.pelicula?.titulo || "Otra película";
      const inicioConflict = this.formatTime(c.horaInicio);
      const finConflict = this.formatTime(c.horaFin);

      throw new AppError(
        `Conflicto de horario: La sala '${sala.nombre}' ya tiene programada la película "${conflictPelicula}" de ${inicioConflict} a ${finConflict}.`,
        409
      );
    }

    let accion = "EDITAR";
    if (input.estado && input.estado !== existing.estado) {
      accion = input.estado === "cancelada" ? "DESACTIVAR" : "ACTIVAR";
    }

    const operacion = async (tx?: DbClient) => {
      const datosActualizar = {
        idPelicula,
        idSala,
        fecha,
        horaInicio,
        horaFin,
        precioAsientoOficial: input.precioAsientoOficial,
        estado: input.estado,
      };

      const actualizada = tx
        ? await this.funcionRepo.update(id, datosActualizar, tx)
        : await this.funcionRepo.update(id, datosActualizar);

      if (this.auditoriaService && actor) {
        await this.auditoriaService.registrar(
          {
            actor,
            accion,
            entidad: "Funcion",
            entidadId: id,
            valorAnterior: existing,
            valorNuevo: actualizada,
          },
          tx
        );
      }

      return this.toDTO(actualizada);
    };

    if (this.auditoriaService && actor) {
      return prisma.$transaction((tx) => operacion(tx));
    }
    return operacion();
  }

  async eliminar(id: number, actor?: AuditoriaActor): Promise<{ mensaje: string; id: number }> {
    const existing = await this.funcionRepo.findById(id);
    if (!existing) {
      throw new AppError("Función no encontrada", 404);
    }

    const operacion = async (tx?: DbClient) => {
      try {
        if (tx) {
          await this.funcionRepo.delete(id, tx);
        } else {
          await this.funcionRepo.delete(id);
        }

        if (this.auditoriaService && actor) {
          await this.auditoriaService.registrar(
            {
              actor,
              accion: "ELIMINAR",
              entidad: "Funcion",
              entidadId: id,
              valorAnterior: existing,
              valorNuevo: null,
            },
            tx
          );
        }

        return { mensaje: "Función eliminada exitosamente", id };
      } catch (error: any) {
        if (error?.code === "P2003") {
          throw new AppError(
            "No se puede eliminar la función porque ya tiene reservas asociadas. Puedes cambiar su estado a 'cancelada'.",
            400
          );
        }
        throw error;
      }
    };

    if (this.auditoriaService && actor) {
      return prisma.$transaction((tx) => operacion(tx));
    }
    return operacion();
  }
}
