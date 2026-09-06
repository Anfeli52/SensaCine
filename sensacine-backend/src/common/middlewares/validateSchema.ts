import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

// Uso: router.post("/x", validateSchema(createXSchema), controller.create)
// Si el body no cumple el schema, corta la petición ANTES de llegar al controller.
export function validateSchema(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: result.error.flatten().fieldErrors,
      });
    }

    req.body = result.data;
    next();
  };
}
