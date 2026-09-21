import { apiClient } from "../../../lib/apiClient";
import { Producto } from "../types";

export async function getMenuPorPelicula( idPelicula: number): Promise<Producto[]> {
  const { data } = await apiClient.get<Producto[]>(`/peliculas/${idPelicula}/menu`);
  return data;
}