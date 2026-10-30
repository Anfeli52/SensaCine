import { LogAuditoria, Prisma } from "@prisma/client";

export interface AuditoriaActor {
  id: number;
  email: string;
  rol: string;
}

export interface RegistrarAuditoriaInput {
  actor?: AuditoriaActor | null;
  accion: string;
  entidad: string;
  entidadId: number;
  valorAnterior?: unknown;
  valorNuevo?: unknown;
  metadata?: unknown;
}

export interface FiltrosAuditoriaInput {
  entidad?: string;
  entidadId?: number;
  idUsuario?: number;
  accion?: string;
  desde?: Date | string;
  hasta?: Date | string;
  pagina?: number;
  limite?: number;
}

export interface AuditoriaItemResponse {
  id: number;
  idUsuario: number | null;
  usuarioEmail: string | null;
  usuarioRol: string | null;
  usuarioNombre: string | null;
  accion: string;
  entidad: string;
  entidadId: number;
  valorAnterior: unknown;
  valorNuevo: unknown;
  metadata: unknown;
  fechaHora: Date;
}

export interface AuditoriaPaginadaResponse {
  total: number;
  paginas: number;
  pagina: number;
  limite: number;
  logs: AuditoriaItemResponse[];
}

export type DbClient = Prisma.TransactionClient;

export interface IAuditoriaRepository {
  crear(data: RegistrarAuditoriaInput, tx?: DbClient): Promise<LogAuditoria>;
  listar(filtros: FiltrosAuditoriaInput): Promise<AuditoriaPaginadaResponse>;
  obtenerPorId(id: number): Promise<AuditoriaItemResponse | null>;
}

