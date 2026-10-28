import { z } from "zod";
import { EstadoOrdenCocina } from "@prisma/client";

export const updateEstadoOrdenSchema = z.object({
  estado: z.preprocess((val) => {
    if (typeof val !== "string") return val;
    const cleaned = val.trim();
    if (cleaned.toLowerCase() === "pendiente") return EstadoOrdenCocina.Pendiente;
    if (
      cleaned === "En_preparacion" ||
      cleaned === "En preparación" ||
      cleaned === "En preparacion" ||
      cleaned.toLowerCase() === "en_preparacion" ||
      cleaned.toLowerCase() === "en preparación" ||
      cleaned.toLowerCase() === "en preparacion"
    ) {
      return EstadoOrdenCocina.En_preparacion;
    }
    if (cleaned.toLowerCase() === "lista") return EstadoOrdenCocina.Lista;
    return val;
  }, z.nativeEnum(EstadoOrdenCocina, {
    errorMap: () => ({
      message: "El estado debe ser uno de los permitidos: Pendiente, En preparación o Lista",
    }),
  })),
});

