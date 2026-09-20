import { Funcion, Pelicula, Sala, Prisma } from "@prisma/client";

export interface CreateFuncionInput {
  idPelicula: number;
  idSala: number;
  fecha: string | Date;
  horaInicio: string | Date;
  horaFin?: string | Date;
  precioAsientoOficial: number | Prisma.Decimal;
  estado?: string;
}

export interface UpdateFuncionInput {
  idPelicula?: number;
  idSala?: number;
  fecha?: string | Date;
  horaInicio?: string | Date;
  horaFin?: string | Date;
  precioAsientoOficial?: number | Prisma.Decimal;
  estado?: string;
}

export interface FuncionConDetalles extends Funcion {
  pelicula?: Pelicula;
  sala?: Sala;
}

export interface FuncionResponseDTO {
  id: number;
  idPelicula: number;
  idSala: number;
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  precioAsientoOficial: number;
  estado: string;
  pelicula?: {
    id: number;
    titulo: string;
    duracionMinutos: number;
    genero: string | null;
    clasificacion: string | null;
    posterUrl: string | null;
  };
  sala?: {
    id: number;
    nombre: string;
    capacidad: number;
    estado: string;
  };
}

export interface FuncionFilterOptions {
  fecha?: string | Date;
  idSala?: number;
  idPelicula?: number;
  estado?: string;
  desdeFecha?: string | Date;
  hastaFecha?: string | Date;
  soloFuturas?: boolean;
}


export interface IFuncionRepository {
  findAll(filters?: FuncionFilterOptions): Promise<FuncionConDetalles[]>;
  findById(id: number): Promise<FuncionConDetalles | null>;
  findConflicts(
    idSala: number,
    fecha: Date,
    horaInicio: Date,
    horaFin: Date,
    excludeId?: number
  ): Promise<FuncionConDetalles[]>;
  create(data: {
    idPelicula: number;
    idSala: number;
    fecha: Date;
    horaInicio: Date;
    horaFin: Date;
    precioAsientoOficial: number | Prisma.Decimal;
    estado?: string;
  }): Promise<FuncionConDetalles>;
  update(
    id: number,
    data: {
      idPelicula?: number;
      idSala?: number;
      fecha?: Date;
      horaInicio?: Date;
      horaFin?: Date;
      precioAsientoOficial?: number | Prisma.Decimal;
      estado?: string;
    }
  ): Promise<FuncionConDetalles>;
  delete(id: number): Promise<Funcion>;
}
