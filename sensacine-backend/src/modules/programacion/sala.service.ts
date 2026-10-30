import { AppError } from "../../common/errors/AppError";
import { prisma } from "../../infrastructure/prisma/client";
import { AuditoriaActor, DbClient } from "../auditoria/auditoria.types";
import { AuditoriaService } from "../auditoria/auditoria.service";
import { CreateSalaInput, ISalaRepository, SalaConDetalles, UpdateSalaInput } from "./sala.types";

export class SalaService {
  constructor(
    private readonly salaRepo: ISalaRepository,
    private readonly auditoriaService?: AuditoriaService
  ) {}

  async listarTodas(): Promise<SalaConDetalles[]> {
    return this.salaRepo.findAll();
  }

  async obtenerPorId(id: number): Promise<SalaConDetalles> {
    const sala = await this.salaRepo.findById(id);
    if (!sala) {
      throw new AppError("Sala no encontrada", 404);
    }
    return sala;
  }

  async crear(input: CreateSalaInput, actor?: AuditoriaActor): Promise<SalaConDetalles> {
    let filas = input.filas;
    let asientosPorFila = input.asientosPorFila;
    let capacidad = input.capacidad;

    if (filas && asientosPorFila) {
      capacidad = filas * asientosPorFila;
    } else if (capacidad && capacidad > 0) {
      asientosPorFila = Math.min(10, capacidad);
      filas = Math.ceil(capacidad / asientosPorFila);
    } else {
      filas = 5;
      asientosPorFila = 8;
      capacidad = 40;
    }

    if (capacidad <= 0) {
      throw new AppError("La capacidad de la sala debe ser mayor a 0", 400);
    }

    const operacion = async (tx?: DbClient) => {
      // 1. Crear la sala
      const dataSala = {
        nombre: input.nombre.trim(),
        capacidad,
        estado: input.estado ?? "activa",
      };

      const nuevaSala = tx
        ? await this.salaRepo.create(dataSala, tx)
        : await this.salaRepo.create(dataSala);

      // 2. Generar matriz de asientos
      const asientosToCreate: { idSala: number; fila: string; numero: number }[] = [];
      let count = 0;

      for (let f = 0; f < filas; f++) {
        const letraFila = String.fromCodePoint(65 + f);
        for (let n = 1; n <= asientosPorFila; n++) {
          if (count < capacidad) {
            asientosToCreate.push({
              idSala: nuevaSala.id,
              fila: letraFila,
              numero: n,
            });
            count++;
          }
        }
      }

      if (asientosToCreate.length > 0) {
        if (tx) {
          await this.salaRepo.createAsientos(asientosToCreate, tx);
        } else {
          await this.salaRepo.createAsientos(asientosToCreate);
        }
      }

      if (this.auditoriaService && actor) {
        await this.auditoriaService.registrar(
          {
            actor,
            accion: "CREAR",
            entidad: "Sala",
            entidadId: nuevaSala.id,
            valorAnterior: null,
            valorNuevo: nuevaSala,
            metadata: { totalAsientos: asientosToCreate.length },
          },
          tx
        );
      }

      const salaCompleta = tx
        ? await this.salaRepo.findById(nuevaSala.id, tx)
        : await this.salaRepo.findById(nuevaSala.id);

      return salaCompleta || { ...nuevaSala, asientos: [] };
    };

    if (this.auditoriaService && actor) {
      return prisma.$transaction((tx) => operacion(tx));
    }
    return operacion();
  }

  async actualizar(
    id: number,
    input: UpdateSalaInput,
    actor?: AuditoriaActor
  ): Promise<SalaConDetalles> {
    const existing = await this.salaRepo.findById(id);
    if (!existing) {
      throw new AppError("Sala no encontrada", 404);
    }

    let accion = "EDITAR";
    if (input.estado && input.estado !== existing.estado) {
      accion = input.estado === "inactiva" ? "DESACTIVAR" : "ACTIVAR";
    }

    const operacion = async (tx?: DbClient) => {
      const updated = tx
        ? await this.salaRepo.update(id, input, tx)
        : await this.salaRepo.update(id, input);

      if (this.auditoriaService && actor) {
        await this.auditoriaService.registrar(
          {
            actor,
            accion,
            entidad: "Sala",
            entidadId: id,
            valorAnterior: existing,
            valorNuevo: updated,
          },
          tx
        );
      }

      const salaCompleta = tx
        ? await this.salaRepo.findById(updated.id, tx)
        : await this.salaRepo.findById(updated.id);

      return salaCompleta || updated;
    };

    if (this.auditoriaService && actor) {
      return prisma.$transaction((tx) => operacion(tx));
    }
    return operacion();
  }

  async eliminar(id: number, actor?: AuditoriaActor): Promise<{ mensaje: string; id: number }> {
    const existing = await this.salaRepo.findById(id);
    if (!existing) {
      throw new AppError("Sala no encontrada", 404);
    }

    if (existing._count?.funciones && existing._count.funciones > 0) {
      throw new AppError(
        "No se puede eliminar la sala porque tiene funciones programadas asociadas. Puedes cambiar su estado a 'inactiva' o 'mantenimiento'.",
        400
      );
    }

    const operacion = async (tx?: DbClient) => {
      try {
        if (tx) {
          await this.salaRepo.deleteAsientosBySala(id, tx);
          await this.salaRepo.delete(id, tx);
        } else {
          await this.salaRepo.deleteAsientosBySala(id);
          await this.salaRepo.delete(id);
        }

        if (this.auditoriaService && actor) {
          await this.auditoriaService.registrar(
            {
              actor,
              accion: "ELIMINAR",
              entidad: "Sala",
              entidadId: id,
              valorAnterior: existing,
              valorNuevo: null,
            },
            tx
          );
        }

        return { mensaje: "Sala y sus asientos eliminados exitosamente", id };
      } catch (error: any) {
        if (error?.code === "P2003") {
          throw new AppError(
            "No se puede eliminar la sala porque tiene registros relacionados.",
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
