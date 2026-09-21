import { Router } from "express";
import { adminController } from "../../di/container";
import { asyncHandler } from "../../common/helpers/asyncHandler";
import { validateSchema } from "../../common/middlewares/validateSchema";
import { authenticate, requireRole } from "../../common/middlewares/authMiddleware";
import {updateUsuarioRolSchema, updateUsuarioEstadoSchema,} from "./admin.validator";

const router = Router();

// Rutas protegidas (Solo administradores)

router.get(
  "/usuarios",
  authenticate,
  requireRole("admin"),
  asyncHandler(adminController.obtenerUsuarios)
);

router.patch(
  "/usuarios/:id/rol",
  authenticate,
  requireRole("admin"),
  validateSchema(updateUsuarioRolSchema),
  asyncHandler(adminController.actualizarRol)
);

router.patch(
  "/usuarios/:id/estado",
  authenticate,
  requireRole("admin"),
  validateSchema(updateUsuarioEstadoSchema),
  asyncHandler(adminController.actualizarEstado)
);

export default router;