import { Router } from "express";
import { resenasController } from "../../di/container";
import { asyncHandler } from "../../common/helpers/asyncHandler";

const router = Router();

// Consultar reseñas y calificaciones de una película
router.get("/:id/resenas", asyncHandler(resenasController.obtenerPorPelicula));

export default router;
