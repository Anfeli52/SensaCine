import { Modal } from "../../../shared/components/Modal";
import { Badge } from "../../../shared/components/Badge";
import { LogAuditoriaItem } from "../types/auditoria.types";
import {
  Calendar,
  Clock,
  User,
  Shield,
  Layers,
  ArrowRight,
  UtensilsCrossed,
  Info,
} from "lucide-react";

interface AdminAuditoriaModalProps {
  log: LogAuditoriaItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AdminAuditoriaModal({ log, isOpen, onClose }: AdminAuditoriaModalProps) {
  if (!log) return null;

  const fechaObj = new Date(log.fechaHora);
  const fechaFormateada = fechaObj.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const horaFormateada = fechaObj.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const getAccionBadge = (accion: string) => {
    switch (accion.toUpperCase()) {
      case "CREAR":
        return <Badge variant="primary">Creación</Badge>;
      case "EDITAR":
      case "EDITAR_ROL":
        return <Badge variant="tertiary">Modificación</Badge>;
      case "ELIMINAR":
      case "DESACTIVAR":
        return <Badge className="bg-[#fee2e2] text-[#dc2626] border-[#fecaca]">Eliminación / Desactivación</Badge>;
      case "ACTIVAR":
        return <Badge className="bg-[#dcfce7] text-[#16a34a] border-[#bbf7d0]">Activación</Badge>;
      case "CAMBIO_ESTADO":
        return <Badge className="bg-[#fef3c7] text-[#d97706] border-[#fde68a]">Cambio de Estado</Badge>;
      default:
        return <Badge variant="neutral">{accion}</Badge>;
    }
  };

  const getRolBadge = (rol: string | null) => {
    if (!rol) return <Badge variant="neutral">Sistema</Badge>;
    if (rol === "admin") return <Badge variant="dark">Administrador</Badge>;
    if (rol === "cocina") return <Badge className="bg-[#fef3c7] text-[#b45309] border-[#fde68a]">Cocina</Badge>;
    return <Badge variant="neutral">{rol}</Badge>;
  };

  const formatJson = (data: any) => {
    if (data === null || data === undefined) {
      return <span className="text-[#86868b] italic">Sin datos registrados</span>;
    }
    if (typeof data === "string") return data;
    return (
      <pre className="text-[12px] bg-[#f5f5f7] p-3 rounded-appleMd overflow-x-auto text-[#1d1d1f] font-mono leading-relaxed border border-[#e5e5ea]">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalle del Registro de Auditoría" maxWidth="xl">
      <div className="space-y-6">
        {/* Cabecera del log */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#fbfbfd] border border-[#e5e5ea] rounded-appleLg">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-[#1d1d1f]">Acción:</span>
            {getAccionBadge(log.accion)}
          </div>
          <div className="flex items-center gap-3 text-[12px] text-[#6e6e73]">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{fechaFormateada}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{horaFormateada}</span>
            </div>
          </div>
        </div>

        {/* Tarjetas de Información: Actor y Entidad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tarjeta Usuario */}
          <div className="p-4 bg-white border border-[#e5e5ea] rounded-appleLg shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-[#0071e3]" />
              <span>Responsable</span>
            </div>
            <div className="text-[14px] font-semibold text-[#1d1d1f]">
              {log.usuarioNombre || "Usuario Registrado"}
            </div>
            <div className="text-[13px] text-[#6e6e73] truncate">
              {log.usuarioEmail || "Sin correo"}
            </div>
            <div className="pt-1 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#86868b]" />
              <span className="text-[12px] text-[#86868b]">Rol:</span>
              {getRolBadge(log.usuarioRol)}
            </div>
          </div>

          {/* Tarjeta Entidad */}
          <div className="p-4 bg-white border border-[#e5e5ea] rounded-appleLg shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-[#0071e3]" />
              <span>Entidad Afectada</span>
            </div>
            <div className="text-[14px] font-semibold text-[#1d1d1f]">
              {log.entidad}
            </div>
            <div className="text-[13px] text-[#6e6e73]">
              Identificador (ID): <span className="font-mono font-semibold text-[#1d1d1f]">#{log.entidadId}</span>
            </div>
          </div>
        </div>

        {/* Bloque especial para Cocina */}
        {log.entidad === "OrdenCocina" && log.metadata && (
          <div className="p-4 bg-[#fffbeb] border border-[#fef3c7] rounded-appleLg space-y-2">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-[#b45309]">
              <UtensilsCrossed className="w-4 h-4 text-[#d97706]" />
              <span>Contexto de Cocina y Pedido</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[13px] pt-1">
              <div>
                <span className="text-[#86868b] block text-[11px] uppercase">N° Pedido (Orden)</span>
                <span className="font-semibold text-[#1d1d1f]">#{log.metadata.idPedido ?? log.entidadId}</span>
              </div>
              <div>
                <span className="text-[#86868b] block text-[11px] uppercase">N° Reserva</span>
                <span className="font-semibold text-[#1d1d1f]">
                  {log.metadata.idReserva ? `#${log.metadata.idReserva}` : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-[#86868b] block text-[11px] uppercase">Transición</span>
                <span className="inline-flex items-center gap-1 font-semibold text-[#1d1d1f]">
                  <span>{log.valorAnterior?.estado ?? "Pendiente"}</span>
                  <ArrowRight className="w-3 h-3 text-[#d97706]" />
                  <span className="text-[#16a34a]">{log.valorNuevo?.estado ?? "Actualizado"}</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Comparativa: Valor Anterior vs Valor Nuevo */}
        <div className="space-y-4">
          <div className="text-[13px] font-semibold text-[#1d1d1f] flex items-center gap-2">
            <Info className="w-4 h-4 text-[#0071e3]" />
            <span>Comparativa de Cambios</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="text-[12px] font-semibold text-[#dc2626] uppercase tracking-wider flex items-center gap-1">
                <span>Estado / Valor Anterior</span>
              </div>
              {formatJson(log.valorAnterior)}
            </div>

            <div className="space-y-1.5">
              <div className="text-[12px] font-semibold text-[#16a34a] uppercase tracking-wider flex items-center gap-1">
                <span>Estado / Valor Nuevo</span>
              </div>
              {formatJson(log.valorNuevo)}
            </div>
          </div>
        </div>

        {/* Metadata adicional si aplica y no es cocina ya mostrada */}
        {log.metadata && log.entidad !== "OrdenCocina" && (
          <div className="space-y-1.5">
            <div className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">
              Información Adicional (Metadatos)
            </div>
            {formatJson(log.metadata)}
          </div>
        )}
      </div>
    </Modal>
  );
}

