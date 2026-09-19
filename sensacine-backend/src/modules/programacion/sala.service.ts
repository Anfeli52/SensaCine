import { AppError } from "../../common/errors/AppError";
import { CreateSalaInput, ISalaRepository, SalaConDetalles, UpdateSalaInput } from "./sala.types";

export class SalaService {
  constructor(private salaRepo: ISalaRepository) {}

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

  async crear(input: CreateSalaInput): Promise<SalaConDetalles> {
    let filas = input.filas;
    let asientosPorFila = input.asientosPorFila;
    let capacidad = input.capacidad;

    if (filas && asientosPorFila) {
      capacidad = filas * asientosPorFila;
    } else if (capacidad && capacidad > 0) {
      // Si solo se da capacidad, distribuimos en filas de ~10 asientos
      asientosPorFila = Math.min(10, capacidad);
      filas = Math.ceil(capacidad / asientosPorFila);
    } else {
      // Default: 5 filas x 8 asientos = 40
      filas = 5;
      asientosPorFila = 8;
      capacidad = 40;
    }

    if (capacidad <= 0) {
      throw new AppError("La capacidad de la sala debe ser mayor a 0", 400);
    }

    // 1. Crear la sala
    const nuevaSala = await this.salaRepo.create({
      nombre: input.nombre.trim(),
      capacidad,
      estado: input.estado ?? "activa",
    });

    // 2. Generar matriz de asientos (Filas A, B, C... y Números 1..N)
    const asientosToCreate: { idSala: number; fila: string; numero: number }[] = [];
    let count = 0;

    for (let f = 0; f < filas; f++) {
      const letraFila = String.fromCharCode(65 + f); // 65 = 'A'
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
      await this.salaRepo.createAsientos(asientosToCreate);
    }

    const salaCompleta = await this.salaRepo.findById(nuevaSala.id);
    return salaCompleta || { ...nuevaSala, asientos: [] };
  }

  async actualizar(id: number, input: UpdateSalaInput): Promise<SalaConDetalles> {
    const existing = await this.salaRepo.findById(id);
    if (!existing) {
      throw new AppError("Sala no encontrada", 404);
    }

    const updated = await this.salaRepo.update(id, input);
    const salaCompleta = await this.salaRepo.findById(updated.id);
    return salaCompleta || updated;
  }

  async eliminar(id: number): Promise<{ mensaje: string; id: number }> {
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

    try {
      await this.salaRepo.deleteAsientosBySala(id);
      await this.salaRepo.delete(id);
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
  }
}
