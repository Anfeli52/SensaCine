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
import { SocketAsientoNotifier } from "../infrastructure/socket/SocketAsientoNotifier";

import { MenuController } from "../modules/menu/menu.controller";
import { MenuService } from "../modules/menu/menu.service";
import { MenuRepository } from "../modules/menu/menu.repository";

import { AdminController } from "../modules/admin/admin.controller";
import { AdminService } from "../modules/admin/admin.service";
import { AdminRepository } from "../modules/admin/admin.repository";

// Módulo Auth
const usuarioRepository = new PrismaUsuarioRepository();
const authService = new AuthService(usuarioRepository);
export const authController = new AuthController(authService);

// Módulo Catálogo (Películas)
const peliculaRepository = new PrismaPeliculaRepository();
const peliculaService = new PeliculaService(peliculaRepository);
export const peliculaController = new PeliculaController(peliculaService);

// Módulo Programación (Salas y Funciones)
const salaRepository = new PrismaSalaRepository();
export const salaService = new SalaService(salaRepository);
export const salaController = new SalaController(salaService);

const funcionRepository = new PrismaFuncionRepository();
export const funcionService = new FuncionService(funcionRepository, peliculaRepository, salaRepository);
export const funcionController = new FuncionController(funcionService);

// Módulo Reservas (Asientos)
const asientoRepository = new PrismaAsientoRepository();
export const asientoService = new AsientoService(asientoRepository, new SocketAsientoNotifier());
export const asientoController = new AsientoController(asientoService);// Módulo Menú
const menuRepository = new MenuRepository();
const menuService = new MenuService(menuRepository);
export const menuController = new MenuController(menuService);

// Módulo Admin
const adminRepository = new AdminRepository();
const adminService = new AdminService(adminRepository);
export const adminController = new AdminController(adminService);