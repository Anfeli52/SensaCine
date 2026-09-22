import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPelicula,
  deletePelicula,
  getPeliculasTodas,
  updatePelicula,
} from "../../catalogo/api/peliculaApi";
import { CreatePeliculaInput, UpdatePeliculaInput } from "../../catalogo/types";

export const ADMIN_PELICULAS_QUERY_KEY = ["peliculas", "admin"];

export function useAdminPeliculas() {
  return useQuery({
    queryKey: ADMIN_PELICULAS_QUERY_KEY,
    queryFn: getPeliculasTodas,
  });
}

export function useCreatePelicula() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePeliculaInput) => createPelicula(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["peliculas"] });
    },
  });
}

export function useUpdatePelicula() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePeliculaInput }) =>
      updatePelicula(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["peliculas"] });
    },
  });
}

export function useDeletePelicula() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deletePelicula(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["peliculas"] });
    },
  });
}
