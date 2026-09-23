import { Router } from "express";
import { menuController } from "../../di/container";
import { asyncHandler } from "../../common/helpers/asyncHandler";
import { authenticate, requireRole } from "../../common/middlewares/authMiddleware";
import { validateSchema } from "../../common/middlewares/validateSchema";
import { createProductoSchema, updateProductoSchema } from "./menu.validator"

const router = Router();

router.get(
    "/",
    authenticate,
    requireRole("admin"),
    asyncHandler(menuController.obtenerTodos)
);

router.get(
    "/:id",
    authenticate,
    requireRole("admin"),
    asyncHandler(menuController.obtenerPorId)
);

router.post(
    "/",
    authenticate,
    requireRole("admin"),
    validateSchema(createProductoSchema),
    asyncHandler(menuController.crear)
);

router.put(
    "/:id",
    authenticate,
    requireRole("admin"),
    validateSchema(updateProductoSchema),
    asyncHandler(menuController.actualizar)
);

router.patch(
    "/:id/estado",
    authenticate,
    requireRole("admin"),
    asyncHandler(menuController.cambiarEstado)
);

router.delete(
    "/:id",
    authenticate,
    requireRole("admin"),
    asyncHandler(menuController.eliminar)
);

export default router;