import { EstadoOrdenCocina, OrdenCocina, Prisma } from "@prisma/client";
import { DbClient } from "../auditoria/auditoria.types";

export type FuncionCocina = Prisma.FuncionGetPayload<{
  include: {
    pelicula: { include: { productos: { where: { estado: string }; orderBy: { ordenMenu: "asc" } } } };
    sala: true;
  };
}>;

export type ReservaCocina = Prisma.ReservaGetPayload<{
  include: {
    usuario: { select: { id: true; nombre: true; email: true } };
    asientos: {
      include: {
        asiento: true;
        restricciones: { include: { restriccion: true; producto: true } };
        ordenesCocina: true;
      };
    };
  };
}>;

export type FuncionConReservas = FuncionCocina & {
  totalReservas: number;
  reservas: ReservaCocina[];
};

export type OrdenCocinaConReserva = OrdenCocina & {
  reservaAsiento?: {
    id: number;
    idReserva: number;
  } | null;
};

export interface ICocinaRepository {
  getFuncionesFuturas(): Promise<FuncionCocina[]>;
  getReservasPorFuncion(idFuncion: number): Promise<ReservaCocina[]>;
  getReservasPorFunciones(idsFunciones: number[]): Promise<ReservaCocina[]>;
  actualizarEstadoOrden(
    idOrden: number,
    estado: EstadoOrdenCocina,
    tx?: DbClient
  ): Promise<OrdenCocina | null>;
  obtenerOrdenPorId(idOrden: number, tx?: DbClient): Promise<OrdenCocina | null>;
  obtenerOrdenConReserva?(idOrden: number, tx?: DbClient): Promise<OrdenCocinaConReserva | null>;
}

export interface ListadoCocinaResponse {
  mensaje?: string;
  total: number;
  funciones: FuncionConReservas[];
}
