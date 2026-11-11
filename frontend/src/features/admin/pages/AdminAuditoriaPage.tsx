import { useState } from "react";
import { AdminNavTabs } from "../components/AdminNavTabs";
import { AdminAuditoriaTable } from "../components/AdminAuditoriaTable";
import { AdminLoadingState, AdminErrorState } from "../components/AdminPageState";
import { useAdminAuditoria } from "../hooks/useAdminAuditoria";
import { AuditoriaFiltros } from "../types/auditoria.types";
import { ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "../../../shared/components/Button";

export function AdminAuditoriaPage() {
  const [filtros, setFiltros] = useState<AuditoriaFiltros>({
    pagina: 1,
    limite: 20,
  });

  const { data, isLoading, isError, refetch, isFetching } = useAdminAuditoria(filtros);

  const handleFiltrosChange = (nuevosFiltros: Partial<AuditoriaFiltros>) => {
    setFiltros((prev) => ({
      ...prev,
      ...nuevosFiltros,
    }));
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      pagina: 1,
      limite: 20,
    });
  };

  if (isLoading) {
    return <AdminLoadingState message="Cargando registros de auditoría..." />;
  }

  if (isError) {
    return (
      <AdminErrorState
        title="Error al cargar la auditoría"
        description="No se pudo sincronizar el historial de auditoría desde el servidor."
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
            <ShieldCheck className="w-4 h-4" />
            <span>Seguridad y Trazabilidad</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
            Auditoría del Sistema
          </h1>

          <p className="text-[13px] sm:text-[14px] text-[#86868b] mt-1">
            Historial inmutable de acciones realizadas por administradores y personal de cocina.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-[12px] px-3 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] border-transparent"
          title="Recargar registros"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      <AdminAuditoriaTable
        logs={data?.logs || []}
        total={data?.total || 0}
        paginas={data?.paginas || 1}
        paginaActual={filtros.pagina || 1}
        filtros={filtros}
        onFiltrosChange={handleFiltrosChange}
        onLimpiarFiltros={handleLimpiarFiltros}
        isLoading={isFetching}
      />
    </div>
  );
}

