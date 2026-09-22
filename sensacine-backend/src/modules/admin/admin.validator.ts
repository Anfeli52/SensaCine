import { z } from "zod";

export const updateUsuarioRolSchema = z.object({
  rol: z.enum(["cliente", "admin", "cocina"]),
});

export const updateUsuarioEstadoSchema = z.object({
  estado: z.enum(["activo", "inactivo"]),
});