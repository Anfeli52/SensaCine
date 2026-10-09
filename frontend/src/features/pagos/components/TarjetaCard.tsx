import React from "react";
import { Edit3, Trash2, CheckCircle2, Wifi } from "lucide-react";
import { Tarjeta } from "../types";

interface TarjetaCardProps {
  tarjeta: Tarjeta;
  isSelected?: boolean;
  onSelect?: () => void;
  onEditarSaldo?: () => void;
  onEliminar?: () => void;
  montoRequerido?: number;
}

const formatCOP = (val: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(val);

export const TarjetaCard: React.FC<TarjetaCardProps> = ({
  tarjeta,
  isSelected = false,
  onSelect,
  onEditarSaldo,
  onEliminar,
  montoRequerido,
}) => {
  const saldoNum = Number(tarjeta.saldo);
  const esSuficiente = montoRequerido ? saldoNum >= montoRequerido : true;

  // Enmascarar número mostrando solo los últimos 4 dígitos
  const ultimos4 = tarjeta.numeroTarjeta.replace(/\s+/g, "").slice(-4) || "••••";

  // Estilos y paletas según franquicia
  const getEstiloFranquicia = (franquicia: string) => {
    switch (franquicia.toLowerCase()) {
      case "mastercard":
        return {
          bg: "bg-gradient-to-br from-[#1a1a22] via-[#2a1b24] to-[#141418]",
          accent: "text-amber-400",
          logo: (
            <div className="flex items-center -space-x-2">
              <span className="w-5 h-5 rounded-full bg-red-500/90 inline-block shadow-sm" />
              <span className="w-5 h-5 rounded-full bg-amber-400/90 inline-block shadow-sm" />
            </div>
          ),
        };
      case "amex":
        return {
          bg: "bg-gradient-to-br from-[#0c2340] via-[#12365c] to-[#0a1826]",
          accent: "text-cyan-300",
          logo: (
            <span className="text-[11px] font-black tracking-widest text-cyan-200 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-400/40">
              AMEX
            </span>
          ),
        };
      case "visa":
      default:
        return {
          bg: "bg-gradient-to-br from-[#071d3d] via-[#0b3366] to-[#041224]",
          accent: "text-blue-300",
          logo: (
            <span className="text-sm font-black italic tracking-wider text-white drop-shadow-sm">
              VISA
            </span>
          ),
        };
    }
  };

  const estilo = getEstiloFranquicia(tarjeta.franquicia);

  return (
    <div
      onClick={onSelect}
      className={`relative group rounded-appleXl transition-all duration-200 cursor-pointer overflow-hidden border ${
        isSelected
          ? "ring-2 ring-[#0071e3] border-transparent shadow-lg scale-[1.01]"
          : "border-[#e5e5ea] hover:border-[#0071e3]/50 hover:shadow-md"
      }`}
    >
      {/* Tarjeta Visual Física */}
      <div
        className={`p-4 sm:p-5 text-white ${estilo.bg} relative min-h-[175px] sm:min-h-[185px] flex flex-col justify-between shadow-inner select-none`}
      >
        {/* Textura de micro-puntos de fondo */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:14px_14px] pointer-events-none" />

        {/* Badge Flotante Superior: Seleccionada */}
        {isSelected && (
          <div className="absolute top-3 right-3 z-30 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-[#0071e3] shadow-md border border-white/60 text-[11px] font-bold tracking-wide animate-in fade-in duration-150">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0071e3]" />
            <span>Seleccionada</span>
          </div>
        )}

        {/* Top: Chip, Contactless y Franquicia */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            {/* Chip EMV */}
            <div className="w-8 h-6.5 rounded bg-gradient-to-tr from-amber-300 via-amber-200 to-yellow-500 border border-amber-400/60 shadow-xs flex items-center justify-center relative overflow-hidden">
              <div className="w-full h-[1px] bg-amber-700/40 absolute" />
              <div className="h-full w-[1px] bg-amber-700/40 absolute" />
            </div>
            {/* Contactless */}
            <Wifi className="w-3.5 h-3.5 text-white/60 rotate-90" />
          </div>

          {/* Logo y Tipo si no está seleccionada, o desplazado si está seleccionada */}
          <div className={`flex items-center gap-2 ${isSelected ? "mr-24" : ""}`}>
            <span className="text-[10px] font-medium text-white/70 uppercase tracking-wider">
              {tarjeta.tipo}
            </span>
            {estilo.logo}
          </div>
        </div>

        {/* Center: Número de Tarjeta */}
        <div className="my-2.5 relative z-10">
          <p className="font-mono text-[15px] sm:text-base tracking-[0.2em] text-white/90 drop-shadow-sm flex items-center gap-2">
            <span>••••</span>
            <span>••••</span>
            <span>••••</span>
            <span className="font-bold text-white tracking-widest">{ultimos4}</span>
          </p>
        </div>

        {/* Bottom: Titular y Expiración */}
        <div className="flex items-end justify-between relative z-10 pt-1 text-xs gap-3">
          <div className="min-w-0 flex-1">
            <span className="block text-[9px] uppercase tracking-wider text-white/60">
              Titular de la tarjeta
            </span>
            <span className="font-medium tracking-wide uppercase truncate block text-white/95 text-[11px] sm:text-xs">
              {tarjeta.titular}
            </span>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="block text-[9px] uppercase tracking-wider text-white/60">
              Expira
            </span>
            <span className="font-mono font-medium text-white/95 text-[11px] sm:text-xs">
              {tarjeta.fechaExpiracion}
            </span>
          </div>
        </div>
      </div>

      {/* Barra Inferior: Saldo y Acciones */}
      <div
        className={`px-3.5 py-2.5 border-t flex items-center justify-between gap-2 text-xs transition-colors ${
          isSelected
            ? "bg-blue-50/70 border-blue-100"
            : "bg-[#fafafc] border-[#f0f0f0]"
        }`}
      >
        {/* Saldo Disponible */}
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          <span className="text-[#86868b] font-medium text-[11px]">Saldo:</span>
          <span
            className={`font-bold text-xs sm:text-sm whitespace-nowrap ${
              montoRequerido && !esSuficiente
                ? "text-red-600"
                : "text-emerald-700"
            }`}
          >
            {formatCOP(saldoNum)}
          </span>
          {montoRequerido && !esSuficiente && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-red-600 bg-red-100 border border-red-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">
              Insuficiente
            </span>
          )}
        </div>

        {/* Acciones */}
        <div
          className="flex items-center gap-1 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {onEditarSaldo && (
            <button
              type="button"
              onClick={onEditarSaldo}
              className="p-1.5 text-[#6e6e73] hover:text-[#0071e3] hover:bg-white rounded-appleMd border border-transparent hover:border-[#e5e5ea] transition-all"
              title="Recargar o modificar saldo simulado"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          {onEliminar && (
            <button
              type="button"
              onClick={onEliminar}
              className="p-1.5 text-[#6e6e73] hover:text-red-600 hover:bg-white rounded-appleMd border border-transparent hover:border-[#e5e5ea] transition-all"
              title="Eliminar tarjeta"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
