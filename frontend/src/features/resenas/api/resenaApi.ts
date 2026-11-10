import { apiClient } from "../../../lib/apiClient";
import { ResenasPorPelicula } from "../types";

export async function getResenasPorPelicula(idPelicula: number): Promise<ResenasPorPelicula> {
    const { data } = await apiClient.get<ResenasPorPelicula>(`/peliculas/${idPelicula}/resenas`);
    return data;
}