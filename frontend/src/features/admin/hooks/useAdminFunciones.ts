import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFuncion,
  deleteFuncion,
  getFuncionById,
  getFunciones,
  updateFuncion,
} from "../api/funcionApi";
import {
  CreateFuncionInput,
  FuncionFilters,
  UpdateFuncionInput,
} from "../types/programacion.types";

export const FUNCIONES_QUERY_KEY = ["funciones"];

export function useAdminFunciones(filters?: FuncionFilters) {
  return useQuery({
    queryKey: [...FUNCIONES_QUERY_KEY, filters],
    queryFn: () => getFunciones(filters),
  });
}

export function useAdminFuncion(id: number) {
  return useQuery({
    queryKey: ["funcion", id],
    queryFn: () => getFuncionById(id),
    enabled: !!id,
  });
}

export function useCreateFuncion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFuncionInput) => createFuncion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FUNCIONES_QUERY_KEY });
    },
  });
}

export function useUpdateFuncion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFuncionInput }) =>
      updateFuncion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FUNCIONES_QUERY_KEY });
    },
  });
}

export function useDeleteFuncion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteFuncion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FUNCIONES_QUERY_KEY });
    },
  });
}
