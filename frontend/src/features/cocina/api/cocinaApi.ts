import { apiClient } from "../../../lib/apiClient";
import type { FuncionCocina, ListadoFuncionesCocinaResponse } from "../types";

export const cocinaApi = {
    async listarFunciones(): Promise<ListadoFuncionesCocinaResponse> {
        const response = await apiClient.get<ListadoFuncionesCocinaResponse>("/cocina/funciones");
        return response.data;
    },

    async obtenerFuncion(id: number): Promise<FuncionCocina> {
        const response = await apiClient.get<FuncionCocina>(`/cocina/funciones/${id}`);
        return response.data;
    },
};
