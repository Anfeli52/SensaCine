export interface LogAuditoriaItem {
  id: number;
  idUsuario: number | null;
  usuarioEmail: string | null;
  usuarioRol: string | null;
  usuarioNombre: string | null;
  accion: string;
  entidad: string;
  entidadId: number;
  valorAnterior: any;
  valorNuevo: any;
  metadata: any;
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

