import { Router } from "express";
import { cocinaController } from "../../di/container";
import { asyncHandler } from "../../common/helpers/asyncHandler";
import { authenticate, requireRole } from "../../common/middlewares/authMiddleware";

const router = Router();

// Rutas protegidas: exclusivamente personal de cocina y administradores
router.use(authenticate);
router.use(requireRole("cocina", "admin"));

router.get("/funciones", asyncHandler(cocinaController.listarFuncionesProgramadas));
router.get("/funciones/:id", asyncHandler(cocinaController.obtenerFuncionPorId));

export default router;
