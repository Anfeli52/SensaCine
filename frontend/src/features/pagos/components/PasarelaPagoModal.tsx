import React, { useState, useEffect } from "react";
import { Modal } from "../../../shared/components/Modal";
import { Button } from "../../../shared/components/Button";
import { Spinner } from "../../../shared/components/Spinner";
import { useTarjetas, useEliminarTarjeta } from "../hooks/useTarjetas";
import { Tarjeta, ResultadoPago } from "../types";
import { TarjetaCard } from "./TarjetaCard";
import { CrearTarjetaModal } from "./CrearTarjetaModal";
import { RecargarSaldoModal } from "./RecargarSaldoModal";
import { 
  CreditCard, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Film, 
  Receipt, 
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PasarelaPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalPagar: number;
  peliculaTitulo: string;
  /**
   * Cobra la tarjeta elegida Y crea la reserva (una sola operación en el servidor).
   * Si lanza, el modal muestra el mensaje de error del backend y no se cobra nada.
   */
  onConfirmarPago: (idTarjeta: number) => Promise<ResultadoPago & { idReserva?: number }>;
  detallesCompra?: {
    fecha: string;
    hora: string;
    sala: string;
    asientosCount: number;
  };
}

const formatCOP = (val: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(val);

export const PasarelaPagoModal: React.FC<PasarelaPagoModalProps> = ({
  isOpen,
  onClose,
  totalPagar,
  peliculaTitulo,
  onConfirmarPago,
  detallesCompra,
}) => {
  const navigate = useNavigate();
  const { data: tarjetas = [], isLoading, isError, refetch } = useTarjetas();
  const eliminarTarjetaMutation = useEliminarTarjeta();

  const [selectedTarjetaId, setSelectedTarjetaId] = useState<number | null>(null);
  const [isCrearModalOpen, setIsCrearModalOpen] = useState(false);
  const [isRecargarModalOpen, setIsRecargarModalOpen] = useState(false);
  const [tarjetaParaRecargar, setTarjetaParaRecargar] = useState<Tarjeta | null>(null);

  const [resultadoPago, setResultadoPago] = useState<(ResultadoPago & { idReserva?: number }) | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [errorPago, setErrorPago] = useState<string | null>(null);

  // Auto-seleccionar primera tarjeta disponible si no hay una seleccionada
  useEffect(() => {
    if (tarjetas.length > 0 && !selectedTarjetaId) {
      setSelectedTarjetaId(tarjetas[0].id);
    }
  }, [tarjetas, selectedTarjetaId]);

  // Resetear estados al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      setErrorPago(null);
      setResultadoPago(null);
    }
  }, [isOpen]);

  const selectedTarjeta = tarjetas.find((t) => t.id === selectedTarjetaId);
  const saldoActual = selectedTarjeta ? Number(selectedTarjeta.saldo) : 0;
  const esSaldoSuficiente = selectedTarjeta ? saldoActual >= totalPagar : false;
  const montoFaltante = selectedTarjeta && !esSaldoSuficiente ? totalPagar - saldoActual : 0;

  const handlePagar = async () => {
    if (!selectedTarjeta) return;
    setErrorPago(null);
    setIsPaying(true);

    try {
      setResultadoPago(await onConfirmarPago(selectedTarjeta.id));
    } catch (err: any) {
      const msg = err.response?.data?.error || "Error al procesar el pago.";
      setErrorPago(msg);
    } finally {
      setIsPaying(false);
    }
  };

  const handleFinalizarYSalir = () => {
    onClose();
    navigate("/");
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={resultadoPago ? "Comprobante de Pago" : "Pasarela de Pago (HU-12 & HU-13)"}
        maxWidth="2xl"
      >
        {/* VISTA 1: ÉXITO DE PAGO CON RECIBO */}
        {resultadoPago ? (
          <div className="space-y-6 text-center py-2 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-[#1d1d1f]">¡Reserva Confirmada!</h2>
              <p className="text-sm text-[#86868b]">
                {resultadoPago.idReserva
                  ? `Tu reserva #${resultadoPago.idReserva} quedó registrada y el pago fue aprobado.`
                  : "Tu transacción ha sido validada y procesada correctamente."}
              </p>
            </div>

            {/* Recibo Digital */}
            <div className="max-w-md mx-auto bg-[#fafafc] border border-[#e5e5ea] rounded-appleLg p-5 text-left space-y-3.5 shadow-xs text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#f0f0f0]">
                <span className="font-semibold text-sm text-[#1d1d1f] flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-[#0071e3]" />
                  Recibo Digital SensaCine
                </span>
                <span className="text-[11px] font-mono text-[#86868b]">
                  {resultadoPago.referenciaTransaccion}
                </span>
              </div>

              <div className="space-y-2 text-[#6e6e73]">
                <div className="flex justify-between">
                  <span>Película:</span>
                  <strong className="text-[#1d1d1f]">{peliculaTitulo}</strong>
                </div>

                {detallesCompra && (
                  <div className="flex justify-between">
                    <span>Entradas:</span>
                    <strong className="text-[#1d1d1f]">
                      {detallesCompra.asientosCount} {detallesCompra.asientosCount === 1 ? "butaca" : "butacas"} ({detallesCompra.sala})
                    </strong>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Monto debitado:</span>
                  <strong className="text-emerald-700 text-sm font-bold">
                    {formatCOP(resultadoPago.montoPagado)}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span>Medio de pago:</span>
                  <span className="text-[#1d1d1f] font-medium">
                    {selectedTarjeta?.franquicia} •••• {selectedTarjeta?.numeroTarjeta.slice(-4)}
                  </span>
                </div>

                <div className="flex justify-between pt-2 border-t border-[#f0f0f0]">
                  <span>Nuevo saldo en tarjeta:</span>
                  <strong className="text-[#1d1d1f] font-mono">
                    {formatCOP(resultadoPago.nuevoSaldo)}
                  </strong>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleFinalizarYSalir}
                className="px-8"
              >
                Volver a la Cartelera
              </Button>
            </div>
          </div>
        ) : (
          /* VISTA 2: SELECCIÓN DE MEDIO DE PAGO Y CONFIRMACIÓN */
          <div className="space-y-6">
            {/* Resumen del Monto a Pagar */}
            <div className="p-4 rounded-appleLg bg-[#fafafc] border border-[#e5e5ea] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-[#86868b] uppercase font-semibold tracking-wider block">
                  Total a Pagar
                </span>
                <span className="text-2xl font-bold text-[#0071e3]">
                  {formatCOP(totalPagar)}
                </span>
              </div>

              <div className="text-left sm:text-right text-xs text-[#6e6e73]">
                <div className="font-semibold text-[#1d1d1f] flex items-center gap-1.5 sm:justify-end">
                  <Film className="w-3.5 h-3.5 text-[#0071e3]" />
                  {peliculaTitulo}
                </div>
                {detallesCompra && (
                  <span>
                    {detallesCompra.asientosCount} butacas · {detallesCompra.sala}
                  </span>
                )}
              </div>
            </div>

            {/* Error de Pago si ocurre */}
            {errorPago && (
              <div className="p-3.5 rounded-appleMd bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="block font-semibold">No se pudo procesar el pago:</strong>
                  <span>{errorPago}</span>
                </div>
              </div>
            )}

            {/* Lista / Selector de Tarjetas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-[#1d1d1f] flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#0071e3]" />
                  Selecciona una Tarjeta Registrada
                </h4>

                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setIsCrearModalOpen(true)}
                  className="text-xs py-1 px-3"
                  leftIcon={<Plus className="w-3.5 h-3.5 text-[#0071e3]" />}
                >
                  Nueva Tarjeta
                </Button>
              </div>

              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <Spinner size="md" />
                  <p className="text-xs text-[#86868b]">Cargando tus tarjetas...</p>
                </div>
              ) : isError ? (
                <div className="p-6 text-center border border-red-200 rounded-appleMd bg-red-50 text-xs text-red-700">
                  <p className="mb-2">No se pudieron cargar tus tarjetas.</p>
                  <Button variant="secondary" size="sm" onClick={() => refetch()}>
                    Reintentar
                  </Button>
                </div>
              ) : tarjetas.length === 0 ? (
                /* Estado Vacío: Sin Tarjetas */
                <div className="py-10 px-4 text-center border-2 border-dashed border-[#d2d2d7] rounded-appleXl space-y-3 bg-[#fafafc]">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0071e3] flex items-center justify-center mx-auto">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-sm text-[#1d1d1f]">
                      No tienes tarjetas registradas
                    </h5>
                    <p className="text-xs text-[#86868b] max-w-sm mx-auto mt-0.5">
                      Crea tu primera tarjeta simulada con saldo recargable para pagar tus boletas.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    type="button"
                    onClick={() => setIsCrearModalOpen(true)}
                    className="px-5"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Registrar Tarjeta
                  </Button>
                </div>
              ) : (
                /* Grid de Tarjetas */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-1">
                  {tarjetas.map((tarjeta) => (
                    <TarjetaCard
                      key={tarjeta.id}
                      tarjeta={tarjeta}
                      isSelected={tarjeta.id === selectedTarjetaId}
                      onSelect={() => setSelectedTarjetaId(tarjeta.id)}
                      montoRequerido={totalPagar}
                      onEditarSaldo={() => {
                        setTarjetaParaRecargar(tarjeta);
                        setIsRecargarModalOpen(true);
                      }}
                      onEliminar={() => {
                        if (confirm(`¿Deseas eliminar la tarjeta ${tarjeta.franquicia} terminada en ${tarjeta.numeroTarjeta.slice(-4)}?`)) {
                          eliminarTarjetaMutation.mutate(tarjeta.id);
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Panel de Validación de Saldo de la Tarjeta Seleccionada */}
            {selectedTarjeta && (
              <div className="pt-2 border-t border-[#f0f0f0]">
                {!esSaldoSuficiente ? (
                  /* Saldo Insuficiente */
                  <div className="p-4 rounded-appleLg bg-amber-50/90 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="block font-semibold">
                          Saldo insuficiente en esta tarjeta
                        </strong>
                        <span className="text-amber-800">
                          Tu saldo disponible es <strong>{formatCOP(saldoActual)}</strong>. Te faltan{" "}
                          <strong className="text-red-700">{formatCOP(montoFaltante)}</strong>.
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      type="button"
                      onClick={() => {
                        setTarjetaParaRecargar(selectedTarjeta);
                        setIsRecargarModalOpen(true);
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white whitespace-nowrap text-xs self-end sm:self-auto"
                    >
                      Recargar Tarjeta
                    </Button>
                  </div>
                ) : (
                  /* Saldo Suficiente */
                  <div className="p-3.5 rounded-appleMd bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>
                        Saldo suficiente: Quedarán{" "}
                        <strong className="font-semibold text-emerald-800">
                          {formatCOP(saldoActual - totalPagar)}
                        </strong>{" "}
                        tras la compra.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Botones Finales */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f0f0f0]">
              <Button variant="secondary" size="md" type="button" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="md"
                type="button"
                disabled={!selectedTarjeta || !esSaldoSuficiente}
                isLoading={isPaying}
                onClick={handlePagar}
                className="px-7 bg-[#0071e3] hover:bg-[#0077ed]"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Pagar {formatCOP(totalPagar)}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modales Secundarios */}
      <CrearTarjetaModal
        isOpen={isCrearModalOpen}
        onClose={() => setIsCrearModalOpen(false)}
        onSuccess={() => {
          refetch();
        }}
      />

      <RecargarSaldoModal
        isOpen={isRecargarModalOpen}
        onClose={() => {
          setIsRecargarModalOpen(false);
          setTarjetaParaRecargar(null);
          refetch();
        }}
        tarjeta={tarjetaParaRecargar}
        montoFaltante={montoFaltante}
      />
    </>
  );
};
