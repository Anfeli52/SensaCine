import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Modal } from "../../../shared/components/Modal";
import { Button } from "../../../shared/components/Button";
import { CreateFuncionInput, Funcion, Sala } from "../types/programacion.types";
import { Pelicula } from "../../catalogo/types";
import {
  Calendar,
  Clock,
  DollarSign,
  Film,
  Armchair,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface AdminFuncionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFuncionInput) => Promise<void>;
  funcionToEdit?: Funcion | null;
  peliculas: Pelicula[];
  salas: Sala[];
  existingFunciones?: Funcion[];
  isLoading?: boolean;
}

export function AdminFuncionModal({
  isOpen,
  onClose,
  onSubmit,
  funcionToEdit,
  peliculas,
  salas,
  existingFunciones = [],
  isLoading = false,
}: Readonly<AdminFuncionModalProps>) {
  const isEditing = !funcionToEdit ? false : true;

  const todayStr = new Date().toISOString().split("T")[0];

  const [idPelicula, setIdPelicula] = useState<number>(peliculas[0]?.id || 0);
  const [idSala, setIdSala] = useState<number>(salas[0]?.id || 0);
  const [fecha, setFecha] = useState<string>(todayStr);
  const [horaInicio, setHoraInicio] = useState<string>("15:00");
  const [precioAsientoOficial, setPrecioAsientoOficial] = useState<number>(25000);
  const [estado, setEstado] = useState<string>("programada");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Seleccionados actuales para cálculo en vivo
  const selectedPelicula = peliculas.find((p) => p.id === idPelicula);
  const selectedSala = salas.find((s) => s.id === idSala);

  // Calcular hora de fin automáticamente en vivo
  const calculateEndTime = (startStr: string, durMin: number): string => {
    if (!startStr) return "";
    const [h, m] = startStr.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return "";

    const totalMinutes = h * 60 + m + durMin;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
  };

  const calculatedHoraFin = selectedPelicula
    ? calculateEndTime(horaInicio, selectedPelicula.duracionMinutos)
    : "";

  // Detección en vivo de conflicto en Frontend para advertir al usuario antes de enviar
  const detectedConflict = (() => {
    if (!idSala || !fecha || !horaInicio || !calculatedHoraFin) return null;

    const toMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(":").map(Number);
      return h * 60 + m;
    };

    const startMin = toMinutes(horaInicio);
    const endMin = toMinutes(calculatedHoraFin);

    const conflicting = existingFunciones.find((f) => {
      if (f.idSala !== idSala) return false;
      if (f.estado === "cancelada") return false;
      if (isEditing && f.id === funcionToEdit?.id) return false;
      if (!f.fecha?.startsWith(fecha)) return false;

      const fStart = toMinutes(f.horaInicio);
      const fEnd = toMinutes(f.horaFin);

      // Overlap condition
      return startMin < fEnd && endMin > fStart;
    });

    return conflicting || null;
  })();

  useEffect(() => {
    if (funcionToEdit) {
      setIdPelicula(funcionToEdit.idPelicula);
      setIdSala(funcionToEdit.idSala);
      setFecha(funcionToEdit.fecha.split("T")[0]);
      setHoraInicio(funcionToEdit.horaInicio);
      setPrecioAsientoOficial(funcionToEdit.precioAsientoOficial);
      setEstado(funcionToEdit.estado || "programada");
    } else {
      const firstPeli = peliculas[0];
      const firstSala = salas[0];
      setIdPelicula(firstPeli?.id || 0);
      setIdSala(firstSala?.id || 0);
      setFecha(todayStr);
      setHoraInicio("15:00");
      setPrecioAsientoOficial(firstPeli?.precioBaseExperiencia || 25000);
      setEstado("programada");
    }
    setErrorMsg(null);
  }, [funcionToEdit, isOpen, peliculas, salas]);

  // Cuando cambia la película, actualizar precio oficial sugerido si es nueva función
  const handlePeliculaChange = (newPeliId: number) => {
    setIdPelicula(newPeliId);
    setErrorMsg(null);
    if (!isEditing) {
      const peli = peliculas.find((p) => p.id === newPeliId);
      if (peli?.precioBaseExperiencia) {
        setPrecioAsientoOficial(peli.precioBaseExperiencia);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!idPelicula) {
      setErrorMsg("Debes seleccionar una película.");
      return;
    }

    if (!idSala) {
      setErrorMsg("Debes seleccionar una sala de proyección.");
      return;
    }

    if (!fecha) {
      setErrorMsg("La fecha de la función es obligatoria.");
      return;
    }

    if (!horaInicio) {
      setErrorMsg("La hora de inicio es obligatoria.");
      return;
    }

    if (precioAsientoOficial < 0) {
      setErrorMsg("El precio oficial no puede ser negativo.");
      return;
    }

    try {
      await onSubmit({
        idPelicula,
        idSala,
        fecha,
        horaInicio,
        horaFin: calculatedHoraFin,
        precioAsientoOficial,
        estado,
      });
      onClose();
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Error al programar la función.";
      setErrorMsg(serverMsg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Función de Cartelera" : "Programar Nueva Función"}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMsg && (
          <div className="p-3.5 rounded-appleMd bg-red-50 border border-red-200 text-red-700 text-[13px] flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Live conflict warning */}
        {detectedConflict && (
          <div className="p-4 rounded-appleLg bg-amber-50 border border-amber-200 text-amber-900 text-[13px] space-y-1">
            <div className="flex items-center gap-2 font-semibold text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Advertencia de Solapamiento de Horario</span>
            </div>
            <p className="text-[12px] text-amber-800">
              La sala seleccionada ya tiene programada la función de{" "}
              <strong>"{detectedConflict.pelicula?.titulo || "Otra Película"}"</strong> de{" "}
              <strong>{detectedConflict.horaInicio}</strong> a{" "}
              <strong>{detectedConflict.horaFin}</strong> en esta misma fecha.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Columna Izquierda: Pelicula y Sala */}
          <div className="md:col-span-6 space-y-4">
            {/* Pelicula */}
            <div>
              <label htmlFor="idPelicula" className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-[#0071e3]" />
                Película del Catálogo <span className="text-red-500">*</span>
              </label>
              <select
                id="idPelicula"
                value={idPelicula}
                onChange={(e) => handlePeliculaChange(Number(e.target.value))}
                required
                className="w-full px-3.5 py-2.5 bg-[#f5f5f7] border border-[#e5e5ea] rounded-appleMd text-[13px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
              >
                {peliculas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.titulo} ({p.duracionMinutos} min)
                  </option>
                ))}
              </select>

              {/* Movie mini card badge */}
              {selectedPelicula && (
                <div className="flex items-center gap-3 p-2.5 bg-[#fafafc] border border-[#e5e5ea] rounded-appleMd mt-2">
                  {selectedPelicula.posterUrl ? (
                    <img
                      src={selectedPelicula.posterUrl}
                      alt={selectedPelicula.titulo}
                      className="w-8 h-11 object-cover rounded-appleXs shadow-sm flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-11 bg-gray-200 rounded-appleXs flex items-center justify-center">
                      <Film className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                  <div className="text-[12px] overflow-hidden">
                    <p className="font-semibold text-[#1d1d1f] truncate">
                      {selectedPelicula.titulo}
                    </p>
                    <p className="text-[11px] text-[#86868b]">
                      {selectedPelicula.genero || "General"} · {selectedPelicula.duracionMinutos} min
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sala */}
            <div>
              <label htmlFor="idSala" className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5 flex items-center gap-1.5">
                <Armchair className="w-3.5 h-3.5 text-[#0071e3]" />
                Sala de Cine <span className="text-red-500">*</span>
              </label>
              <select
                id="idSala"
                value={idSala}
                onChange={(e) => {
                  setIdSala(Number(e.target.value));
                  setErrorMsg(null);
                }}
                required
                className="w-full px-3.5 py-2.5 bg-[#f5f5f7] border border-[#e5e5ea] rounded-appleMd text-[13px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
              >
                {salas.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} ({s.capacidad} butacas) - {s.estado}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado de la función */}
            <div>
              <label htmlFor="estadoFuncion" className="block text-[12px] font-medium text-[#6e6e73] mb-1.5">
                Estado de la Función
              </label>
              <select
                id="estadoFuncion"
                value={estado}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setEstado(e.target.value)}
                className="w-full px-3 py-2 bg-[#f5f5f7] border border-[#e5e5ea] rounded-appleMd text-[13px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
              >
                <option value="programada">🟢 Programada</option>
                <option value="en_curso">🔵 En Curso</option>
                <option value="finalizada">⚪ Finalizada</option>
                <option value="cancelada">🔴 Cancelada</option>
              </select>
            </div>
          </div>

          {/* Columna Derecha: Fecha, Horarios y Precio */}
          <div className="md:col-span-6 space-y-4">
            {/* Fecha */}
            <div>
              <label htmlFor="fechaProyeccion" className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0071e3]" />
                Fecha de Proyección <span className="text-red-500">*</span>
              </label>
              <input
                id="fechaProyeccion"
                type="date"
                value={fecha}
                min={todayStr}
                onChange={(e) => {
                  setFecha(e.target.value);
                  setErrorMsg(null);
                }}
                required
                className="w-full px-3.5 py-2.5 bg-[#f5f5f7] border border-[#e5e5ea] rounded-appleMd text-[13px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
              />
            </div>

            {/* Horarios (Inicio y Fin Calculado) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="horaInicio" className="block text-[12px] font-medium text-[#6e6e73] mb-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#86868b]" />
                  Hora Inicio <span className="text-red-500">*</span>
                </label>
                <input
                  id="horaInicio"
                  type="time"
                  value={horaInicio}
                  onChange={(e) => {
                    setHoraInicio(e.target.value);
                    setErrorMsg(null);
                  }}
                  required
                  className="w-full px-3 py-2 bg-[#f5f5f7] border border-[#e5e5ea] rounded-appleMd text-[13px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
                />
              </div>

              <div>
                <span className="block text-[12px] font-medium text-[#6e6e73] mb-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#86868b]" />
                  Fin Estimado
                </span>
                <div className="px-3 py-2 bg-[#f0f0f5] border border-[#e0e0e5] rounded-appleMd text-[13px] font-semibold text-[#1d1d1f] flex items-center justify-between">
                  <span>{calculatedHoraFin || "--:--"}</span>
                  <span className="text-[10px] text-[#0071e3] bg-[#0071e3]/10 px-1.5 py-0.5 rounded-applePill font-medium">
                    Auto
                  </span>
                </div>
              </div>
            </div>

            {/* Precio Oficial */}
            <div>
              <label htmlFor="precioAsientoOficial" className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#0071e3]" />
                Precio Oficial Asiento (COP) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-[#86868b] font-medium">
                  $
                </span>
                <input
                  id="precioAsientoOficial"
                  type="number"
                  min="0"
                  step="500"
                  value={precioAsientoOficial || ""}
                  onChange={(e) => setPrecioAsientoOficial(Number(e.target.value))}
                  required
                  className="w-full pl-8 pr-3.5 py-2.5 bg-[#f5f5f7] border border-[#e5e5ea] rounded-appleMd text-[13px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
                />
              </div>
            </div>

            {/* Resumen Card */}
            <div className="p-3 bg-[#fafafc] border border-[#e5e5ea] rounded-appleLg text-[11px] text-[#6e6e73] space-y-1">
              <div className="flex items-center gap-1 text-[#1d1d1f] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Resumen de Reserva
              </div>
              <p>
                Sala: <strong>{selectedSala?.nombre || "No seleccionada"}</strong>
              </p>
              <p>
                Horario: <strong>{horaInicio}</strong> a <strong>{calculatedHoraFin}</strong> (
                {selectedPelicula?.duracionMinutos || 0} min de duración)
              </p>
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
            {isEditing ? "Guardar Cambios" : "Programar Función"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
