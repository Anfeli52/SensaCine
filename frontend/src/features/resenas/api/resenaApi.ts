import { apiClient } from "../../../lib/apiClient";
import { CrearResenaResponse, ResenaInput, ResenasPorPelicula } from "../types";

export async function getResenasPorPelicula(idPelicula: number): Promise<ResenasPorPelicula> {
    const { data } = await apiClient.get<ResenasPorPelicula>(`/peliculas/${idPelicula}/resenas`);
    return data;
}

export async function crearResena(input: ResenaInput): Promise<CrearResenaResponse> {
    const { data } = await apiClient.post<CrearResenaResponse>("/resenas", input);
    return data;
}
