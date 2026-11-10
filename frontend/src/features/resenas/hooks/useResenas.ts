import { useQuery } from "@tanstack/react-query";
import { getResenasPorPelicula } from "../api/resenaApi";

export function useResenasPorPelicula(idPelicula?: number) {
    return useQuery({
        queryKey: ["resenas", "pelicula", idPelicula],
        queryFn: () => {
            if (!idPelicula) {
                throw new Error("El ID de la película es obligatorio");
            }

            return getResenasPorPelicula(idPelicula);
        },
        enabled: !!idPelicula,
    });
}