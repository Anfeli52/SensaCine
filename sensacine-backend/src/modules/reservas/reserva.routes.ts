import { Router } from "express";
import { asyncHandler } from "../../common/helpers/asyncHandler";
import { authenticate } from "../../common/middlewares/authMiddleware";
import { asientoController } from "../../di/container";
const router = Router();

router.get(
    "/halls/:id/seats", 
    authenticate, 
    asyncHandler(asientoController.getAsientosBySala)
);

export default router;
