import { apiClient } from "../../../lib/apiClient";
import {
  AuditoriaFiltros,
  AuditoriaPaginadaResponse,
  LogAuditoriaItem,
} from "../types/auditoria.types";

export async function getAuditoriaLogs(
  filtros: AuditoriaFiltros
): Promise<AuditoriaPaginadaResponse> {
  const params: Record<string, any> = {};

  if (filtros.entidad) params.entidad = filtros.entidad;
  if (filtros.entidadId) params.entidadId = filtros.entidadId;
  if (filtros.idUsuario) params.idUsuario = filtros.idUsuario;
  if (filtros.accion) params.accion = filtros.accion;
  if (filtros.desde) params.desde = filtros.desde;
  if (filtros.hasta) params.hasta = filtros.hasta;
  if (filtros.pagina) params.pagina = filtros.pagina;
  if (filtros.limite) params.limite = filtros.limite;

  const { data } = await apiClient.get<AuditoriaPaginadaResponse>("/admin/auditoria", {
    params,
  });
  return data;
}

export async function getAuditoriaLogById(id: number): Promise<LogAuditoriaItem> {
  const { data } = await apiClient.get<LogAuditoriaItem>(`/admin/auditoria/${id}`);
  return data;
}

