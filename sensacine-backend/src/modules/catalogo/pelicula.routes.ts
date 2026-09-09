import { Router } from "express";
import { peliculaController } from "../../di/container";
import { asyncHandler } from "../../common/helpers/asyncHandler";
import { validateSchema } from "../../common/middlewares/validateSchema";
import { authenticate, requireRole } from "../../common/middlewares/authMiddleware";
import { createPeliculaSchema, updatePeliculaSchema } from "./pelicula.validator";

const router = Router();

// Rutas públicas (pantalla principal y detalle)
router.get("/", asyncHandler(peliculaController.listar));
router.get("/:id", asyncHandler(peliculaController.obtenerPorId));

// Rutas protegidas (Solo administradores)
router.post(
  "/",
  authenticate,
  requireRole("admin"),
  validateSchema(createPeliculaSchema),
  asyncHandler(peliculaController.crear)
);

router.put(
  "/:id",
  authenticate,
  requireRole("admin"),
  validateSchema(updatePeliculaSchema),
  asyncHandler(peliculaController.actualizar)
);

router.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  asyncHandler(peliculaController.eliminar)
);

export default router;
