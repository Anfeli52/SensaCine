import {useAdminUsuarios, useUpdateUsuarioEstado, useUpdateUsuarioRol} from "../hooks/useAdminUsuarios";
import { AdminNavTabs } from "../components/AdminNavTabs";
import { AdminUsuarioTable } from "../components/AdminUsuarioTable";
import {AdminBannerAlert, BannerAlertData} from "../components/AdminBannerAlert";
import {AdminLoadingState, AdminErrorState} from "../components/AdminPageState";
import { Users, RefreshCw } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Rol } from "../types/usuario.types";
import { useState } from "react";

export function AdminUsuariosPage() {
  const {
    data: usuarios = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useAdminUsuarios();

  const updateRolMutation = useUpdateUsuarioRol();
  const updateEstadoMutation = useUpdateUsuarioEstado();
  const [bannerAlert, setBannerAlert] = useState<BannerAlertData | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setBannerAlert({ type, message });

    setTimeout(() => {
      setBannerAlert(null);
    }, 5000);
  };

  const handleChangeRol = async (id: number, rol: Rol) => {
    try {
      await updateRolMutation.mutateAsync({ id, rol });

      showNotification(
        "success",
        "Rol del usuario actualizado correctamente."
      );
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "No se pudo actualizar el rol del usuario.";

      showNotification("error", errorMsg);
    }
  };

  const handleChangeEstado = async (id: number, estado: "activo" | "inactivo") => {
    try {
      await updateEstadoMutation.mutateAsync({id, estado});
      showNotification(
        "success",
        estado === "activo"
          ? "Usuario activado correctamente."
          : "Usuario desactivado correctamente."
      );
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "No se pudo actualizar el estado del usuario.";

      showNotification("error", errorMsg);
    }
  };

  if (isLoading) {return <AdminLoadingState message="Cargando usuarios..." />;}

  if (isError) {
    return (
      <AdminErrorState
        title="Error al cargar los usuarios"
        description="No se pudo sincronizar el listado de usuarios desde el servidor."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdminNavTabs />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-[12px] font-semibold tracking-wider text-[#0071e3] uppercase mb-1">
            <Users className="w-4 h-4" />
            <span>Administración y Seguridad</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
            Gestión de Usuarios
          </h1>

          <p className="text-[13px] sm:text-[14px] text-[#86868b] mt-1">
            Consulta usuarios, administra sus roles y controla el estado de
            sus cuentas.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-[12px] px-3 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] border-transparent"
          title="Recargar usuarios"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""
              }`}
          />
        </Button>
      </div>

      <AdminBannerAlert alert={bannerAlert} onClose={() => setBannerAlert(null)}/>

      <AdminUsuarioTable
        usuarios={usuarios}
        onChangeRol={handleChangeRol}
        onChangeEstado={handleChangeEstado}
        isUpdatingRol={updateRolMutation.isPending}
        isUpdatingEstado={updateEstadoMutation.isPending}
      />
    </div>
  );
}