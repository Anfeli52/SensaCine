import bcrypt from "bcrypt";
import { env } from "../../config/env";
import { AppError } from "../../common/errors/AppError";
import { AuthResponseDTO } from "./dtos/AuthResponseDTO";
import { RegisterDTO } from "./dtos/RegisterDTO";
import { IUsuarioRepository } from "./auth.types";

export class AuthService {
  // Inyección de dependencias por constructor: en el test le pasamos
  // un repositorio falso; en producción, PrismaUsuarioRepository (ver di/container.ts).
  constructor(private usuarioRepo: IUsuarioRepository) {}

  async register(dto: RegisterDTO): Promise<AuthResponseDTO> {
    const existing = await this.usuarioRepo.findByEmail(dto.email);
    if (existing) {
      throw new AppError("Ya existe un usuario registrado con este email", 409);
    }

    const passwordHash = await bcrypt.hash(dto.password, env.BCRYPT_SALT_ROUNDS);

    const usuario = await this.usuarioRepo.create({
      nombre: dto.nombre,
      email: dto.email,
      passwordHash,
    });

    // Mapeo manual: así garantizamos que passwordHash NUNCA sale de aquí,
    // aunque en el futuro se agreguen más columnas sensibles a la tabla usuario.
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };
  }
}
