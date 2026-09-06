import { AuthService } from "../auth.service";
import { IUsuarioRepository } from "../auth.types";
import { AppError } from "../../../common/errors/AppError";

// Repositorio falso en memoria: ni conecta a MySQL ni importa Prisma.
function makeFakeRepo(existingEmails: string[] = []): IUsuarioRepository {
  return {
    findByEmail: jest.fn(async (email: string) =>
      existingEmails.includes(email)
        ? ({ id: 1, email, nombre: "x", passwordHash: "x", rol: "cliente" } as any)
        : null
    ),
    create: jest.fn(async (data) => ({
      id: 1,
      nombre: data.nombre,
      email: data.email,
      passwordHash: data.passwordHash,
      rol: "cliente",
      estado: "activo",
      fechaRegistro: new Date(),
    })) as any,
  };
}

describe("AuthService.register", () => {
  it("crea el usuario y nunca devuelve el passwordHash", async () => {
    const repo = makeFakeRepo();
    const service = new AuthService(repo);

    const result = await service.register({
      nombre: "Ana Torres",
      email: "ana@example.com",
      password: "supersecreta123",
    });

    expect(result.email).toBe("ana@example.com");
    expect(result).not.toHaveProperty("passwordHash");
    expect(repo.create).toHaveBeenCalledTimes(1);
  });

  it("rechaza el registro si el email ya existe", async () => {
    const repo = makeFakeRepo(["ana@example.com"]);
    const service = new AuthService(repo);

    await expect(
      service.register({ nombre: "Ana", email: "ana@example.com", password: "supersecreta123" })
    ).rejects.toThrow(AppError);
  });
});
