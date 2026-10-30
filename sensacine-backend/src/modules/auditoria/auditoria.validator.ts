import { z } from "zod";

export const queryAuditoriaSchema = z.object({
  entidad: z.string().optional(),
  entidadId: z.coerce.number().int().positive().optional(),
  idUsuario: z.coerce.number().int().positive().optional(),
  accion: z.string().optional(),
  desde: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  hasta: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().positive().max(100).default(20),
});

