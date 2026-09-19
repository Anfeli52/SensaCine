import { AppError } from "../../common/errors/AppError";
import { IPeliculaRepository } from "../catalogo/pelicula.types";
import { ISalaRepository } from "./sala.types";
import {
  CreateFuncionInput,
  FuncionConDetalles,
  FuncionFilterOptions,
  FuncionResponseDTO,
  IFuncionRepository,
  UpdateFuncionInput,
} from "./funcion.types";

export class FuncionService {
  constructor(
    private readonly funcionRepo: IFuncionRepository,
    private readonly peliculaRepo: IPeliculaRepository,
    private readonly salaRepo: ISalaRepository
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
      const now = new Date();
      const todayStr = this.formatDate(now);
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTimeStr = `${String(currentHours).padStart(2, "0")}:${String(currentMinutes).padStart(2, "0")}`;

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

  async crear(input: CreateFuncionInput): Promise<FuncionResponseDTO> {
    // 1. Validar existencia de Película
    const pelicula = await this.peliculaRepo.findById(input.idPelicula);
    if (!pelicula) {
      throw new AppError("La película seleccionada no existe", 404);
    }

    // 2. Validar existencia de Sala
    const sala = await this.salaRepo.findById(input.idSala);
    if (!sala) {
      throw new AppError("La sala seleccionada no existe", 404);
    }

    if (sala.estado !== "activa") {
      throw new AppError(`La sala '${sala.nombre}' no está activa (${sala.estado})`, 400);
    }

    // 3. Normalizar Fechas y Horas
    const fecha = this.parseDate(input.fecha);
    const horaInicio = this.parseTime(input.horaInicio);

    let horaFin: Date;
    if (input.horaFin) {
      horaFin = this.parseTime(input.horaFin);
    } else {
      // Calcular automáticamente: horaInicio + duracionMinutos
      horaFin = new Date(horaInicio.getTime() + pelicula.duracionMinutos * 60 * 1000);
    }

    if (horaFin.getTime() <= horaInicio.getTime()) {
      throw new AppError("La hora de finalización debe ser posterior a la hora de inicio", 400);
    }

    // 4. Verificar Solapamientos (Schedule Conflicts)
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

    // 5. Crear la función
    const nuevaFuncion = await this.funcionRepo.create({
      idPelicula: input.idPelicula,
      idSala: input.idSala,
      fecha,
      horaInicio,
      horaFin,
      precioAsientoOficial: input.precioAsientoOficial,
      estado: input.estado ?? "programada",
    });

    return this.toDTO(nuevaFuncion);
  }

  async actualizar(id: number, input: UpdateFuncionInput): Promise<FuncionResponseDTO> {
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

    // Verificar Solapamientos excluyendo esta función
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

    const actualizada = await this.funcionRepo.update(id, {
      idPelicula,
      idSala,
      fecha,
      horaInicio,
      horaFin,
      precioAsientoOficial: input.precioAsientoOficial,
      estado: input.estado,
    });

    return this.toDTO(actualizada);
  }

  async eliminar(id: number): Promise<{ mensaje: string; id: number }> {
    const existing = await this.funcionRepo.findById(id);
    if (!existing) {
      throw new AppError("Función no encontrada", 404);
    }

    try {
      await this.funcionRepo.delete(id);
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
  }
}
