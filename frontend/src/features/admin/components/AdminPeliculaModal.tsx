import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Modal } from "../../../shared/components/Modal";
import { Button } from "../../../shared/components/Button";
import { CreatePeliculaInput, Pelicula, PeliculaEstado } from "../../catalogo/types";
import { Film, Image, DollarSign, Clock, Tag, ShieldAlert, Sparkles, AlertCircle } from "lucide-react";


interface AdminPeliculaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePeliculaInput) => Promise<void>;
  peliculaToEdit?: Pelicula | null;
  isLoading?: boolean;
}

const GENEROS_SUGERIDOS = [
  "Acción",
  "Aventura",
  "Ciencia Ficción",
  "Comedia",
  "Drama",
  "Terror",
  "Suspenso",
  "Animación",
  "Fantasía",
  "Romance",
  "Documental",
];

const CLASIFICACIONES = ["ATP (Todo Público)", "PG-13 (+13)", "+16", "+18", "R"];

export function AdminPeliculaModal({
  isOpen,
  onClose,
  onSubmit,
  peliculaToEdit,
  isLoading = false,
}: AdminPeliculaModalProps) {
  const isEditing = !!peliculaToEdit;

  const [formData, setFormData] = useState<CreatePeliculaInput>({
    titulo: "",
    sinopsis: "",
    duracionMinutos: 120,
    genero: "Ciencia Ficción",
    clasificacion: "PG-13 (+13)",
    posterUrl: "",
    estado: "activa",
    precioBaseExperiencia: 25000,
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (peliculaToEdit) {
      setFormData({
        titulo: peliculaToEdit.titulo,
        sinopsis: peliculaToEdit.sinopsis || "",
        duracionMinutos: peliculaToEdit.duracionMinutos,
        genero: peliculaToEdit.genero || "",
        clasificacion: peliculaToEdit.clasificacion || "PG-13 (+13)",
        posterUrl: peliculaToEdit.posterUrl || "",
        estado: (peliculaToEdit.estado as PeliculaEstado) || "activa",
        precioBaseExperiencia: peliculaToEdit.precioBaseExperiencia,
      });
    } else {
      setFormData({
        titulo: "",
        sinopsis: "",
        duracionMinutos: 120,
        genero: "Ciencia Ficción",
        clasificacion: "PG-13 (+13)",
        posterUrl: "",
        estado: "activa",
        precioBaseExperiencia: 25000,
      });
    }
    setErrorMsg(null);
    setImageError(false);
  }, [peliculaToEdit, isOpen]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setErrorMsg(null);

    if (name === "posterUrl") {
      setImageError(false);
    }

    if (name === "duracionMinutos" || name === "precioBaseExperiencia") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? 0 : Number(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.titulo.trim()) {
      setErrorMsg("El título de la película es obligatorio.");
      return;
    }

    if (formData.duracionMinutos <= 0) {
      setErrorMsg("La duración debe ser mayor a 0 minutos.");
      return;
    }

    if (formData.precioBaseExperiencia < 0) {
      setErrorMsg("El precio base no puede ser un valor negativo.");
      return;
    }

    try {
      await onSubmit({
        ...formData,
        titulo: formData.titulo.trim(),
        sinopsis: formData.sinopsis?.trim() || null,
        genero: formData.genero?.trim() || null,
        clasificacion: formData.clasificacion?.trim() || null,
        posterUrl: formData.posterUrl?.trim() || null,
      });
      onClose();
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Ocurrió un error al procesar la solicitud.";
      setErrorMsg(serverMsg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Editar Película: ${peliculaToEdit.titulo}` : "Registrar Nueva Película"}
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
          {/* Main info (left col) */}
          <div className="md:col-span-7 space-y-4">
            {/* Titulo */}
            <div>
              <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-[#0071e3]" />
                Título de la Película <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                placeholder="Ej. Dune: Parte Dos"
                required
                className="w-full px-3.5 py-2.5 bg-[#f5f5f7] border border-[#e5e5ea] rounded-appleMd text-[14px] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
              />
            </div>

            {/* Duracion y Clasificacion */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-[#6e6e73] mb-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#86868b]" />
                  Duración (minutos) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="duracionMinutos"
                  min="1"
                  max="600"
                  value={formData.duracionMinutos || ""}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-[#f5f5f7] border border-[#e5e5ea] rounded-appleMd text-[13px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#6e6e73] mb-1.5 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-[#86868b]" />
                  Clasificación
                </label>
                <select
                  name="clasificacion"
                  value={formData.clasificacion || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#f5f5f7] border border-[#e5e5ea] rounded-appleMd text-[13px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
                >
                  <option value="">Selecciona clasificación</option>
                  {CLASIFICACIONES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Genero y Estado */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-[#6e6e73] mb-1.5 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-[#86868b]" />
                  Género
                </label>
                <input
                  type="text"
                  name="genero"
                  list="generos-list"
                  value={formData.genero || ""}
                  onChange={handleChange}
                  placeholder="Ej. Acción / Aventura"
                  className="w-full px-3 py-2 bg-[#f5f5f7] border border-[#e5e5ea] rounded-appleMd text-[13px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
                />
                <datalist id="generos-list">
                  {GENEROS_SUGERIDOS.map((g) => (
                    <option key={g} value={g} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#6e6e73] mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#86868b]" />
                  Estado en Plataforma
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#f5f5f7] border border-[#e5e5ea] rounded-appleMd text-[13px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
                >
                  <option value="activa">🟢 En Cartelera (Activa)</option>
                  <option value="proximamente">🟡 Próximamente</option>
                  <option value="inactiva">⚪ Inactiva / Archivada</option>
                </select>
              </div>
            </div>

            {/* Precio Base */}
            <div>
              <label className="block text-[12px] font-medium text-[#6e6e73] mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-[#86868b]" />
                Precio Base de Experiencia (COP) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#86868b] font-medium">
                  $
                </span>
                <input
                  type="number"
                  name="precioBaseExperiencia"
                  min="0"
                  step="500"
                  value={formData.precioBaseExperiencia || ""}
                  onChange={handleChange}
                  required
                  placeholder="25000"
                  className="w-full pl-7 pr-3.5 py-2 bg-[#f5f5f7] border border-[#e5e5ea] rounded-appleMd text-[13px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
                />
              </div>
              <p className="text-[11px] text-[#86868b] mt-1">
                Costo base de entrada para la experiencia sensorial.
              </p>
            </div>
          </div>

          {/* Poster Preview & URL (right col) */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-[#6e6e73] mb-1.5 flex items-center gap-1">
                <Image className="w-3 h-3 text-[#86868b]" />
                URL del Póster / Imagen
              </label>
              <input
                type="url"
                name="posterUrl"
                value={formData.posterUrl || ""}
                onChange={handleChange}
                placeholder="https://image.tmdb.org/..."
                className="w-full px-3 py-2 bg-[#f5f5f7] border border-[#e5e5ea] rounded-appleMd text-[12px] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
              />
            </div>

            {/* Poster Preview box */}
            <div className="flex-grow flex flex-col items-center justify-center p-3 bg-[#fafafc] border border-dashed border-[#d2d2d7] rounded-appleLg overflow-hidden min-h-[170px] relative">
              {formData.posterUrl && !imageError ? (
                <div className="relative w-full h-full max-h-[220px] flex items-center justify-center">
                  <img
                    src={formData.posterUrl}
                    alt="Vista previa del póster"
                    className="h-full max-h-[200px] object-cover rounded-appleMd shadow-md"
                    onError={() => setImageError(true)}
                  />
                  <div className="absolute bottom-1 right-1 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-applePill text-[10px] text-white">
                    Vista previa
                  </div>
                </div>
              ) : (
                <div className="text-center p-4">
                  <div className="w-10 h-10 rounded-full bg-[#f0f0f5] flex items-center justify-center mx-auto mb-2 text-[#86868b]">
                    <Image className="w-5 h-5" />
                  </div>
                  <p className="text-[12px] text-[#86868b] font-medium">
                    {imageError ? "No se pudo cargar la imagen" : "Sin póster asignado"}
                  </p>
                  <p className="text-[10px] text-[#a1a1a6] mt-0.5">
                    Ingresa una URL válida para previsualizar
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sinopsis */}
        <div>
          <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">
            Sinopsis / Descripción
          </label>
          <textarea
            name="sinopsis"
            rows={3}
            value={formData.sinopsis || ""}
            onChange={handleChange}
            placeholder="Breve reseña o sinopsis cinematográfica de la película..."
            className="w-full px-3.5 py-2.5 bg-[#f5f5f7] border border-[#e5e5ea] rounded-appleMd text-[13px] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all resize-none"
          />
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
            {isEditing ? "Guardar Cambios" : "Publicar Película"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
