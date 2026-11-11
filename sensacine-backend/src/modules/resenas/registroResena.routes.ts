import { Router } from "express";
import { asyncHandler } from "../../common/helpers/asyncHandler";
import { authenticate } from "../../common/middlewares/authMiddleware";
import { validateSchema } from "../../common/middlewares/validateSchema";
import { registroResenaController } from "../../di/container";
import { crearResenaSchema } from "./registroResena.validator";

const router = Router();

router.post("/", authenticate, validateSchema(crearResenaSchema), asyncHandler(registroResenaController.crear));

export default router;
