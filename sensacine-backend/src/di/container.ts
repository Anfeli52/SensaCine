import { AuthController } from "../modules/auth/auth.controller";
import { AuthService } from "../modules/auth/auth.service";
import { PrismaUsuarioRepository } from "../modules/auth/auth.repository";

// Aquí es donde "conectamos los cables": le decimos a AuthService que use
// PrismaUsuarioRepository como implementación real de IUsuarioRepository.
// Si el día de mañana cambian de ORM, este es el ÚNICO archivo que cambia
// para todo el módulo auth.
const usuarioRepository = new PrismaUsuarioRepository();
const authService = new AuthService(usuarioRepository);
export const authController = new AuthController(authService);

// A medida que se implementen los demás módulos (catalogo, menu, reservas...),
// se instancian y exportan aquí siguiendo el mismo patrón, por ejemplo:
//
// const peliculaRepository = new PrismaPeliculaRepository();
// const peliculaService = new PeliculaService(peliculaRepository);
// export const peliculaController = new PeliculaController(peliculaService);
