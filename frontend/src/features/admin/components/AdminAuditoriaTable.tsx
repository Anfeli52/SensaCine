import { useState } from "react";
import { Badge } from "../../../shared/components/Badge";
import { Button } from "../../../shared/components/Button";
import { AuditoriaFiltros, LogAuditoriaItem } from "../types/auditoria.types";
import { AdminAuditoriaModal } from "./AdminAuditoriaModal";
import {
  Calendar,
  Clock,
  Eye,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  FileQuestion,
} from "lucide-react";

interface AdminAuditoriaTableProps {
  logs: LogAuditoriaItem[];
  total: number;
  paginas: number;
  paginaActual: number;
  filtros: AuditoriaFiltros;
  onFiltrosChange: (nuevosFiltros: Partial<AuditoriaFiltros>) => void;
  onLimpiarFiltros: () => void;
  isLoading?: boolean;
}

export function AdminAuditoriaTable({
  logs,
  total,
  paginas,
  paginaActual,
  filtros,
  onFiltrosChange,
  onLimpiarFiltros,
  isLoading,
}: AdminAuditoriaTableProps) {
  const [selectedLog, setSelectedLog] = useState<LogAuditoriaItem | null>(null);

  const getAccionBadge = (accion: string) => {
    switch (accion.toUpperCase()) {
      case "CREAR":
        return <Badge variant="primary">Crear</Badge>;
      case "EDITAR":
      case "EDITAR_ROL":
        return <Badge variant="tertiary">Editar</Badge>;
      case "ELIMINAR":
      case "DESACTIVAR":
        return (
          <Badge className="bg-[#fee2e2] text-[#dc2626] border-[#fecaca]">
            {accion === "ELIMINAR" ? "Eliminar" : "Desactivar"}
          </Badge>
        );
      case "ACTIVAR":
        return (
          <Badge className="bg-[#dcfce7] text-[#16a34a] border-[#bbf7d0]">
            Activar
          </Badge>
        );
      case "CAMBIO_ESTADO":
        return (
          <Badge className="bg-[#fef3c7] text-[#d97706] border-[#fde68a]">
            Estado
          </Badge>
        );
      default:
        return <Badge variant="neutral">{accion}</Badge>;
    }
  };

  const getRolBadge = (rol: string | null) => {
    if (!rol) return <span className="text-[11px] text-[#86868b]">Sistema</span>;
    if (rol === "admin") {
      return (
        <span className="inline-flex items-center text-[11px] px-1.5 py-0.5 rounded bg-[#1d1d1f] text-white">
          Admin
        </span>
      );
    }
    if (rol === "cocina") {
      return (
        <span className="inline-flex items-center text-[11px] px-1.5 py-0.5 rounded bg-[#fef3c7] text-[#b45309]">
          Cocina
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-[11px] px-1.5 py-0.5 rounded bg-[#f5f5f7] text-[#6e6e73]">
        {rol}
      </span>
    );
  };

  const formatFechaHora = (isoDate: string) => {
    const d = new Date(isoDate);
    const fecha = d.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const hora = d.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { fecha, hora };
  };

  const getResumenCambio = (log: LogAuditoriaItem) => {
    if (log.entidad === "OrdenCocina") {
      const de = log.valorAnterior?.estado ?? "Pendiente";
      const a = log.valorNuevo?.estado ?? "Actualizado";
      const idReserva = log.metadata?.idReserva ? ` (Reserva #${log.metadata.idReserva})` : "";
      return `Pedido #${log.entidadId}${idReserva}: ${de} → ${a}`;
    }

    if (log.accion === "EDITAR_ROL") {
      const de = log.valorAnterior?.rol ?? "N/A";
      const a = log.valorNuevo?.rol ?? "N/A";
      return `Rol cambiado: ${de} → ${a}`;
    }

    if (log.accion === "DESACTIVAR" || log.accion === "ACTIVAR") {
      return `Estado: ${log.accion.toLowerCase()}`;
    }

    if (log.accion === "CREAR") {
      const nombre =
        log.valorNuevo?.titulo || log.valorNuevo?.nombre || `#${log.entidadId}`;
      return `Creación de ${log.entidad}: "${nombre}"`;
    }

    if (log.accion === "ELIMINAR") {
      const nombre =
        log.valorAnterior?.titulo || log.valorAnterior?.nombre || `#${log.entidadId}`;
      return `Eliminación de ${log.entidad}: "${nombre}"`;
    }

    return `Actualización de ${log.entidad} #${log.entidadId}`;
  };

  const tieneFiltrosActivos =
    Boolean(filtros.entidad) ||
    Boolean(filtros.accion) ||
    Boolean(filtros.desde) ||
    Boolean(filtros.hasta);

  return (
    <div className="space-y-4">
      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-appleLg border border-[#e5e5ea] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#1d1d1f]">
            <Filter className="w-4 h-4 text-[#0071e3]" />
            <span>Filtros:</span>
          </div>

          {/* Filtro Entidad */}
          <select
            value={filtros.entidad || ""}
            onChange={(e) =>
              onFiltrosChange({ entidad: e.target.value || undefined, pagina: 1 })
            }
            className="text-[13px] px-3 py-1.5 rounded-appleMd border border-[#d2d2d7] bg-[#fbfbfd] text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
          >
            <option value="">Todas las Entidades</option>
            <option value="Pelicula">Películas</option>
            <option value="Funcion">Funciones</option>
            <option value="Sala">Salas</option>
            <option value="Usuario">Usuarios</option>
            <option value="OrdenCocina">Pedidos de Cocina</option>
          </select>

          {/* Filtro Acción */}
          <select
            value={filtros.accion || ""}
            onChange={(e) =>
              onFiltrosChange({ accion: e.target.value || undefined, pagina: 1 })
            }
            className="text-[13px] px-3 py-1.5 rounded-appleMd border border-[#d2d2d7] bg-[#fbfbfd] text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
          >
            <option value="">Todas las Acciones</option>
            <option value="CREAR">Crear</option>
            <option value="EDITAR">Editar</option>
            <option value="ELIMINAR">Eliminar</option>
            <option value="ACTIVAR">Activar</option>
            <option value="DESACTIVAR">Desactivar</option>
            <option value="CAMBIO_ESTADO">Cambio de Estado</option>
            <option value="EDITAR_ROL">Cambio de Rol</option>
          </select>

          {/* Fechas */}
          <div className="flex items-center gap-2 text-[12px] text-[#6e6e73]">
            <span>Desde:</span>
            <input
              type="date"
              value={filtros.desde || ""}
              onChange={(e) =>
                onFiltrosChange({ desde: e.target.value || undefined, pagina: 1 })
              }
              className="text-[12px] px-2 py-1 rounded-appleMd border border-[#d2d2d7] bg-[#fbfbfd] text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
            />
            <span>Hasta:</span>
            <input
              type="date"
              value={filtros.hasta || ""}
              onChange={(e) =>
                onFiltrosChange({ hasta: e.target.value || undefined, pagina: 1 })
              }
              className="text-[12px] px-2 py-1 rounded-appleMd border border-[#d2d2d7] bg-[#fbfbfd] text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
            />
          </div>
        </div>

        {tieneFiltrosActivos && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onLimpiarFiltros}
            className="text-[12px] px-3 flex items-center gap-1.5 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#6e6e73]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </Button>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-appleLg border border-[#e5e5ea] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fbfbfd] border-b border-[#e5e5ea] text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Responsable</th>
                <th className="py-3 px-4">Acción</th>
                <th className="py-3 px-4">Entidad Afectada</th>
                <th className="py-3 px-4">Resumen del Cambio</th>
                <th className="py-3 px-4 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f0] text-[13px] text-[#1d1d1f]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#86868b]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileQuestion className="w-8 h-8 text-[#d2d2d7]" />
                      <p className="font-medium text-[14px] text-[#1d1d1f]">
                        No se encontraron registros de auditoría
                      </p>
                      <p className="text-[12px] text-[#86868b]">
                        {tieneFiltrosActivos
                          ? "Intenta modificar o limpiar los filtros seleccionados."
                          : "Aún no se han ejecutado acciones auditadas en el sistema."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const { fecha, hora } = formatFechaHora(log.fechaHora);
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-[#fbfbfd] transition-colors"
                    >
                      {/* Fecha y Hora */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium text-[#1d1d1f] flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#86868b]" />
                            {fecha}
                          </span>
                          <span className="text-[11px] text-[#86868b] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#86868b]" />
                            {hora}
                          </span>
                        </div>
                      </td>

                      {/* Responsable */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-[#1d1d1f]">
                              {log.usuarioNombre || "Usuario Registrado"}
                            </span>
                            {getRolBadge(log.usuarioRol)}
                          </div>
                          <span className="text-[12px] text-[#86868b] truncate max-w-[200px]">
                            {log.usuarioEmail || "Sin email"}
                          </span>
                        </div>
                      </td>

                      {/* Acción */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getAccionBadge(log.accion)}
                      </td>

                      {/* Entidad */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-medium text-[#1d1d1f]">
                          {log.entidad}
                        </span>
                        <span className="ml-1 text-[11px] font-mono text-[#86868b]">
                          #{log.entidadId}
                        </span>
                      </td>

                      {/* Resumen */}
                      <td className="py-3.5 px-4">
                        <span className="text-[13px] text-[#424245] line-clamp-1">
                          {getResumenCambio(log)}
                        </span>
                      </td>

                      {/* Botón Ver Detalle */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                          className="text-[12px] px-2.5 py-1 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#0071e3] border-transparent"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          <span>Ver</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-[#fbfbfd] border-t border-[#e5e5ea] text-[13px] text-[#6e6e73]">
            <div>
              Mostrando <span className="font-medium text-[#1d1d1f]">{logs.length}</span> de{" "}
              <span className="font-medium text-[#1d1d1f]">{total}</span> registros
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={paginaActual <= 1 || isLoading}
                onClick={() =>
                  onFiltrosChange({ pagina: Math.max(1, paginaActual - 1) })
                }
                className="text-[12px] px-2.5 py-1 bg-white border-[#d2d2d7]"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                <span>Anterior</span>
              </Button>

              <span className="text-[12px] font-medium text-[#1d1d1f] px-2">
                Pág. {paginaActual} de {paginas || 1}
              </span>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={paginaActual >= paginas || isLoading}
                onClick={() => onFiltrosChange({ pagina: paginaActual + 1 })}
                className="text-[12px] px-2.5 py-1 bg-white border-[#d2d2d7]"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalle */}
      <AdminAuditoriaModal
        isOpen={Boolean(selectedLog)}
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}
