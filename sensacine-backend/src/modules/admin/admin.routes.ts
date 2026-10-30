import { Router } from "express";
import { adminController, auditoriaController } from "../../di/container";
import { asyncHandler } from "../../common/helpers/asyncHandler";
import { validateSchema } from "../../common/middlewares/validateSchema";
import { authenticate, requireRole } from "../../common/middlewares/authMiddleware";
import { updateUsuarioRolSchema, updateUsuarioEstadoSchema } from "./admin.validator";

const router = Router();

// Rutas protegidas (Solo administradores)
router.use(authenticate);
router.use(requireRole("admin"));

// Gestión de Usuarios
router.get("/usuarios", asyncHandler(adminController.obtenerUsuarios));

router.patch(
  "/usuarios/:id/rol",
  validateSchema(updateUsuarioRolSchema),
  asyncHandler(adminController.actualizarRol)
);

router.patch(
  "/usuarios/:id/estado",
  validateSchema(updateUsuarioEstadoSchema),
  asyncHandler(adminController.actualizarEstado)
);

// Auditoría para el Administrador
router.get("/auditoria", asyncHandler(auditoriaController.listar));
router.get("/auditoria/:id", asyncHandler(auditoriaController.obtenerPorId));

export default router;
