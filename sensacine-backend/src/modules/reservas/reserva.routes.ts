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

router.get(
    "/funciones/:id/seats",
    authenticate,
    asyncHandler(asientoController.getDisponibilidadByFuncion)
);

router.post(
    "/halls/:id_hall/seats/:id_seat/reserve",
    authenticate,
    asyncHandler(asientoController.reserveSeat)
)

export default router;
