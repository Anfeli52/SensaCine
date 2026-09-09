import { AppError } from "../../common/errors/AppError";
import { CreatePeliculaDTO } from "./dtos/CreatePeliculaDTO";
import { UpdatePeliculaDTO } from "./dtos/UpdatePeliculaDTO";
import { PeliculaResponseDTO } from "./dtos/PeliculaResponseDTO";
import { IPeliculaRepository } from "./pelicula.types";
import { Pelicula } from "@prisma/client";

export class PeliculaService {
  constructor(private peliculaRepo: IPeliculaRepository) {}

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

  async crear(dto: CreatePeliculaDTO): Promise<PeliculaResponseDTO> {
    if (dto.duracionMinutos <= 0) {
      throw new AppError("La duración debe ser mayor a 0 minutos", 400);
    }

    const nuevaPelicula = await this.peliculaRepo.create({
      titulo: dto.titulo,
      sinopsis: dto.sinopsis,
      duracionMinutos: dto.duracionMinutos,
      genero: dto.genero,
      clasificacion: dto.clasificacion,
      posterUrl: dto.posterUrl,
      estado: dto.estado ?? "activa",
      precioBaseExperiencia: dto.precioBaseExperiencia,
    });

    return this.toDTO(nuevaPelicula);
  }

  async actualizar(id: number, dto: UpdatePeliculaDTO): Promise<PeliculaResponseDTO> {
    const existing = await this.peliculaRepo.findById(id);
    if (!existing) {
      throw new AppError("Película no encontrada", 404);
    }

    if (dto.duracionMinutos !== undefined && dto.duracionMinutos <= 0) {
      throw new AppError("La duración debe ser mayor a 0 minutos", 400);
    }

    const actualizada = await this.peliculaRepo.update(id, dto);
    return this.toDTO(actualizada);
  }

  async eliminar(id: number): Promise<{ mensaje: string; id: number }> {
    const existing = await this.peliculaRepo.findById(id);
    if (!existing) {
      throw new AppError("Película no encontrada", 404);
    }

    await this.peliculaRepo.delete(id);
    return { mensaje: "Película eliminada exitosamente", id };
  }
}
