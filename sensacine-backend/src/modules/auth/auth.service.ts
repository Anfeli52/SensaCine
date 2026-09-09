import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../../common/errors/AppError";
import { AuthResponseDTO } from "./dtos/AuthResponseDTO";
import { RegisterDTO } from "./dtos/RegisterDTO";
import { LoginDTO } from "./dtos/LoginDTO";
import { LoginResponseDTO } from "./dtos/LoginResponseDTO";
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

  async login(dto: LoginDTO): Promise<LoginResponseDTO> {
    const usuario = await this.usuarioRepo.findByEmail(dto.email);
    if (!usuario) {
      throw new AppError("Credenciales inválidas", 401);
    }

    const passwordMatch = await bcrypt.compare(dto.password, usuario.passwordHash);
    if (!passwordMatch) {
      throw new AppError("Credenciales inválidas", 401);
    }

    if (usuario.estado !== "activo") {
      throw new AppError("El usuario se encuentra inactivo", 403);
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
      },
      env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  }
}

