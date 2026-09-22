import { AlertCircle } from "lucide-react";
import { Spinner } from "../../../shared/components/Spinner";
import { Button } from "../../../shared/components/Button";

interface AdminLoadingStateProps {
  message?: string;
}

export function AdminLoadingState({ message = "Cargando datos del panel..." }: Readonly<AdminLoadingStateProps>) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
      <Spinner size="md" />
      <p className="text-[13px] text-[#86868b]">{message}</p>
    </div>
  );
}

interface AdminErrorStateProps {
  title?: string;
  description?: string;
  onRetry: () => void;
}

export function AdminErrorState({
  title = "Error al sincronizar datos",
  description = "No se pudo comunicar con el servidor para obtener los registros actualizados.",
  onRetry,
}: Readonly<AdminErrorStateProps>) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-applePill bg-red-50 flex items-center justify-center text-red-500 mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h2 className="text-lg font-bold text-[#1d1d1f] mb-1">{title}</h2>
      <p className="text-[13px] text-[#86868b] max-w-md mb-5">{description}</p>
      <Button variant="primary" size="sm" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  );
}
