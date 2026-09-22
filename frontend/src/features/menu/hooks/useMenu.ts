import { useQuery } from "@tanstack/react-query";
import { getMenuPorPelicula } from "../api/menuApi";

export function useMenu(idPelicula?: number) {
  return useQuery({
    queryKey: ["menu", idPelicula],
    queryFn: () => (idPelicula ? getMenuPorPelicula(idPelicula) : []),
    enabled: !!idPelicula,
  });
}