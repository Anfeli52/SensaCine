import { Pelicula } from "@prisma/client";
import { AppError } from "../../common/errors/AppError";
import { prisma } from "../../infrastructure/prisma/client";
import { AuditoriaActor, DbClient } from "../auditoria/auditoria.types";
import { AuditoriaService } from "../auditoria/auditoria.service";
import { CreatePeliculaDTO } from "./dtos/CreatePeliculaDTO";
import { PeliculaResponseDTO } from "./dtos/PeliculaResponseDTO";
import { UpdatePeliculaDTO } from "./dtos/UpdatePeliculaDTO";
import { IPeliculaRepository } from "./pelicula.types";

export class PeliculaService {
  constructor(
    private peliculaRepo: IPeliculaRepository,
    private auditoriaService?: AuditoriaService
  ) {}

  private toDTO(pelicula: Pelicula): PeliculaResponseDTO {
    return {
      id: pelicula.id,
      titulo: pelicula.titulo,
      sinopsis: pelicula.sinopsis,
      duracionMinutos: pelicula.duracionMinutos,
      genero: pelicula.genero,
      clasificacion: pelicula.clasificacion,
      posterUrl: pelicula.posterUrl,
      estado: pelicula.estado,
      precioBaseExperiencia: Number(pelicula.precioBaseExperiencia),
    };
  }

  async listarActivas(): Promise<PeliculaResponseDTO[]> {
    const peliculas = await this.peliculaRepo.findAll({ estado: "activa" });
    return peliculas.map((p) => this.toDTO(p));
  }

  async listarTodas(): Promise<PeliculaResponseDTO[]> {
    const peliculas = await this.peliculaRepo.findAll();
    return peliculas.map((p) => this.toDTO(p));
  }

  async obtenerPorId(id: number): Promise<PeliculaResponseDTO> {
    const pelicula = await this.peliculaRepo.findById(id);
    if (!pelicula) {
      throw new AppError("Película no encontrada", 404);
    }
    return this.toDTO(pelicula);
  }

  async crear(dto: CreatePeliculaDTO, actor?: AuditoriaActor): Promise<PeliculaResponseDTO> {
    if (dto.duracionMinutos <= 0) {
      throw new AppError("La duración debe ser mayor a 0 minutos", 400);
    }

    const operacion = async (tx?: DbClient) => {
      const data = {
        titulo: dto.titulo,
        sinopsis: dto.sinopsis,
        duracionMinutos: dto.duracionMinutos,
        genero: dto.genero,
        clasificacion: dto.clasificacion,
        posterUrl: dto.posterUrl,
        estado: dto.estado ?? "activa",
        precioBaseExperiencia: dto.precioBaseExperiencia,
      };

      const nuevaPelicula = tx
        ? await this.peliculaRepo.create(data, tx)
        : await this.peliculaRepo.create(data);

      if (this.auditoriaService && actor) {
        await this.auditoriaService.registrar(
          {
            actor,
            accion: "CREAR",
            entidad: "Pelicula",
            entidadId: nuevaPelicula.id,
            valorAnterior: null,
            valorNuevo: nuevaPelicula,
          },
          tx
        );
      }

      return this.toDTO(nuevaPelicula);
    };

    if (this.auditoriaService && actor) {
      return prisma.$transaction((tx) => operacion(tx));
    }
    return operacion();
  }

  async actualizar(
    id: number,
    dto: UpdatePeliculaDTO,
    actor?: AuditoriaActor
  ): Promise<PeliculaResponseDTO> {
    const existing = await this.peliculaRepo.findById(id);
    if (!existing) {
      throw new AppError("Película no encontrada", 404);
    }

    if (dto.duracionMinutos !== undefined && dto.duracionMinutos <= 0) {
      throw new AppError("La duración debe ser mayor a 0 minutos", 400);
    }

    let accion = "EDITAR";
    if (dto.estado && dto.estado !== existing.estado) {
      accion = dto.estado === "inactiva" ? "DESACTIVAR" : "ACTIVAR";
    }

    const operacion = async (tx?: DbClient) => {
      const actualizada = tx
        ? await this.peliculaRepo.update(id, dto, tx)
        : await this.peliculaRepo.update(id, dto);

      if (this.auditoriaService && actor) {
        await this.auditoriaService.registrar(
          {
            actor,
            accion,
            entidad: "Pelicula",
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
    const existing = await this.peliculaRepo.findById(id);
    if (!existing) {
      throw new AppError("Película no encontrada", 404);
    }

    const operacion = async (tx?: DbClient) => {
      try {
        if (tx) {
          await this.peliculaRepo.delete(id, tx);
        } else {
          await this.peliculaRepo.delete(id);
        }

        if (this.auditoriaService && actor) {
          await this.auditoriaService.registrar(
            {
              actor,
              accion: "ELIMINAR",
              entidad: "Pelicula",
              entidadId: id,
              valorAnterior: existing,
              valorNuevo: null,
            },
            tx
          );
        }

        return { mensaje: "Película eliminada exitosamente", id };
      } catch (error: any) {
        if (error?.code === "P2003") {
          throw new AppError(
            "No se puede eliminar la película porque tiene funciones o productos asociados. Puedes cambiar su estado a 'inactiva'.",
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
