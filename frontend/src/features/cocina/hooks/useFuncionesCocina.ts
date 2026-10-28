import { useQuery } from "@tanstack/react-query";
import { cocinaApi } from "../api/cocinaApi";

export function useFuncionesCocina() {
    return useQuery({
        queryKey: ["cocina", "funciones"],
        queryFn: cocinaApi.listarFunciones,
    });
}
