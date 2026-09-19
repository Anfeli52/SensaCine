import { useState } from "react";
import {
  useAdminPeliculas,
  useCreatePelicula,
  useUpdatePelicula,
  useDeletePelicula,
} from "../hooks/useAdminPeliculas";
import { CreatePeliculaInput, Pelicula } from "../../catalogo/types";
import { AdminStats } from "../components/AdminStats";
import { AdminPeliculaTable } from "../components/AdminPeliculaTable";
import { AdminPeliculaModal } from "../components/AdminPeliculaModal";
import { AdminDeleteConfirmModal } from "../components/AdminDeleteConfirmModal";
import { Button } from "../../../shared/components/Button";
import { Spinner } from "../../../shared/components/Spinner";
import {
  Plus,
  CheckCircle2,
  AlertCircle,
  Clapperboard,
  RefreshCw,
} from "lucide-react";


export function AdminPeliculasPage() {
  const { data: peliculas, isLoading, isError, refetch, isFetching } = useAdminPeliculas();

  const createMutation = useCreatePelicula();
  const updateMutation = useUpdatePelicula();
  const deleteMutation = useDeletePelicula();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPelicula, setEditingPelicula] = useState<Pelicula | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingPelicula, setDeletingPelicula] = useState<Pelicula | null>(null);

  const [bannerAlert, setBannerAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setBannerAlert({ type, message });
    setTimeout(() => {
      setBannerAlert(null);
    }, 5000);
  };

  const handleOpenCreate = () => {
    setEditingPelicula(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pelicula: Pelicula) => {
    setEditingPelicula(pelicula);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (pelicula: Pelicula) => {
    setDeletingPelicula(pelicula);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitForm = async (formData: CreatePeliculaInput) => {
    if (editingPelicula) {
      await updateMutation.mutateAsync({
        id: editingPelicula.id,
        data: formData,
      });
      showNotification("success", `Película "${formData.titulo}" actualizada con éxito.`);
    } else {
      await createMutation.mutateAsync(formData);
      showNotification("success", `Película "${formData.titulo}" agregada a la cartelera.`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPelicula) return;

    try {
      await deleteMutation.mutateAsync(deletingPelicula.id);
      showNotification("success", `Película "${deletingPelicula.titulo}" eliminada.`);
      setIsDeleteModalOpen(false);
      setDeletingPelicula(null);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "No se pudo eliminar la película.";
      showNotification("error", errorMsg);
      setIsDeleteModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="md" />
        <p className="text-[13px] text-[#86868b]">Cargando panel de administración...</p>
      </div>
    );
  }

  if (isError || !peliculas) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-applePill bg-red-50 flex items-center justify-center text-red-500 mb-3">
          <AlertCircle className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold text-[#1d1d1f] mb-1">
          Error al cargar el catálogo
        </h2>
        <p className="text-[13px] text-[#86868b] max-w-md mb-5">
          No se pudo sincronizar la lista de películas desde el servidor.
        </p>
        <Button variant="primary" size="sm" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-[12px] font-semibold tracking-wider text-[#0071e3] uppercase mb-1">
            <Clapperboard className="w-4 h-4" />
            <span>Panel de Administración</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
            Gestión de Películas
          </h1>
          <p className="text-[13px] sm:text-[14px] text-[#86868b] mt-1">
            Crea, edita y organiza las películas y experiencias sensoriales del cine.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-[12px] px-3 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] border-transparent"
            title="Recargar catálogo"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="w-4 h-4" />}
            className="text-[13px] px-4 bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-sm"
          >
            Nueva Película
          </Button>
        </div>
      </div>

      {/* Banner Feedback Alert */}
      {bannerAlert && (
        <div
          className={`mb-6 p-4 rounded-appleLg border flex items-center justify-between gap-3 text-[13px] transition-all ${
            bannerAlert.type === "success"
              ? "bg-emerald-50/90 border-emerald-200 text-emerald-800"
              : "bg-red-50/90 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {bannerAlert.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span>{bannerAlert.message}</span>
          </div>
          <button
            onClick={() => setBannerAlert(null)}
            className="text-[11px] font-semibold uppercase tracking-wider hover:opacity-75"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Stats Summary */}
      <AdminStats peliculas={peliculas} />

      {/* Main Movies Table */}
      <AdminPeliculaTable
        peliculas={peliculas}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onAddNew={handleOpenCreate}
      />

      {/* Create / Edit Modal */}
      <AdminPeliculaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPelicula(null);
        }}
        onSubmit={handleSubmitForm}
        peliculaToEdit={editingPelicula}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <AdminDeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingPelicula(null);
        }}
        onConfirm={handleConfirmDelete}
        pelicula={deletingPelicula}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
