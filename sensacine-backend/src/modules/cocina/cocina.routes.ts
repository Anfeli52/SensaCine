import { Router } from "express";
import { cocinaController } from "../../di/container";
import { asyncHandler } from "../../common/helpers/asyncHandler";
import { authenticate, requireRole } from "../../common/middlewares/authMiddleware";
import { validateSchema } from "../../common/middlewares/validateSchema";
import { updateEstadoOrdenSchema } from "./cocina.validator";

const router = Router();

// Rutas protegidas: exclusivamente personal de cocina y administradores
router.use(authenticate);
router.use(requireRole("cocina", "admin"));

router.get("/funciones", asyncHandler(cocinaController.listarFuncionesProgramadas));
router.get("/funciones/:id", asyncHandler(cocinaController.obtenerFuncionPorId));

router.get("/ordenes/:id", asyncHandler(cocinaController.obtenerOrdenPorId));
router.patch(
  "/ordenes/:id/estado",
  validateSchema(updateEstadoOrdenSchema),
  asyncHandler(cocinaController.actualizarEstadoOrden)
);
router.patch(
  "/ordenes/:id",
  validateSchema(updateEstadoOrdenSchema),
  asyncHandler(cocinaController.actualizarEstadoOrden)
);

export default router;
