import { Router } from "express";
import { asyncHandler } from "../../common/helpers/asyncHandler";
import { authenticate, requireRole } from "../../common/middlewares/authMiddleware";
import { asientoController, historialReservaController, reservasAdminController } from "../../di/container";
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

router.get(
    "/historial",
    authenticate,
    asyncHandler(historialReservaController.getHistorial)
);

router.get(
    "/historial/:id",
    authenticate,
    asyncHandler(historialReservaController.getDetalleReserva)
);

router.get(
    "/admin",
    authenticate,
    requireRole("admin"),
    asyncHandler(reservasAdminController.getAllReservas)
);

router.get(
    "/admin/:id",
    authenticate,
    requireRole("admin"),
    asyncHandler(reservasAdminController.getReservaById)
);

router.post(
    "/halls/:id_hall/seats/:id_seat/reserve",
    authenticate,
    asyncHandler(asientoController.reserveSeat)
)

export default router;
