import {useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {createProducto, deleteProducto, getProductos, updateProducto} from "../api/productoApi";
import {CreateProductoInput, UpdateProductoInput} from "../types/producto.types";

export const ADMIN_PRODUCTOS_QUERY_KEY = ["productos", "admin"];

export function useAdminProductos() {
  return useQuery({
    queryKey: ADMIN_PRODUCTOS_QUERY_KEY,
    queryFn: getProductos,
  });
}

export function useCreateProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductoInput) =>
      createProducto(data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_PRODUCTOS_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey: ["menu", variables.idPelicula],
      });
    },
  });
}

export function useUpdateProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id,data}:
     {
      id: number;
      data: UpdateProductoInput;
    }) => updateProducto(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_PRODUCTOS_QUERY_KEY,
      });

      if (variables.data.idPelicula) {
        queryClient.invalidateQueries({
          queryKey: ["menu", variables.data.idPelicula],
        });
      }

      queryClient.invalidateQueries({
        queryKey: ["menu"],
      });
    },
  });
}

export function useDeleteProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteProducto(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_PRODUCTOS_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey: ["menu"],
      });
    },
  });
}