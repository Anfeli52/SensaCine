import { Funcion, Prisma } from "@prisma/client";
import { DbClient } from "../auditoria/auditoria.types";

export interface CreateFuncionInput {
  idPelicula: number;
  idSala: number;
  fecha: string; // formato "YYYY-MM-DD"
  horaInicio: string; // formato "HH:mm" o "HH:mm:ss"
  horaFin?: string; // opcional, si no se envía se calcula según la película
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

export interface FuncionResponseDTO {
  id: number;
  idPelicula: number;
  idSala: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  precioAsientoOficial: number;
  estado: string;
  pelicula?: any;
  sala?: any;
}

export interface FuncionConDetalles extends Funcion {
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
  findById(id: number, tx?: DbClient): Promise<FuncionConDetalles | null>;
  findConflicts(
    idSala: number,
    fecha: Date,
    horaInicio: Date,
    horaFin: Date,
    excludeId?: number,
    tx?: DbClient
  ): Promise<FuncionConDetalles[]>;
  create(
    data: {
      idPelicula: number;
      idSala: number;
      fecha: Date;
      horaInicio: Date;
      horaFin: Date;
      precioAsientoOficial: number | Prisma.Decimal;
      estado?: string;
    },
    tx?: DbClient
  ): Promise<FuncionConDetalles>;
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
    },
    tx?: DbClient
  ): Promise<FuncionConDetalles>;
  delete(id: number, tx?: DbClient): Promise<Funcion>;
}
