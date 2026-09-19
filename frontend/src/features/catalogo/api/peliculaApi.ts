import { apiClient } from "../../../lib/apiClient";
import { CreatePeliculaInput, Pelicula, UpdatePeliculaInput } from "../types";

export async function getPeliculasActivas(): Promise<Pelicula[]> {
  const { data } = await apiClient.get<Pelicula[]>("/peliculas");
  return data;
}

export async function getPeliculasTodas(): Promise<Pelicula[]> {
  const { data } = await apiClient.get<Pelicula[]>("/peliculas?todas=true");
  return data;
}

export async function getPeliculaById(id: number): Promise<Pelicula> {
  const { data } = await apiClient.get<Pelicula>(`/peliculas/${id}`);
  return data;
}

export async function createPelicula(peliculaData: CreatePeliculaInput): Promise<Pelicula> {
  const { data } = await apiClient.post<Pelicula>("/peliculas", peliculaData);
  return data;
}

export async function updatePelicula(
  id: number,
  peliculaData: UpdatePeliculaInput
): Promise<Pelicula> {
  const { data } = await apiClient.put<Pelicula>(`/peliculas/${id}`, peliculaData);
  return data;
}

export async function deletePelicula(
  id: number
): Promise<{ mensaje: string; id: number }> {
  const { data } = await apiClient.delete<{ mensaje: string; id: number }>(
    `/peliculas/${id}`
  );
  return data;
}

export async function getFuncionesDisponiblesPorPelicula(
  idPelicula: number
): Promise<any[]> {
  const { data } = await apiClient.get<any[]>("/funciones", {
    params: {
      idPelicula,
      soloFuturas: true,
    },
  });
  return data;
}


