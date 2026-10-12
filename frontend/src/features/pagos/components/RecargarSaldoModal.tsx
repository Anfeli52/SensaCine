import React, { useState } from "react";
import { Modal } from "../../../shared/components/Modal";
import { Button } from "../../../shared/components/Button";
import { useActualizarSaldo } from "../hooks/useTarjetas";
import { Tarjeta } from "../types";
import { DollarSign, Plus } from "lucide-react";

interface RecargarSaldoModalProps {
  tarjeta: Tarjeta | null;
  isOpen: boolean;
  onClose: () => void;
  montoFaltante?: number;
}

const formatCOP = (val: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(val);

export const RecargarSaldoModal: React.FC<RecargarSaldoModalProps> = ({
  tarjeta,
  isOpen,
  onClose,
  montoFaltante,
}) => {
  const [nuevoSaldo, setNuevoSaldo] = useState<number>(() =>
    tarjeta ? Number(tarjeta.saldo) : 100000
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const actualizarSaldoMutation = useActualizarSaldo();

  React.useEffect(() => {
    if (tarjeta) {
      const saldoActual = Number(tarjeta.saldo);
      if (montoFaltante && montoFaltante > 0) {
        setNuevoSaldo(saldoActual + montoFaltante);
      } else {
        setNuevoSaldo(saldoActual);
      }
    }
  }, [tarjeta, montoFaltante, isOpen]);

  if (!tarjeta) return null;

  const saldoActual = Number(tarjeta.saldo);

  const handleAgregarMonto = (adicional: number) => {
    setNuevoSaldo((prev) => prev + adicional);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (nuevoSaldo < 0) {
      setErrorMsg("El saldo no puede ser negativo.");
      return;
    }

    try {
      await actualizarSaldoMutation.mutateAsync({
        id: tarjeta.id,
        input: { nuevoSaldo: Number(nuevoSaldo) },
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Error al actualizar el saldo.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modificar Saldo Simulado"
      maxWidth="md"
    >
      <form onSubmit={handleGuardar} className="space-y-5">
        {errorMsg && (
          <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-appleMd">
            {errorMsg}
          </div>
        )}

        {/* Tarjeta Actual */}
        <div className="p-3.5 bg-[#fafafc] border border-[#e5e5ea] rounded-appleMd flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-[#1d1d1f] block">
              {tarjeta.franquicia} ·••• {tarjeta.numeroTarjeta.slice(-4)}
            </span>
            <span className="text-[#86868b]">{tarjeta.titular}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#86868b] uppercase block">Saldo Actual</span>
            <span className="font-semibold text-sm text-[#1d1d1f]">
              {formatCOP(saldoActual)}
            </span>
          </div>
        </div>

        {/* Notificación si falta saldo para pagar */}
        {montoFaltante && montoFaltante > 0 && (
          <div className="p-3 rounded-appleMd bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <p>
              <strong>Sugerencia de recarga:</strong> Te faltaban{" "}
              <strong className="text-amber-800">{formatCOP(montoFaltante)}</strong> para completar la reserva.
            </p>
          </div>
        )}

        {/* Input de Nuevo Saldo */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#1d1d1f] flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-[#0071e3]" />
            Nuevo Saldo Simulado
          </label>
          <input
            type="number"
            min={0}
            step={5000}
            value={nuevoSaldo}
            onChange={(e) => setNuevoSaldo(Number(e.target.value))}
            className="w-full font-mono text-lg font-bold rounded-appleMd border border-[#d2d2d7] bg-white px-4 py-2.5 text-[#1d1d1f] outline-none transition-all focus:border-[#0071e3] focus:ring-3 focus:ring-[#0071e3]/15"
          />
        </div>

        {/* Botones de incremento rápido */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-[#86868b] block font-medium">
            Sumar fondos rápidamente:
          </span>
          <div className="flex flex-wrap gap-2">
            {[20000, 50000, 100000, 200000].map((inc) => (
              <button
                key={inc}
                type="button"
                onClick={() => handleAgregarMonto(inc)}
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-applePill border border-[#e5e5ea] bg-[#fafafc] hover:bg-white hover:border-[#0071e3] text-[#1d1d1f] transition-all font-medium"
              >
                <Plus className="w-3 h-3 text-[#0071e3]" />
                +{formatCOP(inc)}
              </button>
            ))}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f0f0f0]">
          <Button variant="secondary" size="sm" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            isLoading={actualizarSaldoMutation.isPending}
            className="px-6"
          >
            Guardar Saldo
          </Button>
        </div>
      </form>
    </Modal>
  );
};
