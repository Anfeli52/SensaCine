import { useQuery } from "@tanstack/react-query";
import {
  getPeliculasActivas,
  getPeliculaById,
  getFuncionesDisponiblesPorPelicula,
} from "../api/peliculaApi";

export const PELICULAS_QUERY_KEY = ["peliculas", "activas"];

export function usePeliculasActivas() {
  return useQuery({
    queryKey: PELICULAS_QUERY_KEY,
    queryFn: getPeliculasActivas,
  });
}

export function usePelicula(id: number) {
  return useQuery({
    queryKey: ["pelicula", id],
    queryFn: () => getPeliculaById(id),
    enabled: !!id,
  });
}

export function useFuncionesDisponibles(idPelicula?: number) {
  return useQuery({
    queryKey: ["funciones", "disponibles", idPelicula],
    queryFn: () => (idPelicula ? getFuncionesDisponiblesPorPelicula(idPelicula) : []),
    enabled: !!idPelicula,
  });
}

