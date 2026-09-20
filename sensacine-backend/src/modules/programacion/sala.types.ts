import { Sala, Asiento } from "@prisma/client";

export interface CreateSalaInput {
  nombre: string;
  filas?: number; // e.g. 5 filas (A..E)
  asientosPorFila?: number; // e.g. 8 asientos por fila (1..8)
  capacidad?: number;
  estado?: string;
}

export interface UpdateSalaInput {
  nombre?: string;
  estado?: string;
}

export interface SalaConDetalles extends Sala {
  asientos?: Asiento[];
  _count?: {
    funciones?: number;
    asientos?: number;
  };
}

export interface ISalaRepository {
  findAll(): Promise<SalaConDetalles[]>;
  findById(id: number): Promise<SalaConDetalles | null>;
  create(data: { nombre: string; capacidad: number; estado?: string }): Promise<Sala>;
  createAsientos(asientos: { idSala: number; fila: string; numero: number }[]): Promise<void>;
  update(id: number, data: UpdateSalaInput): Promise<Sala>;
  delete(id: number): Promise<Sala>;
  deleteAsientosBySala(idSala: number): Promise<void>;
}
