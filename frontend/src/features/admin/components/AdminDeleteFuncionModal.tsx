import { Modal } from "../../../shared/components/Modal";
import { Button } from "../../../shared/components/Button";
import { Funcion } from "../types/programacion.types";
import { Trash2, AlertTriangle } from "lucide-react";

interface AdminDeleteFuncionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  funcion: Funcion | null;
  isLoading?: boolean;
}

export function AdminDeleteFuncionModal({
  isOpen,
  onClose,
  onConfirm,
  funcion,
  isLoading = false,
}: Readonly<AdminDeleteFuncionModalProps>) {
  if (!funcion) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Eliminación de Función"
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3.5 p-4 rounded-appleLg bg-red-50/80 border border-red-100 text-red-900">
          <div className="p-2 bg-red-100 rounded-appleMd text-red-600 flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[14px] font-semibold text-red-950">
              ¿Deseas eliminar esta función programada?
            </h4>
            <div className="text-[12px] text-red-800/90 mt-1 leading-relaxed">
              <p><span>Película: </span><strong className="font-semibold text-red-950">"{funcion.pelicula?.titulo}"</strong></p>
              <p><span>Sala: </span><strong>{funcion.sala?.nombre}</strong></p>
              <p><span>Horario: </span><strong>{funcion.fecha.split("T")[0]} ({funcion.horaInicio} - {funcion.horaFin})</strong></p>
            </div>
          </div>
        </div>

        <p className="text-[12px] text-[#86868b] leading-relaxed">
          <span>Nota: Si la función ya tiene reservas asociadas por clientes, el sistema no permitirá eliminarla por integridad de los pagos; en su lugar podrás cambiar su estado a </span>
          <strong>Cancelada</strong>.
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f0f0f0]">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="text-[13px] px-4"
          >
            Volver
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            onClick={onConfirm}
            className="text-[13px] px-4 bg-red-600 hover:bg-red-700 text-white"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Eliminar Función
          </Button>
        </div>
      </div>
    </Modal>
  );
}
