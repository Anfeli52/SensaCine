import { useQuery } from "@tanstack/react-query";
import { cocinaApi } from "../api/cocinaApi";

export function useDetalleFuncionCocina(id: number) {
    return useQuery({
        queryKey: ["cocina", "funciones", id],
        queryFn: () => cocinaApi.obtenerFuncion(id),
        enabled: Number.isInteger(id) && id > 0,
    });
}
