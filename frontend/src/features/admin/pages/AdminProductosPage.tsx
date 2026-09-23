import { useState } from "react";
import { useAdminProductos, useCreateProducto, useUpdateProducto, useDeleteProducto } from "../hooks/useAdminProductos";
import { useAdminPeliculas } from "../hooks/useAdminPeliculas";
import { AdminProducto, CreateProductoInput } from "../types/producto.types";
import { AdminNavTabs } from "../components/AdminNavTabs";
import { AdminProductoTable } from "../components/AdminProductoTable";
import { AdminProductoModal } from "../components/AdminProductoModal";
import { AdminBannerAlert, BannerAlertData } from "../components/AdminBannerAlert";
import { AdminLoadingState, AdminErrorState } from "../components/AdminPageState";
import { Button } from "../../../shared/components/Button";
import { Plus, UtensilsCrossed, RefreshCw } from "lucide-react";
import { AdminDeleteConfirmModal } from "../components/AdminDeleteProductoModal";

export function AdminProductosPage() {
  const {
    data: productos,
    isLoading: loadingProductos,
    isError: errorProductos,
    refetch,
    isFetching,
  } = useAdminProductos();

  const { data: peliculas = [], isLoading: loadingPeliculas } = useAdminPeliculas();

  const createMutation = useCreateProducto();
  const updateMutation = useUpdateProducto();
  const deleteMutation = useDeleteProducto();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<AdminProducto | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProducto, setDeletingProducto] = useState<AdminProducto | null>(null);
  const [bannerAlert, setBannerAlert] = useState<BannerAlertData | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setBannerAlert({ type, message });

    setTimeout(() => {
      setBannerAlert(null);
    }, 5000);
  };

  const handleOpenCreate = () => {
    setEditingProducto(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (producto: AdminProducto) => {
    setEditingProducto(producto);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (producto: AdminProducto) => {
    setDeletingProducto(producto);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProducto) return;

    try {
      await deleteMutation.mutateAsync(deletingProducto.id_producto);
      showNotification("success", `Producto "${deletingProducto.nombre}" eliminado.`);
      setIsDeleteModalOpen(false);
      setDeletingProducto(null);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "No se pudo eliminar el producto gastronómico.";
      showNotification("error", errorMsg);
      setIsDeleteModalOpen(false);
    }
  };


  const handleSubmitForm = async (formData: CreateProductoInput) => {
    try {
      if (editingProducto) {
        await updateMutation.mutateAsync({
          id: editingProducto.id_producto,
          data: formData,
        });

        showNotification(
          "success",
          `Producto "${formData.nombre}" actualizado con éxito.`
        );
      } else {
        await createMutation.mutateAsync(formData);

        showNotification(
          "success",
          `Producto "${formData.nombre}" agregado al menú.`
        );
      }

      setIsModalOpen(false);
      setEditingProducto(null);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "No se pudo guardar el producto.";

      showNotification("error", errorMsg);
    }
  };

  const isLoading = loadingProductos || loadingPeliculas;

  if (isLoading) {
    return (
      <AdminLoadingState message="Cargando menú gastronómico..." />
    );
  }

  if (errorProductos || !productos) {
    return (
      <AdminErrorState
        title="Error al cargar el menú"
        description="No se pudo sincronizar la lista de productos gastronómicos desde el servidor."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdminNavTabs />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-[12px] font-semibold tracking-wider text-[#0071e3] uppercase mb-1">
            <UtensilsCrossed className="w-4 h-4" />
            <span>Panel de Administración</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
            Gestión del Menú
          </h1>

          <p className="text-[13px] sm:text-[14px] text-[#86868b] mt-1">
            Crea, edita y organiza los productos gastronómicos de cada experiencia.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-[12px] px-3 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] border-transparent"
            title="Recargar menú"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""
                }`}
            />
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="w-4 h-4" />}
            className="text-[13px] px-4 bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-sm"
          >
            Nuevo Producto
          </Button>
        </div>
      </div>

      <AdminBannerAlert
        alert={bannerAlert}
        onClose={() => setBannerAlert(null)}
      />

      <AdminProductoTable
        productos={productos}
        peliculas={peliculas}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onAddNew={handleOpenCreate}
      />

      <AdminProductoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProducto(null);
        }}
        onSubmit={handleSubmitForm}
        productoToEdit={editingProducto}
        peliculas={peliculas}
        existingProductos={productos}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <AdminDeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingProducto(null);
        }}
        onConfirm={handleConfirmDelete}
        producto={deletingProducto}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}