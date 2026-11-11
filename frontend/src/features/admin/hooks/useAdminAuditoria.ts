import { useQuery } from "@tanstack/react-query";
import { getAuditoriaLogs } from "../api/auditoriaApi";
import { AuditoriaFiltros } from "../types/auditoria.types";

export const AUDITORIA_QUERY_KEY = ["admin", "auditoria"];

export function useAdminAuditoria(filtros: AuditoriaFiltros) {
  return useQuery({
    queryKey: [...AUDITORIA_QUERY_KEY, filtros],
    queryFn: () => getAuditoriaLogs(filtros),
    placeholderData: (previousData) => previousData,
  });
}

