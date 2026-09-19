import { Pelicula } from "../../catalogo/types";

export interface Asiento {
  id: number;
  idSala: number;
  fila: string;
  numero: number;
}

export interface Sala {
  id: number;
  nombre: string;
  capacidad: number;
  estado: "activa" | "inactiva" | "mantenimiento" | string;
  asientos?: Asiento[];
  _count?: {
    funciones?: number;
    asientos?: number;
  };
}

export interface CreateSalaInput {
  nombre: string;
  filas?: number;
  asientosPorFila?: number;
  capacidad?: number;
  estado?: string;
}

export interface UpdateSalaInput {
  nombre?: string;
  estado?: string;
}

export interface Funcion {
  id: number;
  idPelicula: number;
  idSala: number;
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  precioAsientoOficial: number;
  estado: "programada" | "en_curso" | "finalizada" | "cancelada" | string;
  pelicula?: Pelicula;
  sala?: Sala;
}

export interface CreateFuncionInput {
  idPelicula: number;
  idSala: number;
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  horaFin?: string; // HH:mm
  precioAsientoOficial: number;
  estado?: string;
}

export interface UpdateFuncionInput {
  idPelicula?: number;
  idSala?: number;
  fecha?: string;
  horaInicio?: string;
  horaFin?: string;
  precioAsientoOficial?: number;
  estado?: string;
}

export interface FuncionFilters {
  fecha?: string;
  idSala?: number;
  idPelicula?: number;
  estado?: string;
  desdeFecha?: string;
  hastaFecha?: string;
}
