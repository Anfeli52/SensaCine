import { CheckCircle2, AlertCircle } from "lucide-react";

export interface BannerAlertData {
  type: "success" | "error";
  message: string;
}

interface AdminBannerAlertProps {
  alert: BannerAlertData | null;
  onClose: () => void;
}

export function AdminBannerAlert({ alert, onClose }: Readonly<AdminBannerAlertProps>) {
  if (!alert) return null;

  return (
    <div
      className={`mb-6 p-4 rounded-appleLg border flex items-center justify-between gap-3 text-[13px] transition-all ${
        alert.type === "success"
          ? "bg-emerald-50/90 border-emerald-200 text-emerald-800"
          : "bg-red-50/90 border-red-200 text-red-800"
      }`}
    >
      <div className="flex items-center gap-2.5">
        {alert.type === "success" ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        ) : (
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
        )}
        <span>{alert.message}</span>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-[11px] font-semibold uppercase tracking-wider hover:opacity-75"
      >
        Cerrar
      </button>
    </div>
  );
}
