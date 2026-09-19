import { Router } from "express";
import { funcionController } from "../../di/container";
import { asyncHandler } from "../../common/helpers/asyncHandler";
import { validateSchema } from "../../common/middlewares/validateSchema";
import { authenticate, requireRole } from "../../common/middlewares/authMiddleware";
import { createFuncionSchema, updateFuncionSchema } from "./funcion.validator";

const router = Router();

// Rutas públicas de consulta de funciones (para cartelera y detalle)
router.get("/", asyncHandler(funcionController.listar));
router.get("/:id", asyncHandler(funcionController.obtenerPorId));

// Rutas protegidas (Solo administradores)
router.post(
  "/",
  authenticate,
  requireRole("admin"),
  validateSchema(createFuncionSchema),
  asyncHandler(funcionController.crear)
);

router.put(
  "/:id",
  authenticate,
  requireRole("admin"),
  validateSchema(updateFuncionSchema),
  asyncHandler(funcionController.actualizar)
);

router.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  asyncHandler(funcionController.eliminar)
);

export default router;
