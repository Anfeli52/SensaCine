export interface AuditoriaMetadata {
  idPedido?: number;
  idReserva?: number;
  totalAsientos?: number;
  [key: string]: unknown;
}

export interface AuditoriaSnapshot {
  id?: number;
  titulo?: string;
  nombre?: string;
  estado?: string;
  rol?: string;
  [key: string]: unknown;
}

export interface LogAuditoriaItem {
  id: number;
  idUsuario: number | null;
  usuarioEmail: string | null;
  usuarioRol: string | null;
  usuarioNombre: string | null;
  accion: string;
  entidad: string;
  entidadId: number;
  valorAnterior: AuditoriaSnapshot | null;
  valorNuevo: AuditoriaSnapshot | null;
  metadata: AuditoriaMetadata | null;
  fechaHora: string;
}

export interface AuditoriaFiltros {
  entidad?: string;
  entidadId?: number;
  idUsuario?: number;
  accion?: string;
  desde?: string;
  hasta?: string;
  pagina?: number;
  limite?: number;
}

export interface AuditoriaPaginadaResponse {
  total: number;
  paginas: number;
  pagina: number;
  limite: number;
  logs: LogAuditoriaItem[];
}
