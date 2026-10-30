import { AuthController } from "../modules/auth/auth.controller";
import { AuthService } from "../modules/auth/auth.service";
import { PrismaUsuarioRepository } from "../modules/auth/auth.repository";

import { PeliculaController } from "../modules/catalogo/pelicula.controller";
import { PeliculaService } from "../modules/catalogo/pelicula.service";
import { PrismaPeliculaRepository } from "../modules/catalogo/pelicula.repository";

import { SalaController } from "../modules/programacion/sala.controller";
import { SalaService } from "../modules/programacion/sala.service";
import { PrismaSalaRepository } from "../modules/programacion/sala.repository";

import { FuncionController } from "../modules/programacion/funcion.controller";
import { FuncionService } from "../modules/programacion/funcion.service";
import { PrismaFuncionRepository } from "../modules/programacion/funcion.repository";

import { AsientoController } from "../modules/reservas/asiento.controller";
import { AsientoService } from "../modules/reservas/asiento.service";
import { PrismaAsientoRepository } from "../modules/reservas/asiento.repository";
import { PrismaBloqueoRepository } from "../modules/reservas/bloqueo.repository";
import { BloqueoService } from "../modules/reservas/bloqueo.service";
import { BloqueoController } from "../modules/reservas/bloqueo.controller";
import { PrismaReservaRepository } from "../modules/reservas/reserva.repository";
import { ReservaService } from "../modules/reservas/reserva.service";
import { ReservaController } from "../modules/reservas/reserva.controller";
import { NotificacionService } from "../modules/notificaciones/notificacion.service";
import { PrismaNotificacionRepository } from "../modules/notificaciones/notificacion.repository";
import { createEmailSender } from "../infrastructure/email/createEmailSender";
import { logger } from "../infrastructure/logger/winston";
import { SocketAsientoNotifier } from "../infrastructure/socket/SocketAsientoNotifier";

import { HistorialReservaRepository } from "../modules/reservas/historial.repository";
import { HistorialReservaService } from "../modules/reservas/historial.service";
import { HistorialReservaController } from "../modules/reservas/historial.controller";

import { MenuController } from "../modules/menu/menu.controller";
import { MenuService } from "../modules/menu/menu.service";
import { MenuRepository } from "../modules/menu/menu.repository";

import { AdminController } from "../modules/admin/admin.controller";
import { AdminService } from "../modules/admin/admin.service";
import { AdminRepository } from "../modules/admin/admin.repository";

import { AuditoriaRepository } from "../modules/auditoria/auditoria.repository";
import { AuditoriaService } from "../modules/auditoria/auditoria.service";
import { AuditoriaController } from "../modules/auditoria/auditoria.controller";

import { ReservasAdminRepository } from "../modules/reservas/reservasAdmin.repository";
import { ReservasAdminService } from "../modules/reservas/reservasAdmin.service";
import { ReservasAdminController } from "../modules/reservas/reservasAdmin.controller";
import { TarjetaController } from "../modules/pagos/tarjeta.controller";
import { TarjetaService } from "../modules/pagos/tarjeta.servicie";
import { TarjetaRepository } from "../modules/pagos/tarjeta.repository";
import { CocinaRepository } from "../modules/cocina/cocina.repository";
import { CocinaService } from "../modules/cocina/cocina.service";
import { CocinaController } from "../modules/cocina/cocina.controller";

// Módulo Auditoría
export const auditoriaRepository = new AuditoriaRepository();
export const auditoriaService = new AuditoriaService(auditoriaRepository);
export const auditoriaController = new AuditoriaController(auditoriaService);

// Módulo Auth
const usuarioRepository = new PrismaUsuarioRepository();
const authService = new AuthService(usuarioRepository);
export const authController = new AuthController(authService);

// Módulo Catálogo (Películas)
const peliculaRepository = new PrismaPeliculaRepository();
const peliculaService = new PeliculaService(peliculaRepository, auditoriaService);
export const peliculaController = new PeliculaController(peliculaService);

// Módulo Programación (Salas y Funciones)
const salaRepository = new PrismaSalaRepository();
export const salaService = new SalaService(salaRepository, auditoriaService);
export const salaController = new SalaController(salaService);

const funcionRepository = new PrismaFuncionRepository();
export const funcionService = new FuncionService(
  funcionRepository,
  peliculaRepository,
  salaRepository,
  auditoriaService
);
export const funcionController = new FuncionController(funcionService);

// Módulo Reservas (Asientos)
const asientoRepository = new PrismaAsientoRepository();
export const asientoService = new AsientoService(asientoRepository, new SocketAsientoNotifier());
export const asientoController = new AsientoController(asientoService);

// Módulo Reservas (Bloqueo temporal de asientos "Pendiente")
export const bloqueoService = new BloqueoService(new PrismaBloqueoRepository(), new SocketAsientoNotifier());
export const bloqueoController = new BloqueoController(bloqueoService);

// Módulo Reservas (Creación de la reserva real: pago + asientos + comensales + cocina)
// Módulo Notificaciones (correo de confirmación de la reserva)
const { sender: emailSender, proveedor: proveedorCorreo } = createEmailSender();
logger.info(`Correo de confirmación: ${proveedorCorreo === "gmail_api" ? "Gmail API (HTTPS)" : "SMTP"}`);
export const notificacionService = new NotificacionService(new PrismaNotificacionRepository(), emailSender);

export const reservaService = new ReservaService(
  new PrismaReservaRepository(),
  bloqueoService,
  new SocketAsientoNotifier(),
  notificacionService
);
export const reservaController = new ReservaController(reservaService);

// Módulo Reservas (Historial de Reservas)
const historialReservaRepository = new HistorialReservaRepository();
const historialReservaService = new HistorialReservaService(historialReservaRepository);
export const historialReservaController = new HistorialReservaController(historialReservaService);

// Módulo Menú
const menuRepository = new MenuRepository();
const menuService = new MenuService(menuRepository);
export const menuController = new MenuController(menuService);

// Módulo Admin
const adminRepository = new AdminRepository();
const adminService = new AdminService(adminRepository, auditoriaService);
export const adminController = new AdminController(adminService);

// Módulo Reservas Admin
const reservasAdminRepository = new ReservasAdminRepository();
const reservasAdminService = new ReservasAdminService(reservasAdminRepository);
export const reservasAdminController = new ReservasAdminController(reservasAdminService);

// Módulo Pagos
const tarjetaRepository = new TarjetaRepository();
const tarjetaService = new TarjetaService(tarjetaRepository);
export const tarjetaController = new TarjetaController(tarjetaService);

// Módulo Cocina (HU-29)
const cocinaRepository = new CocinaRepository();
export const cocinaService = new CocinaService(cocinaRepository, auditoriaService);
export const cocinaController = new CocinaController(cocinaService);
