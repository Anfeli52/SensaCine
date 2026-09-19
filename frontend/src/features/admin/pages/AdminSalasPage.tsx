import { useState } from "react";
import {
  useAdminSalas,
  useCreateSala,
  useUpdateSala,
  useDeleteSala,
} from "../hooks/useAdminSalas";
import { CreateSalaInput, Sala } from "../types/programacion.types";
import { AdminNavTabs } from "../components/AdminNavTabs";
import { AdminSalaModal } from "../components/AdminSalaModal";
import { AdminBannerAlert, BannerAlertData } from "../components/AdminBannerAlert";
import { AdminLoadingState, AdminErrorState } from "../components/AdminPageState";
import { Button } from "../../../shared/components/Button";
import {
  Plus,
  Armchair,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Pencil,
  Trash2,
  Tv,
  Users,
  Calendar,
} from "lucide-react";

export function AdminSalasPage() {
  const { data: salas, isLoading, isError, refetch, isFetching } = useAdminSalas();

  const createMutation = useCreateSala();
  const updateMutation = useUpdateSala();
  const deleteMutation = useDeleteSala();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSala, setEditingSala] = useState<Sala | null>(null);

  const [deleteConfirmSala, setDeleteConfirmSala] = useState<Sala | null>(null);

  const [bannerAlert, setBannerAlert] = useState<BannerAlertData | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setBannerAlert({ type, message });
    setTimeout(() => {
      setBannerAlert(null);
    }, 5000);
  };

  const handleOpenCreate = () => {
    setEditingSala(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sala: Sala) => {
    setEditingSala(sala);
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (formData: CreateSalaInput) => {
    if (editingSala) {
      await updateMutation.mutateAsync({
        id: editingSala.id,
        data: { nombre: formData.nombre, estado: formData.estado },
      });
      showNotification("success", `Sala "${formData.nombre}" actualizada.`);
    } else {
      await createMutation.mutateAsync(formData);
      showNotification(
        "success",
        `Sala "${formData.nombre}" y sus butacas creadas exitosamente.`
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmSala) return;

    try {
      await deleteMutation.mutateAsync(deleteConfirmSala.id);
      showNotification(
        "success",
        `Sala "${deleteConfirmSala.nombre}" eliminada exitosamente.`
      );
      setDeleteConfirmSala(null);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "No se pudo eliminar la sala.";
      showNotification("error", errorMsg);
      setDeleteConfirmSala(null);
    }
  };

  if (isLoading) {
    return <AdminLoadingState message="Cargando salas de cine..." />;
  }

  if (isError || !salas) {
    return (
      <AdminErrorState
        title="Error al cargar las salas"
        description="No se pudo sincronizar la información de salas desde el servidor."
        onRetry={() => refetch()}
      />
    );
  }

  const totalCapacidad = salas.reduce((acc, s) => acc + s.capacidad, 0);
  const salasActivas = salas.filter((s) => s.estado === "activa").length;
  const salasMantenimiento = salas.filter((s) => s.estado === "mantenimiento").length;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation Tabs */}
      <AdminNavTabs />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-[12px] font-semibold tracking-wider text-[#0071e3] uppercase mb-1">
            <Armchair className="w-4 h-4" />
            <span>Infraestructura y Aforos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
            Salas y Distribución de Asientos
          </h1>
          <p className="text-[13px] sm:text-[14px] text-[#86868b] mt-1">
            Crea salas, diseña matrices de butacas y administra el aforo físico.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-[12px] px-3 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] border-transparent"
            title="Recargar salas"
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
            Nueva Sala
          </Button>
        </div>
      </div>

      {/* Banner Feedback Alert */}
      <AdminBannerAlert alert={bannerAlert} onClose={() => setBannerAlert(null)} />

      {/* Metrics Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-appleXl bg-white border border-[#e5e5ea] shadow-appleCard">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-[#86868b] uppercase">Total Salas</span>
            <Tv className="w-4 h-4 text-[#0071e3]" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-[#1d1d1f]">{salas.length}</span>
          <p className="text-[12px] text-[#86868b] mt-1">Salas registradas</p>
        </div>

        <div className="p-5 rounded-appleXl bg-white border border-[#e5e5ea] shadow-appleCard">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-[#86868b] uppercase">Salas Activas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-[#1d1d1f]">{salasActivas}</span>
          <p className="text-[12px] text-[#86868b] mt-1">Disponibles para funciones</p>
        </div>

        <div className="p-5 rounded-appleXl bg-white border border-[#e5e5ea] shadow-appleCard">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-[#86868b] uppercase">
              Capacidad Total
            </span>
            <Users className="w-4 h-4 text-[#0284c7]" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-[#1d1d1f]">
            {totalCapacidad}
          </span>
          <p className="text-[12px] text-[#86868b] mt-1">Butacas en el complejo</p>
        </div>

        <div className="p-5 rounded-appleXl bg-white border border-[#e5e5ea] shadow-appleCard">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-[#86868b] uppercase">
              Mantenimiento
            </span>
            <Armchair className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-[#1d1d1f]">
            {salasMantenimiento}
          </span>
          <p className="text-[12px] text-[#86868b] mt-1">Salas no operativas</p>
        </div>
      </div>

      {/* Salas Cards Grid */}
      {salas.length === 0 ? (
        <div className="bg-white rounded-appleXl border border-[#e5e5ea] p-12 text-center shadow-appleCard">
          <Armchair className="w-10 h-10 text-[#86868b] mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#1d1d1f] mb-1">No hay salas creadas</h3>
          <p className="text-[13px] text-[#86868b] max-w-sm mx-auto mb-5">
            Crea la primera sala de cine para comenzar a programar funciones.
          </p>
          <Button variant="primary" size="sm" onClick={handleOpenCreate}>
            Crear Primera Sala
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {salas.map((sala) => (
            <div
              key={sala.id}
              className="bg-white rounded-appleXl border border-[#e5e5ea] shadow-appleCard hover:shadow-appleCardHover transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-[#f0f0f0]">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-bold text-[16px] text-[#1d1d1f] line-clamp-1">
                    {sala.nombre}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-applePill text-[11px] font-medium ${
                      (() => {
                        if (sala.estado === "activa") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
                        if (sala.estado === "mantenimiento") return "bg-amber-50 text-amber-700 border border-amber-200";
                        return "bg-gray-100 text-gray-600 border border-gray-200";
                      })()
                    }`}
                  >
                    {(() => {
                      if (sala.estado === "activa") return "Activa";
                      if (sala.estado === "mantenimiento") return "Mantenimiento";
                      return "Inactiva";
                    })()}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[12px] text-[#6e6e73] mt-3">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#0071e3]" />
                    <span>
                      <strong className="text-[#1d1d1f]">{sala.capacidad}</strong> butacas
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#0284c7]" />
                    <span>
                      <strong className="text-[#1d1d1f]">
                        {sala._count?.funciones ?? 0}
                      </strong>{" "}
                      funciones
                    </span>
                  </div>
                </div>
              </div>

              {/* Cinema Screen Mock Preview */}
              <div className="p-5 bg-[#fafafc] flex flex-col items-center justify-center">
                <div className="w-full max-w-[200px] h-1.5 bg-[#0071e3] rounded-full mb-3 shadow-[0_0_8px_#0071e3]" />
                <div className="text-[10px] uppercase tracking-wider text-[#86868b] mb-3">
                  Pantalla
                </div>
                {/* Mini Seat Dots Grid */}
                <div className="grid grid-cols-8 gap-1.5 opacity-75 max-w-[180px]">
                  {Array.from({ length: Math.min(24, sala.capacidad) }).map((_, i) => (
                    <div
                      key={`seat-dot-${sala.id}-${i}`}
                      className="w-3 h-3 rounded-appleXs bg-[#0071e3]/20 border border-[#0071e3]/40"
                    />
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-white border-t border-[#f0f0f0] flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenEdit(sala)}
                  leftIcon={<Pencil className="w-3.5 h-3.5" />}
                  className="text-[12px] px-3 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] border-transparent"
                >
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setDeleteConfirmSala(sala)}
                  className="text-[12px] px-2.5 bg-red-50 hover:bg-red-100 text-red-600 border-transparent"
                  title="Eliminar sala"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <AdminSalaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSala(null);
        }}
        onSubmit={handleSubmitForm}
        salaToEdit={editingSala}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Alert Modal */}
      {deleteConfirmSala && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-appleXl p-6 max-w-md w-full shadow-2xl border border-[#e5e5ea] space-y-4">
            <div className="flex items-start gap-3 text-red-600">
              <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-[16px] text-[#1d1d1f]">
                  ¿Eliminar {deleteConfirmSala.nombre}?
                </h3>
                <p className="text-[13px] text-[#6e6e73] mt-1">
                  Se eliminarán la sala y sus {deleteConfirmSala.capacidad} asientos configurados.
                  Esta acción es irreversible.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f0f0f0]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeleteConfirmSala(null)}
                disabled={deleteMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmDelete}
                isLoading={deleteMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Confirmar Eliminación
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
