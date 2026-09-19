import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Modal } from "../../../shared/components/Modal";
import { Button } from "../../../shared/components/Button";
import { CreateSalaInput, Sala, SalaEstado } from "../types/programacion.types";
import { Armchair, Sparkles, AlertCircle, Tv } from "lucide-react";

interface AdminSalaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSalaInput) => Promise<void>;
  salaToEdit?: Sala | null;
  isLoading?: boolean;
}

export function AdminSalaModal({
  isOpen,
  onClose,
  onSubmit,
  salaToEdit,
  isLoading = false,
}: Readonly<AdminSalaModalProps>) {
  const isEditing = !!salaToEdit;

  const [nombre, setNombre] = useState("");
  const [filas, setFilas] = useState(5);
  const [asientosPorFila, setAsientosPorFila] = useState(8);
  const [estado, setEstado] = useState<SalaEstado>("activa");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (salaToEdit) {
      setNombre(salaToEdit.nombre);
      setEstado(salaToEdit.estado || "activa");
      // Si la sala ya tiene capacidad, estimamos filas x columnas si no viene detallado
      if (salaToEdit.capacidad) {
        const estCols = Math.min(10, Math.ceil(Math.sqrt(salaToEdit.capacidad)));
        const estRows = Math.ceil(salaToEdit.capacidad / estCols);
        setFilas(estRows || 5);
        setAsientosPorFila(estCols || 8);
      }
    } else {
      setNombre("");
      setFilas(5);
      setAsientosPorFila(8);
      setEstado("activa");
    }
    setErrorMsg(null);
  }, [salaToEdit, isOpen]);

  const totalCapacidad = filas * asientosPorFila;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!nombre.trim()) {
      setErrorMsg("El nombre de la sala es obligatorio.");
      return;
    }

    if (filas <= 0 || asientosPorFila <= 0) {
      setErrorMsg("Las filas y asientos por fila deben ser mayores a 0.");
      return;
    }

    try {
      await onSubmit({
        nombre: nombre.trim(),
        filas,
        asientosPorFila,
        capacidad: totalCapacidad,
        estado,
      });
      onClose();
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Error al guardar la sala.";
      setErrorMsg(serverMsg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Editar Sala: ${salaToEdit.nombre}` : "Nueva Sala de Cine"}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMsg && (
          <div className="p-3.5 rounded-appleMd bg-red-50 border border-red-200 text-red-700 text-[13px] flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Inputs Section */}
          <div className="md:col-span-6 space-y-4">
            <div>
              <label htmlFor="nombreSala" className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5 flex items-center gap-1.5">
                <Armchair className="w-3.5 h-3.5 text-[#0071e3]" />
                Nombre de la Sala <span className="text-red-500">*</span>
              </label>
              <input
                id="nombreSala"
                type="text"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Ej. Sala 1 - Premiere Atmos"
                required
                className="w-full px-3.5 py-2.5 bg-[#f5f5f7] border border-[#e5e5ea] rounded-appleMd text-[14px] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
              />
            </div>

            {/* Configuración de Filas y Columnas (solo al crear o editable) */}
            {!isEditing && (
              <div className="p-4 bg-[#fafafc] border border-[#e5e5ea] rounded-appleLg space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-[#86868b]">
                    Matriz de Asientos
                  </span>
                  <span className="text-[12px] font-bold text-[#0071e3] bg-[#0071e3]/10 px-2 py-0.5 rounded-applePill">
                    {totalCapacidad} asientos
                  </span>
                </div>

                {/* Filas */}
                <div>
                  <div className="flex justify-between text-[12px] font-medium text-[#6e6e73] mb-1">
                    <label htmlFor="filasRange">Número de Filas (A a {String.fromCodePoint(64 + filas)}):</label>
                    <span className="font-bold text-[#1d1d1f]">{filas} filas</span>
                  </div>
                  <input
                    id="filasRange"
                    type="range"
                    min="1"
                    max="10"
                    value={filas}
                    onChange={(e) => setFilas(Number(e.target.value))}
                    className="w-full accent-[#0071e3] cursor-pointer"
                  />
                </div>

                {/* Asientos por fila */}
                <div>
                  <div className="flex justify-between text-[12px] font-medium text-[#6e6e73] mb-1">
                    <label htmlFor="asientosPorFilaRange">Asientos por Fila (1 a {asientosPorFila}):</label>
                    <span className="font-bold text-[#1d1d1f]">{asientosPorFila} asientos</span>
                  </div>
                  <input
                    id="asientosPorFilaRange"
                    type="range"
                    min="2"
                    max="14"
                    value={asientosPorFila}
                    onChange={(e) => setAsientosPorFila(Number(e.target.value))}
                    className="w-full accent-[#0071e3] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Estado de la sala */}
            <div>
              <label htmlFor="estadoSala" className="block text-[12px] font-medium text-[#6e6e73] mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#86868b]" />
                Estado Operativo
              </label>
              <select
                id="estadoSala"
                value={estado}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setEstado(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#f5f5f7] border border-[#e5e5ea] rounded-appleMd text-[13px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
              >
                <option value="activa">🟢 Sala Activa</option>
                <option value="inactiva">⚪ Sala Inactiva</option>
                <option value="mantenimiento">🟡 En Mantenimiento</option>
              </select>
            </div>
          </div>

          {/* Visual Seat Map Preview Section (Fondo blanco / claro con asientos azules) */}
          <div className="md:col-span-6 flex flex-col items-center justify-between p-4 bg-[#fafafc] rounded-appleLg text-[#1d1d1f] border border-[#e5e5ea]">
            <div className="w-full text-center">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
                Vista Previa del Mapa de Butacas
              </span>

              {/* Pantalla Curva */}
              <div className="my-4 px-6">
                <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-[#0071e3] to-transparent rounded-full shadow-[0_2px_8px_rgba(0,113,227,0.25)]" />
                <div className="text-[10px] uppercase tracking-widest text-[#86868b] mt-1.5 flex items-center justify-center gap-1 font-semibold">
                  <Tv className="w-3 h-3 text-[#0071e3]" /> PANTALLA DE CINE
                </div>
              </div>
            </div>

            {/* Seats Grid */}
            <div className="w-full overflow-x-auto p-2 max-h-[220px] flex justify-center">
              <div className="space-y-1.5 inline-block">
                {Array.from({ length: filas }).map((_, rIdx) => {
                  const letter = String.fromCodePoint(65 + rIdx);
                  return (
                    <div key={letter} className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-medium text-[#86868b] w-3 text-right">
                        {letter}
                      </span>
                      <div className="flex gap-1">
                        {Array.from({ length: asientosPorFila }).map((_, cIdx) => (
                          <div
                            key={`${letter}-${cIdx + 1}`}
                            className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-appleXs bg-[#0071e3]/10 hover:bg-[#0071e3]/20 border border-[#0071e3]/30 flex items-center justify-center text-[8px] text-[#0071e3] font-semibold transition-all shadow-xs"
                            title={`Asiento ${letter}${cIdx + 1}`}
                          >
                            {cIdx + 1}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-center pt-2 text-[11px] text-[#86868b]">
              Capacidad Total: <strong className="text-[#1d1d1f] font-bold">{totalCapacidad} butacas</strong>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f0f0f0]">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="text-[13px] px-4"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            className="text-[13px] px-5 bg-[#0071e3] hover:bg-[#0077ed]"
          >
            {isEditing ? "Guardar Cambios" : "Crear Sala y Butacas"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
