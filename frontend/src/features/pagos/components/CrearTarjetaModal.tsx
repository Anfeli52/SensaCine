import React, { useState } from "react";
import { Modal } from "../../../shared/components/Modal";
import { Button } from "../../../shared/components/Button";
import { useCrearTarjeta } from "../hooks/useTarjetas";
import { CreditCard, DollarSign } from "lucide-react";

interface CrearTarjetaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CrearTarjetaModal: React.FC<CrearTarjetaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [numeroTarjeta, setNumeroTarjeta] = useState("");
  const [titular, setTitular] = useState("");
  const [fechaExpiracion, setFechaExpiracion] = useState("");
  const [tipo, setTipo] = useState("Crédito");
  const [franquicia, setFranquicia] = useState("Visa");
  const [saldo, setSaldo] = useState(150000);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const crearTarjetaMutation = useCrearTarjeta();

  // Formatear automáticamente el número en bloques de 4
  const handleNumeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
    setNumeroTarjeta(formatted);

    // Detección automática simple de franquicia
    if (raw.startsWith("4")) setFranquicia("Visa");
    else if (raw.startsWith("5")) setFranquicia("Mastercard");
    else if (raw.startsWith("3")) setFranquicia("Amex");
  };

  // Formatear fecha MM/YY
  const handleExpiracionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setFechaExpiracion(raw);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numLimpio = numeroTarjeta.replace(/\s+/g, "");
    if (numLimpio.length < 13 || numLimpio.length > 19) {
      setErrorMsg("El número de tarjeta debe tener entre 13 y 16 dígitos.");
      return;
    }

    if (!titular.trim() || titular.trim().length < 3) {
      setErrorMsg("El nombre del titular debe tener al menos 3 caracteres.");
      return;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(fechaExpiracion)) {
      setErrorMsg("La fecha de expiración debe tener formato MM/AA (ej. 12/28).");
      return;
    }

    if (saldo < 0) {
      setErrorMsg("El saldo inicial no puede ser negativo.");
      return;
    }

    try {
      await crearTarjetaMutation.mutateAsync({
        numeroTarjeta: numLimpio,
        titular: titular.trim(),
        fechaExpiracion,
        tipo,
        franquicia,
        saldo: Number(saldo),
      });

      // Limpiar y cerrar
      setNumeroTarjeta("");
      setTitular("");
      setFechaExpiracion("");
      setSaldo(150000);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Error al registrar la tarjeta.");
    }
  };

  const presetsSaldo = [50000, 100000, 200000, 500000];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Agregar Tarjeta de Pago" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMsg && (
          <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-appleMd">
            {errorMsg}
          </div>
        )}

        {/* Número de Tarjeta */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#1d1d1f]">
            Número de tarjeta <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              placeholder="4532 1234 5678 9012"
              value={numeroTarjeta}
              onChange={handleNumeroChange}
              className="w-full font-mono rounded-appleMd border border-[#d2d2d7] bg-[#fafafc] px-4 py-2.5 text-sm text-[#1d1d1f] outline-none transition-all placeholder:text-[#a1a1a6] focus:bg-white focus:border-[#0071e3] focus:ring-3 focus:ring-[#0071e3]/15"
            />
            <CreditCard className="w-4 h-4 text-[#86868b] absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Titular de la Tarjeta */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#1d1d1f]">
            Nombre del titular (como aparece en la tarjeta) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ej. CARLOS MENDOZA"
            value={titular}
            onChange={(e) => setTitular(e.target.value.toUpperCase())}
            className="w-full uppercase font-medium rounded-appleMd border border-[#d2d2d7] bg-[#fafafc] px-4 py-2.5 text-sm text-[#1d1d1f] outline-none transition-all placeholder:text-[#a1a1a6] focus:bg-white focus:border-[#0071e3] focus:ring-3 focus:ring-[#0071e3]/15"
          />
        </div>

        {/* Fila: Expiración, Franquicia y Tipo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#1d1d1f]">
              Expiración (MM/AA) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="12/28"
              value={fechaExpiracion}
              onChange={handleExpiracionChange}
              className="w-full font-mono rounded-appleMd border border-[#d2d2d7] bg-[#fafafc] px-3.5 py-2.5 text-sm text-[#1d1d1f] outline-none transition-all placeholder:text-[#a1a1a6] focus:bg-white focus:border-[#0071e3] focus:ring-3 focus:ring-[#0071e3]/15"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#1d1d1f]">Franquicia</label>
            <select
              value={franquicia}
              onChange={(e) => setFranquicia(e.target.value)}
              className="w-full rounded-appleMd border border-[#d2d2d7] bg-[#fafafc] px-3 py-2.5 text-sm text-[#1d1d1f] outline-none transition-all focus:bg-white focus:border-[#0071e3]"
            >
              <option value="Visa">Visa</option>
              <option value="Mastercard">Mastercard</option>
              <option value="Amex">American Express</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#1d1d1f]">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full rounded-appleMd border border-[#d2d2d7] bg-[#fafafc] px-3 py-2.5 text-sm text-[#1d1d1f] outline-none transition-all focus:bg-white focus:border-[#0071e3]"
            >
              <option value="Crédito">Crédito</option>
              <option value="Débito">Débito</option>
            </select>
          </div>
        </div>

        {/* Saldo Inicial Simulado */}
        <div className="p-4 rounded-appleLg bg-[#f5f9ff] border border-blue-100 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-[#0071e3] flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              Saldo Inicial Simulado (Pasarela SensaCine)
            </label>
            <span className="text-[11px] text-[#86868b]">Simula fondos en tu tarjeta</span>
          </div>

          <input
            type="number"
            min={0}
            step={10000}
            value={saldo}
            onChange={(e) => setSaldo(Number(e.target.value))}
            className="w-full font-mono text-base font-semibold rounded-appleMd border border-[#d2d2d7] bg-white px-3.5 py-2 text-[#1d1d1f] outline-none focus:border-[#0071e3]"
          />

          <div className="flex flex-wrap gap-2">
            {presetsSaldo.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setSaldo(preset)}
                className={`text-xs px-2.5 py-1 rounded-applePill border transition-all ${
                  saldo === preset
                    ? "bg-[#0071e3] text-white border-[#0071e3]"
                    : "bg-white text-[#6e6e73] border-[#d2d2d7] hover:border-[#0071e3]"
                }`}
              >
                ${preset.toLocaleString("es-CO")}
              </button>
            ))}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f0f0f0]">
          <Button variant="secondary" size="sm" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            isLoading={crearTarjetaMutation.isPending}
            className="px-6"
          >
            Guardar Tarjeta
          </Button>
        </div>
      </form>
    </Modal>
  );
};
