import { apiClient } from "../../../lib/apiClient";
import type { EstadoOrden, FuncionCocina, ListadoFuncionesCocinaResponse, OrdenCocina } from "../types";

export const cocinaApi = {
    async listarFunciones(): Promise<ListadoFuncionesCocinaResponse> {
        const response = await apiClient.get<ListadoFuncionesCocinaResponse>("/cocina/funciones");
        return response.data;
    },

    async obtenerFuncion(id: number): Promise<FuncionCocina> {
        const response = await apiClient.get<FuncionCocina>(`/cocina/funciones/${id}`);
        return response.data;
    },

    async actualizarEstadoOrden(
        idOrden: number,
        estado: EstadoOrden
    ): Promise<{ mensaje: string; orden: OrdenCocina }> {
        const response = await apiClient.patch<{ mensaje: string; orden: OrdenCocina }>(
            `/cocina/ordenes/${idOrden}/estado`,
            { estado }
        );
        return response.data;
    },

    async obtenerOrden(idOrden: number): Promise<OrdenCocina> {
        const response = await apiClient.get<OrdenCocina>(`/cocina/ordenes/${idOrden}`);
        return response.data;
    },
};
