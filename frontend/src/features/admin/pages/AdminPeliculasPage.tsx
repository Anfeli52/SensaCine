import { useState } from "react";
import {
  useAdminPeliculas,
  useCreatePelicula,
  useUpdatePelicula,
  useDeletePelicula,
} from "../hooks/useAdminPeliculas";
import { CreatePeliculaInput, Pelicula } from "../../catalogo/types";
import { AdminNavTabs } from "../components/AdminNavTabs";
import { AdminStats } from "../components/AdminStats";
import { AdminPeliculaTable } from "../components/AdminPeliculaTable";
import { AdminPeliculaModal } from "../components/AdminPeliculaModal";
import { AdminDeleteConfirmModal } from "../components/AdminDeleteConfirmModal";
import { AdminBannerAlert, BannerAlertData } from "../components/AdminBannerAlert";
import { AdminLoadingState, AdminErrorState } from "../components/AdminPageState";
import { Button } from "../../../shared/components/Button";
import { Plus, Clapperboard, RefreshCw } from "lucide-react";

export function AdminPeliculasPage() {
  const { data: peliculas, isLoading, isError, refetch, isFetching } = useAdminPeliculas();

  const createMutation = useCreatePelicula();
  const updateMutation = useUpdatePelicula();
  const deleteMutation = useDeletePelicula();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPelicula, setEditingPelicula] = useState<Pelicula | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingPelicula, setDeletingPelicula] = useState<Pelicula | null>(null);

  const [bannerAlert, setBannerAlert] = useState<BannerAlertData | null>(null);

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
    return <AdminLoadingState message="Cargando panel de películas..." />;
  }

  if (isError || !peliculas) {
    return (
      <AdminErrorState
        title="Error al cargar el catálogo"
        description="No se pudo sincronizar la lista de películas desde el servidor."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation Tabs */}
      <AdminNavTabs />

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
      <AdminBannerAlert alert={bannerAlert} onClose={() => setBannerAlert(null)} />

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
