import { Router } from "express";
import { salaController } from "../../di/container";
import { asyncHandler } from "../../common/helpers/asyncHandler";
import { validateSchema } from "../../common/middlewares/validateSchema";
import { authenticate, requireRole } from "../../common/middlewares/authMiddleware";
import { createSalaSchema, updateSalaSchema } from "./sala.validator";

const router = Router();

// Rutas de Salas
router.get("/", asyncHandler(salaController.listar));
router.get("/:id", asyncHandler(salaController.obtenerPorId));

// Rutas protegidas (Solo administradores)
router.post(
  "/",
  authenticate,
  requireRole("admin"),
  validateSchema(createSalaSchema),
  asyncHandler(salaController.crear)
);

router.put(
  "/:id",
  authenticate,
  requireRole("admin"),
  validateSchema(updateSalaSchema),
  asyncHandler(salaController.actualizar)
);

router.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  asyncHandler(salaController.eliminar)
);

export default router;
