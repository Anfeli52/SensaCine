import { Router } from "express";
import { tarjetaController } from "../../di/container";
import { authenticate } from "../../common/middlewares/authMiddleware";
import { validateSchema } from "../../common/middlewares/validateSchema";
import { asyncHandler } from "../../common/helpers/asyncHandler";
import { createTarjetaSchema, updateSaldoSchema, procesarPagoSchema } from "./tarjeta.validators";

const router = Router();

router.use(authenticate); // Todas las rutas requieren usuario autenticado

router.get("/", asyncHandler(tarjetaController.listar));
router.post("/", validateSchema(createTarjetaSchema), asyncHandler(tarjetaController.crear));
router.patch("/:id/saldo", validateSchema(updateSaldoSchema), asyncHandler(tarjetaController.cambiarSaldo));
router.post("/:id/pagar", validateSchema(procesarPagoSchema), asyncHandler(tarjetaController.procesarPago));
router.delete("/:id", asyncHandler(tarjetaController.eliminar));

export default router;

