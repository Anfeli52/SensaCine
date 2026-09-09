import { apiClient } from "../../../lib/apiClient";
import { Pelicula } from "../types";

export async function getPeliculasActivas(): Promise<Pelicula[]> {
  const { data } = await apiClient.get<Pelicula[]>("/peliculas");
  return data;
}

export async function getPeliculaById(id: number): Promise<Pelicula> {
  const { data } = await apiClient.get<Pelicula>(`/peliculas/${id}`);
  return data;
}
