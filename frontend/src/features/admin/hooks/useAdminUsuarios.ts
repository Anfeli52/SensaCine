import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUsuarios, updateUsuarioRol, updateUsuarioEstado, } from "../api/usuarioApi";
import { Rol } from "../types/usuario.types";

export const USUARIOS_QUERY_KEY = ["usuarios"];

export function useAdminUsuarios() {
    return useQuery({
        queryKey: USUARIOS_QUERY_KEY,
        queryFn: getUsuarios,
    });
}

export function useUpdateUsuarioRol() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, rol }: { id: number; rol: Rol }) => updateUsuarioRol(id, rol),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: USUARIOS_QUERY_KEY,
            });
        },
    });
}

export function useUpdateUsuarioEstado() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({id,estado,}: 
            {id: number; estado: "activo" | "inactivo";
        }) => updateUsuarioEstado(id, estado),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: USUARIOS_QUERY_KEY,
            });
        },
    });
}