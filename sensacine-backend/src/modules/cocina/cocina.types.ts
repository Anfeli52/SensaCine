import { EstadoOrdenCocina, OrdenCocina, Prisma } from "@prisma/client";

export type FuncionCocina = Prisma.FuncionGetPayload<{
  include: { pelicula: { include: { productos: { where: { estado: string }; orderBy: { ordenMenu: "asc" } } } }; sala: true };
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

export interface ICocinaRepository {
  getFuncionesFuturas(): Promise<FuncionCocina[]>;
  getReservasPorFuncion(idFuncion: number): Promise<ReservaCocina[]>;
  getReservasPorFunciones(idsFunciones: number[]): Promise<ReservaCocina[]>;
  actualizarEstadoOrden(idOrden: number, estado: EstadoOrdenCocina): Promise<OrdenCocina | null>;
  obtenerOrdenPorId(idOrden: number): Promise<OrdenCocina | null>;
}

export interface ListadoCocinaResponse {
  mensaje?: string;
  total: number;
  funciones: FuncionConReservas[];
}
