import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSala, deleteSala, getSalaById, getSalas, updateSala } from "../api/salaApi";
import { CreateSalaInput, UpdateSalaInput } from "../types/programacion.types";

export const SALAS_QUERY_KEY = ["salas"];

export function useAdminSalas() {
  return useQuery({
    queryKey: SALAS_QUERY_KEY,
    queryFn: getSalas,
  });
}

export function useAdminSala(id: number) {
  return useQuery({
    queryKey: ["sala", id],
    queryFn: () => getSalaById(id),
    enabled: !!id,
  });
}

export function useCreateSala() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSalaInput) => createSala(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALAS_QUERY_KEY });
    },
  });
}

export function useUpdateSala() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSalaInput }) => updateSala(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALAS_QUERY_KEY });
    },
  });
}

export function useDeleteSala() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteSala(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALAS_QUERY_KEY });
    },
  });
}
