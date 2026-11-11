import { Router } from "express";
import { asyncHandler } from "../../common/helpers/asyncHandler";
import { authenticate } from "../../common/middlewares/authMiddleware";
import { validateSchema } from "../../common/middlewares/validateSchema";
import { resenaController } from "../../di/container";
import { crearResenaSchema } from "./resena.validator";

const router = Router();

router.post("/", authenticate, validateSchema(crearResenaSchema), asyncHandler(resenaController.crear));

export default router;
