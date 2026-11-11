import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crearResena } from "../api/resenaApi";

export function useCrearResena() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: crearResena,
        // HU-19 y HU-20: Refresca el historial de reservas y las reseñas/promedio de la película
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reservas"] });
            queryClient.invalidateQueries({ queryKey: ["resenas"] });
        },
    });
}
