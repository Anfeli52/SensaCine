import { apiClient } from "../../../lib/apiClient";
import { CreateSalaInput, Sala, UpdateSalaInput } from "../types/programacion.types";

export async function getSalas(): Promise<Sala[]> {
  const { data } = await apiClient.get<Sala[]>("/salas");
  return data;
}

export async function getSalaById(id: number): Promise<Sala> {
  const { data } = await apiClient.get<Sala>(`/salas/${id}`);
  return data;
}

export async function createSala(salaData: CreateSalaInput): Promise<Sala> {
  const { data } = await apiClient.post<Sala>("/salas", salaData);
  return data;
}

export async function updateSala(id: number, salaData: UpdateSalaInput): Promise<Sala> {
  const { data } = await apiClient.put<Sala>(`/salas/${id}`, salaData);
  return data;
}

export async function deleteSala(id: number): Promise<{ mensaje: string; id: number }> {
  const { data } = await apiClient.delete<{ mensaje: string; id: number }>(`/salas/${id}`);
  return data;
}
