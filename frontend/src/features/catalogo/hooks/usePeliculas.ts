import { useQuery } from "@tanstack/react-query";
import { getPeliculasActivas, getPeliculaById } from "../api/peliculaApi";

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
