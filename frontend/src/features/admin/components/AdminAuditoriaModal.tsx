import React from "react";
import { Modal } from "../../../shared/components/Modal";
import { Badge } from "../../../shared/components/Badge";
import { AuditoriaSnapshot, LogAuditoriaItem } from "../types/auditoria.types";
import {
  Calendar,
  Clock,
  User,
  Shield,
  Layers,
  ArrowRight,
  UtensilsCrossed,
  Sparkles,
  PlusCircle,
  Trash2,
  Code,
  Tag,
  CheckCircle2,
} from "lucide-react";

interface AdminAuditoriaModalProps {
  log: LogAuditoriaItem | null;
  isOpen: boolean;
  onClose: () => void;
}

interface FieldChange {
  key: string;
  label: string;
  valorAnterior: unknown;
  valorNuevo: unknown;
}

const FIELD_LABELS: Record<string, string> = {
  titulo: "Título",
  nombre: "Nombre",
  sinopsis: "Sinopsis",
  duracionMinutos: "Duración",
  genero: "Género",
  clasificacion: "Clasificación",
  precioBaseExperiencia: "Precio base",
  precioAsientoOficial: "Precio oficial",
  posterUrl: "Póster (URL)",
  imagenUrl: "Imagen (URL)",
  estado: "Estado",
  rol: "Rol",
  email: "Correo electrónico",
  capacidad: "Capacidad",
  filas: "Filas",
  asientosPorFila: "Asientos por fila",
  fecha: "Fecha",
  horaInicio: "Hora de inicio",
  horaFin: "Hora de fin",
  pelicula: "Película",
  sala: "Sala",
  idPelicula: "Película (ID)",
  idSala: "Sala (ID)",
  idReserva: "Reserva (ID)",
  idPedido: "Pedido (ID)",
  idUsuario: "Usuario (ID)",
  totalAsientos: "Total asientos creados",
  ordenMenu: "Orden en el menú",
  descripcion: "Descripción",
  categoria: "Categoría",
};

const IGNORED_FIELDS = new Set([
  "id",
  "passwordHash",
  "fechaActualizacion",
  "fechaCreacion",
  "fechaRegistro",
  "_count",
]);

function formatFieldValue(key: string, value: unknown): React.ReactNode {
  if (value === null || value === undefined || value === "") {
    return <span className="text-[#86868b] italic">Sin valor</span>;
  }

  // 1. Prioridad a campos de hora (evita que un ISO epoch 1970-01-01 se formatee como fecha)
  if ((key === "horaInicio" || key === "horaFin") && typeof value === "string") {
    if (value.includes("T")) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        const hh = String(d.getUTCHours()).padStart(2, "0");
        const mm = String(d.getUTCMinutes()).padStart(2, "0");
        return <span className="font-mono text-[#1d1d1f] font-semibold">{hh}:{mm}</span>;
      }
    }
    return <span className="font-mono text-[#1d1d1f] font-semibold">{value}</span>;
  }

  // 2. Prioridad a campo fecha solo-calendario (siempre en UTC para evitar desfase de día)
  if (key === "fecha" && typeof value === "string") {
    const datePart = value.split("T")[0];
    const [y, m, d] = datePart.split("-").map(Number);
    if (y && m && d) {
      const utcDate = new Date(Date.UTC(y, m - 1, d));
      return (
        <span className="font-medium text-[#1d1d1f]">
          {utcDate.toLocaleDateString("es-CO", {
            timeZone: "UTC",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      );
    }
  }

  // 3. Precios / Moneda (soporta number y string numérico de Prisma Decimal)
  if (key.toLowerCase().includes("precio")) {
    const numeric = typeof value === "number" ? value : Number(value);
    if (!isNaN(numeric)) {
      return (
        <span className="font-semibold text-[#1d1d1f]">
          ${numeric.toLocaleString("es-CO")} COP
        </span>
      );
    }
  }

  // 4. Duración en minutos
  if (key === "duracionMinutos" && typeof value === "number") {
    return <span className="font-medium text-[#1d1d1f]">{value} minutos</span>;
  }

  // 5. Capacidad
  if (key === "capacidad" && typeof value === "number") {
    return <span className="font-medium text-[#1d1d1f]">{value} personas</span>;
  }

  // 6. Estado
  if (key === "estado" && typeof value === "string") {
    const val = value.toLowerCase();
    if (val === "activa" || val === "activo" || val === "confirmada" || val === "lista") {
      return <Badge className="bg-[#dcfce7] text-[#16a34a] border-[#bbf7d0]">{value}</Badge>;
    }
    if (val === "inactiva" || val === "inactivo" || val === "cancelada") {
      return <Badge className="bg-[#fee2e2] text-[#dc2626] border-[#fecaca]">{value}</Badge>;
    }
    if (val === "pendiente" || val === "en_preparacion" || val === "en preparación") {
      return <Badge className="bg-[#fef3c7] text-[#d97706] border-[#fde68a]">{value}</Badge>;
    }
    return <Badge variant="neutral">{value}</Badge>;
  }

  // 7. Rol
  if (key === "rol" && typeof value === "string") {
    if (value === "admin") return <Badge variant="dark">Administrador</Badge>;
    if (value === "cocina") return <Badge className="bg-[#fef3c7] text-[#b45309] border-[#fde68a]">Cocina</Badge>;
    if (value === "cliente") return <Badge variant="neutral">Cliente</Badge>;
    return <Badge variant="neutral">{value}</Badge>;
  }

  // 8. Timestamps reales con fecha y hora completa
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      if (value.includes("T")) {
        return (
          <span className="font-medium text-[#1d1d1f]">
            {d.toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" })} a las{" "}
            {d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
          </span>
        );
      }
      return (
        <span className="font-medium text-[#1d1d1f]">
          {d.toLocaleDateString("es-CO", { timeZone: "UTC", year: "numeric", month: "long", day: "numeric" })}
        </span>
      );
    }
  }

  // 9. Booleanos
  if (typeof value === "boolean") {
    return value ? (
      <Badge className="bg-[#dcfce7] text-[#16a34a] border-[#bbf7d0]">Sí</Badge>
    ) : (
      <Badge className="bg-[#fee2e2] text-[#dc2626] border-[#fecaca]">No</Badge>
    );
  }

  // 10. Objetos anidados
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (obj.titulo) return <span className="font-medium text-[#1d1d1f]">{String(obj.titulo)}</span>;
    if (obj.nombre) return <span className="font-medium text-[#1d1d1f]">{String(obj.nombre)}</span>;
    return <span className="font-mono text-[11px] text-[#6e6e73]">{JSON.stringify(value)}</span>;
  }

  return <span className="font-medium text-[#1d1d1f]">{String(value)}</span>;
}

function getFieldChanges(
  anterior: AuditoriaSnapshot | null,
  nuevo: AuditoriaSnapshot | null
): FieldChange[] {
  if (!anterior || !nuevo) return [];

  const allKeys = Array.from(new Set([...Object.keys(anterior), ...Object.keys(nuevo)]));
  const changes: FieldChange[] = [];

  for (const key of allKeys) {
    if (IGNORED_FIELDS.has(key)) continue;

    const valA = anterior[key];
    const valN = nuevo[key];

    const isDifferent =
      typeof valA === "object" || typeof valN === "object"
        ? JSON.stringify(valA) !== JSON.stringify(valN)
        : valA !== valN;

    if (isDifferent) {
      changes.push({
        key,
        label: FIELD_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1),
        valorAnterior: valA,
        valorNuevo: valN,
      });
    }
  }

  return changes;
}

function getEntityProperties(
  data: AuditoriaSnapshot | null
): Array<{ key: string; label: string; value: unknown }> {
  if (!data) return [];
  const entries: Array<{ key: string; label: string; value: unknown }> = [];

  for (const [key, value] of Object.entries(data)) {
    if (IGNORED_FIELDS.has(key)) continue;
    if (value === null || value === undefined) continue;

    entries.push({
      key,
      label: FIELD_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1),
      value,
    });
  }

  return entries;
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

  const isCreacion = log.accion.toUpperCase() === "CREAR" || (!log.valorAnterior && Boolean(log.valorNuevo));
  const isEliminacion = log.accion.toUpperCase() === "ELIMINAR" || (Boolean(log.valorAnterior) && !log.valorNuevo);
  const changes = getFieldChanges(log.valorAnterior, log.valorNuevo);

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

        {/* Contexto especial de Cocina si aplica */}
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
                  <span>{formatFieldValue("estado", log.valorAnterior?.estado ?? "Pendiente")}</span>
                  <ArrowRight className="w-3 h-3 text-[#d97706]" />
                  <span>{formatFieldValue("estado", log.valorNuevo?.estado ?? "Actualizado")}</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECCIÓN PRINCIPAL: CAMBIOS FORMATEADOS DE FORMA HUMANA (NO JSON) */}
        {/* ============================================================== */}

        {/* CASO 1: MODIFICACIÓN CON DIFERENCIAS ESPECÍFICAS */}
        {!isCreacion && !isEliminacion && changes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-semibold text-[#1d1d1f] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0071e3]" />
                <span>
                  Modificaciones Registradas ({changes.length} {changes.length === 1 ? "cambio" : "cambios"})
                </span>
              </div>
              <span className="text-[11px] text-[#86868b]">Solo se muestran los campos que cambiaron</span>
            </div>

            <div className="divide-y divide-[#e5e5ea] border border-[#e5e5ea] rounded-appleLg overflow-hidden bg-white shadow-sm">
              {changes.map((change) => (
                <div key={change.key} className="p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center hover:bg-[#fbfbfd] transition-colors">
                  {/* Etiqueta del Campo */}
                  <div className="md:col-span-4">
                    <span className="text-[13px] font-semibold text-[#1d1d1f] block">
                      {change.label}
                    </span>
                    <span className="text-[11px] font-mono text-[#86868b]">{change.key}</span>
                  </div>

                  {/* Transición Visual */}
                  <div className="md:col-span-8 flex flex-wrap items-center gap-2 sm:gap-3">
                    {/* Valor Anterior */}
                    <div className="flex-1 min-w-[130px] p-2.5 rounded-appleMd bg-[#fff5f5] border border-[#fecaca] text-[13px]">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#dc2626] block mb-1">
                        Valor anterior
                      </span>
                      <div className="text-[#1d1d1f]">
                        {formatFieldValue(change.key, change.valorAnterior)}
                      </div>
                    </div>

                    {/* Flecha */}
                    <div className="flex-shrink-0 text-[#86868b]">
                      <ArrowRight className="w-4 h-4 text-[#0071e3]" />
                    </div>

                    {/* Valor Nuevo */}
                    <div className="flex-1 min-w-[130px] p-2.5 rounded-appleMd bg-[#f0fdf4] border border-[#bbf7d0] text-[13px]">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#16a34a] block mb-1">
                        Nuevo valor
                      </span>
                      <div className="text-[#1d1d1f]">
                        {formatFieldValue(change.key, change.valorNuevo)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CASO 2: MODIFICACIÓN SIN DIFERENCIAS TOP-LEVEL DETECTADAS */}
        {!isCreacion && !isEliminacion && changes.length === 0 && (
          <div className="p-4 bg-[#fbfbfd] border border-[#e5e5ea] rounded-appleLg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#16a34a] flex-shrink-0" />
            <div className="text-[13px] text-[#1d1d1f]">
              <span className="font-semibold block">Sin cambios directos en los atributos</span>
              <span className="text-[#6e6e73]">
                La entidad fue confirmada o actualizada sin alterar los campos principales registrados.
              </span>
            </div>
          </div>
        )}

        {/* CASO 3: CREACIÓN DE ENTIDAD */}
        {isCreacion && (
          <div className="space-y-3">
            <div className="text-[13px] font-semibold text-[#1d1d1f] flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-[#16a34a]" />
              <span>Valores Iniciales del Elemento Creado</span>
            </div>

            <div className="border border-[#e5e5ea] rounded-appleLg overflow-hidden bg-white shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 divide-[#e5e5ea]">
                {getEntityProperties(log.valorNuevo).map((prop, idx) => (
                  <div
                    key={prop.key}
                    className={`p-3.5 flex flex-col justify-between gap-1 border-b border-[#e5e5ea] ${
                      idx % 2 === 0 ? "sm:border-r" : ""
                    } hover:bg-[#fbfbfd] transition-colors`}
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
                      {prop.label}
                    </span>
                    <div className="text-[13px]">
                      {formatFieldValue(prop.key, prop.value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CASO 4: ELIMINACIÓN DE ENTIDAD */}
        {isEliminacion && (
          <div className="space-y-3">
            <div className="text-[13px] font-semibold text-[#dc2626] flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-[#dc2626]" />
              <span>Datos del Elemento que fue Eliminado</span>
            </div>

            <div className="border border-[#fecaca] rounded-appleLg overflow-hidden bg-[#fffdfd] shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 divide-[#fecaca]">
                {getEntityProperties(log.valorAnterior).map((prop, idx) => (
                  <div
                    key={prop.key}
                    className={`p-3.5 flex flex-col justify-between gap-1 border-b border-[#fecaca] ${
                      idx % 2 === 0 ? "sm:border-r" : ""
                    }`}
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
                      {prop.label}
                    </span>
                    <div className="text-[13px]">
                      {formatFieldValue(prop.key, prop.value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Metadatos adicionales formateados limpiamente */}
        {log.metadata && log.entidad !== "OrdenCocina" && (
          <div className="p-4 bg-white border border-[#e5e5ea] rounded-appleLg shadow-sm space-y-2">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-[#86868b]">
              <Tag className="w-3.5 h-3.5 text-[#0071e3]" />
              <span>Información Contextual (Metadatos)</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {Object.entries(log.metadata).map(([k, v]) => (
                <div
                  key={k}
                  className="px-3 py-1.5 bg-[#f5f5f7] border border-[#e5e5ea] rounded-appleMd text-[12px] flex items-center gap-1.5"
                >
                  <span className="font-semibold text-[#6e6e73]">{FIELD_LABELS[k] || k}:</span>
                  <span className="text-[#1d1d1f] font-medium">{formatFieldValue(k, v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VISTA TÉCNICA EN JSON (Colapsada por defecto para admins)      */}
        {/* ============================================================== */}
        <details className="pt-2 border-t border-[#e5e5ea] text-[12px] group">
          <summary className="text-[#86868b] hover:text-[#1d1d1f] cursor-pointer font-medium flex items-center gap-1.5 select-none transition-colors py-1">
            <Code className="w-3.5 h-3.5 text-[#86868b] group-hover:text-[#0071e3]" />
            <span>Ver detalles técnicos en formato JSON (para desarrolladores)</span>
          </summary>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase text-[#86868b] block">JSON Valor Anterior</span>
              <pre className="text-[11px] bg-[#f5f5f7] p-3 rounded-appleMd overflow-x-auto text-[#1d1d1f] font-mono leading-relaxed border border-[#e5e5ea] max-h-48">
                {log.valorAnterior ? JSON.stringify(log.valorAnterior, null, 2) : "null"}
              </pre>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase text-[#86868b] block">JSON Valor Nuevo</span>
              <pre className="text-[11px] bg-[#f5f5f7] p-3 rounded-appleMd overflow-x-auto text-[#1d1d1f] font-mono leading-relaxed border border-[#e5e5ea] max-h-48">
                {log.valorNuevo ? JSON.stringify(log.valorNuevo, null, 2) : "null"}
              </pre>
            </div>
          </div>
        </details>
      </div>
    </Modal>
  );
}
