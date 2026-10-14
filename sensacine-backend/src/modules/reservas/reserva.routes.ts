import { Router } from "express";
import { asyncHandler } from "../../common/helpers/asyncHandler";
import { authenticate, requireRole } from "../../common/middlewares/authMiddleware";
import { validateSchema } from "../../common/middlewares/validateSchema";
import { bloquearAsientosSchema } from "./bloqueo.validator";
import { crearReservaSchema } from "./reserva.validator";
import { asientoController, bloqueoController, historialReservaController, reservaController, reservasAdminController } from "../../di/container";
const router = Router();

router.post(
    "/",
    authenticate,
    validateSchema(crearReservaSchema),
    asyncHandler(reservaController.crear)
);

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
    "/funciones/:id/bloqueos",
    authenticate,
    validateSchema(bloquearAsientosSchema),
    asyncHandler(bloqueoController.bloquear)
);

router.get(
    "/funciones/:id/bloqueos/mio",
    authenticate,
    asyncHandler(bloqueoController.getMio)
);

router.delete(
    "/funciones/:id/bloqueos",
    authenticate,
    asyncHandler(bloqueoController.liberar)
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
