import { useState } from "react";
import {
  useAdminFunciones,
  useCreateFuncion,
  useUpdateFuncion,
  useDeleteFuncion,
} from "../hooks/useAdminFunciones";
import { useAdminSalas } from "../hooks/useAdminSalas";
import { useAdminPeliculas } from "../hooks/useAdminPeliculas";
import { CreateFuncionInput, Funcion } from "../types/programacion.types";
import { AdminNavTabs } from "../components/AdminNavTabs";
import { AdminFuncionStats } from "../components/AdminFuncionStats";
import { AdminFuncionTimeline } from "../components/AdminFuncionTimeline";
import { AdminFuncionTable } from "../components/AdminFuncionTable";
import { AdminFuncionModal } from "../components/AdminFuncionModal";
import { AdminDeleteFuncionModal } from "../components/AdminDeleteFuncionModal";
import { AdminBannerAlert, BannerAlertData } from "../components/AdminBannerAlert";
import { AdminLoadingState, AdminErrorState } from "../components/AdminPageState";
import { Button } from "../../../shared/components/Button";
import {
  Plus,
  Calendar,
  RefreshCw,
  LayoutGrid,
  List,
} from "lucide-react";

export function AdminFuncionesPage() {
  const todayStr = new Date().toISOString().split("T")[0];

  const {
    data: funciones,
    isLoading: loadingFunciones,
    isError: errorFunciones,
    refetch,
    isFetching,
  } = useAdminFunciones();

  const { data: salas = [], isLoading: loadingSalas } = useAdminSalas();
  const { data: peliculas = [], isLoading: loadingPeliculas } = useAdminPeliculas();

  const createMutation = useCreateFuncion();
  const updateMutation = useUpdateFuncion();
  const deleteMutation = useDeleteFuncion();

  const [viewMode, setViewMode] = useState<"timeline" | "tabla">("timeline");
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFuncion, setEditingFuncion] = useState<Funcion | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingFuncion, setDeletingFuncion] = useState<Funcion | null>(null);

  const [bannerAlert, setBannerAlert] = useState<BannerAlertData | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setBannerAlert({ type, message });
    setTimeout(() => {
      setBannerAlert(null);
    }, 5000);
  };

  const handleOpenCreate = () => {
    setEditingFuncion(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (funcion: Funcion) => {
    setEditingFuncion(funcion);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (funcion: Funcion) => {
    setDeletingFuncion(funcion);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitForm = async (formData: CreateFuncionInput) => {
    if (editingFuncion) {
      await updateMutation.mutateAsync({
        id: editingFuncion.id,
        data: formData,
      });
      showNotification("success", "Función actualizada con éxito.");
    } else {
      await createMutation.mutateAsync(formData);
      showNotification("success", "Función programada en cartelera exitosamente.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingFuncion) return;

    try {
      await deleteMutation.mutateAsync(deletingFuncion.id);
      showNotification("success", "Función eliminada de la cartelera.");
      setIsDeleteModalOpen(false);
      setDeletingFuncion(null);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "No se pudo eliminar la función.";
      showNotification("error", errorMsg);
      setIsDeleteModalOpen(false);
    }
  };

  const isLoading = loadingFunciones || loadingSalas || loadingPeliculas;

  if (isLoading) {
    return <AdminLoadingState message="Cargando cartelera y salas..." />;
  }

  if (errorFunciones || !funciones || !salas || !peliculas) {
    return (
      <AdminErrorState
        title="Error al cargar la programación"
        description="No se pudieron sincronizar las funciones desde el servidor."
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
            <Calendar className="w-4 h-4" />
            <span>Programación y Horarios</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
            Cartelera de Funciones
          </h1>
          <p className="text-[13px] sm:text-[14px] text-[#86868b] mt-1">
            Asigna películas a salas, coordina horarios y previene solapamientos de sala.
          </p>
        </div>

        {/* Header Actions & View Switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* View Toggle */}
          <div className="flex items-center bg-[#f5f5f7] p-1 rounded-appleLg border border-[#e5e5ea]">
            <button
              type="button"
              onClick={() => setViewMode("timeline")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-appleMd text-[12px] font-medium transition-all ${
                viewMode === "timeline"
                  ? "bg-white text-[#1d1d1f] shadow-sm font-semibold"
                  : "text-[#6e6e73] hover:text-[#1d1d1f]"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Cronograma
            </button>
            <button
              type="button"
              onClick={() => setViewMode("tabla")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-appleMd text-[12px] font-medium transition-all ${
                viewMode === "tabla"
                  ? "bg-white text-[#1d1d1f] shadow-sm font-semibold"
                  : "text-[#6e6e73] hover:text-[#1d1d1f]"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Tabla
            </button>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-[12px] px-3 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] border-transparent"
            title="Recargar programación"
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
            Nueva Función
          </Button>
        </div>
      </div>

      {/* Banner Feedback Alert */}
      <AdminBannerAlert alert={bannerAlert} onClose={() => setBannerAlert(null)} />

      {/* Stats Summary */}
      <AdminFuncionStats funciones={funciones} salas={salas} />

      {/* Date selector for timeline view */}
      {viewMode === "timeline" && (
        <div className="flex items-center justify-between bg-[#f5f5f7] p-3 rounded-appleLg border border-[#e5e5ea] mb-6">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-[#1d1d1f]">
              Fecha del Cronograma:
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#e5e5ea] rounded-appleMd text-[13px] text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedDate(todayStr)}
              className="text-[12px] px-3 bg-white hover:bg-gray-50"
            >
              Hoy
            </Button>
          </div>
        </div>
      )}

      {/* Main View: Timeline or Table */}
      {viewMode === "timeline" ? (
        <AdminFuncionTimeline
          funciones={funciones}
          salas={salas}
          selectedDate={selectedDate}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      ) : (
        <AdminFuncionTable
          funciones={funciones}
          salas={salas}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onAddNew={handleOpenCreate}
        />
      )}

      {/* Create / Edit Function Modal */}
      <AdminFuncionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingFuncion(null);
        }}
        onSubmit={handleSubmitForm}
        funcionToEdit={editingFuncion}
        peliculas={peliculas}
        salas={salas}
        existingFunciones={funciones}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <AdminDeleteFuncionModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingFuncion(null);
        }}
        onConfirm={handleConfirmDelete}
        funcion={deletingFuncion}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
