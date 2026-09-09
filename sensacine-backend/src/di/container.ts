import { AuthController } from "../modules/auth/auth.controller";
import { AuthService } from "../modules/auth/auth.service";
import { PrismaUsuarioRepository } from "../modules/auth/auth.repository";

import { PeliculaController } from "../modules/catalogo/pelicula.controller";
import { PeliculaService } from "../modules/catalogo/pelicula.service";
import { PrismaPeliculaRepository } from "../modules/catalogo/pelicula.repository";

// Módulo Auth
const usuarioRepository = new PrismaUsuarioRepository();
const authService = new AuthService(usuarioRepository);
export const authController = new AuthController(authService);

// Módulo Catálogo (Películas)
const peliculaRepository = new PrismaPeliculaRepository();
const peliculaService = new PeliculaService(peliculaRepository);
export const peliculaController = new PeliculaController(peliculaService);

