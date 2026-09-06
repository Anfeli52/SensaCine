import { Router } from "express";
import { authController } from "../../di/container";
import { asyncHandler } from "../../common/helpers/asyncHandler";
import { validateSchema } from "../../common/middlewares/validateSchema";
import { registerSchema } from "./auth.validator";

const router = Router();

router.post("/register", validateSchema(registerSchema), asyncHandler(authController.register));

export default router;
