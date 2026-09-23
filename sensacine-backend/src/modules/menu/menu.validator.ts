import { z } from "zod";

export const createProductoSchema = z.object({
    nombre: z.string().min(1, "El nombre es obligatorio").max(150, "El nombre no puede superar los 150 caracteres"),
    descripcion: z.string().min(1, "La descripción es obligatoria"),
    categoria: z.string().min(1, "La categoría es obligatoria").max(50, "La categoría no puede superar los 50 caracteres"),
    estado: z.enum(["activo", "inactivo"]).default("activo"), idPelicula: z.number().int("La película debe ser válida").positive("La película debe ser válida"),
    ordenMenu: z.number().int("El número de orden debe ser un entero").positive("El número de orden debe ser mayor a 0"),
    imagenUrl: z.string().min(1, "La imagen es obligatoria").max(500, "La URL de la imagen no puede superar los 500 caracteres"),
});

export const updateProductoSchema = createProductoSchema.partial();