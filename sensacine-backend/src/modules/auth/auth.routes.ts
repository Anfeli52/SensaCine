import { Router } from "express";
import { authController } from "../../di/container";
import { asyncHandler } from "../../common/helpers/asyncHandler";
import { validateSchema } from "../../common/middlewares/validateSchema";
import { registerSchema, loginSchema } from "./auth.validator";

const router = Router();

router.post("/register", validateSchema(registerSchema), asyncHandler(authController.register));
router.post("/login", validateSchema(loginSchema), asyncHandler(authController.login));

export default router;

