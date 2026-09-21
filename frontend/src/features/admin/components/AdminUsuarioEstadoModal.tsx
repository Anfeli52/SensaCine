import { AlertTriangle, X, UserX } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { UsuarioAdmin } from "../types/usuario.types";

interface AdminUsuarioEstadoModalProps {
  usuario: UsuarioAdmin | null;
  isUpdating: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AdminUsuarioEstadoModal({
  usuario,
  isUpdating,
  onConfirm,
  onCancel,
}: Readonly<AdminUsuarioEstadoModalProps>) {
  if (!usuario) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onCancel}
      />

      <div className="relative w-full max-w-md bg-white rounded-appleXl shadow-2xl border border-[#e5e5ea] overflow-hidden">
        <div className="flex items-start justify-between p-5 border-b border-[#f0f0f0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-applePill bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>

            <div>
              <h2 className="text-[16px] font-semibold text-[#1d1d1f]">
                Desactivar cuenta
              </h2>
              <p className="text-[12px] text-[#86868b] mt-0.5">
                Esta acción cambiará el estado de la cuenta.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-applePill flex items-center justify-center text-[#86868b] hover:bg-[#f5f5f7] hover:text-[#1d1d1f] transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-3 p-3.5 bg-[#f5f5f7] rounded-appleMd">
            <div className="w-10 h-10 rounded-applePill bg-white border border-[#e5e5ea] flex items-center justify-center">
              <UserX className="w-4 h-4 text-[#86868b]" />
            </div>

            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[#1d1d1f] truncate">
                {usuario.nombre}
              </p>
              <p className="text-[11px] text-[#86868b] truncate">
                {usuario.email}
              </p>
            </div>
          </div>

          <p className="text-[13px] text-[#6e6e73] leading-relaxed mt-4">
            ¿Estás seguro de que deseas desactivar esta cuenta? El usuario no
            podrá utilizar su cuenta mientras permanezca inactiva.
          </p>
        </div>

        <div className="flex justify-end gap-2 p-5 pt-0">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCancel}
            disabled={isUpdating}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onConfirm}
            disabled={isUpdating}
            className="bg-red-50 hover:bg-red-100 text-red-600 border-transparent"
          >
            <UserX className="w-3.5 h-3.5 mr-1.5" />
            {isUpdating ? "Desactivando..." : "Desactivar cuenta"}
          </Button>
        </div>
      </div>
    </div>
  );
}

