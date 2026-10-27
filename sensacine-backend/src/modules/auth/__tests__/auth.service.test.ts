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

describe("AuthService.login", () => {
  const makeRepoConUsuario = async (estado = "activo") => {
    const bcrypt = await import("bcrypt");
    const passwordHash = await bcrypt.hash("supersecreta123", 4);
    return {
      findByEmail: jest.fn(async () => ({
        id: 1, nombre: "Ana", email: "ana@example.com", passwordHash, rol: "cliente", estado,
      })),
      create: jest.fn(),
    } as unknown as IUsuarioRepository;
  };

  it("devuelve un token y el usuario sin passwordHash con credenciales válidas", async () => {
    const service = new AuthService(await makeRepoConUsuario());
    const res = await service.login({ email: "ana@example.com", password: "supersecreta123" });
    expect(res.token).toEqual(expect.any(String));
    expect(res.usuario).toEqual({ id: 1, nombre: "Ana", email: "ana@example.com", rol: "cliente" });
  });

  it("rechaza con 401 si el usuario no existe", async () => {
    const service = new AuthService(makeFakeRepo());
    await expect(service.login({ email: "no@example.com", password: "x" })).rejects.toMatchObject({ statusCode: 401 });
  });

  it("rechaza con 401 si la contraseña es incorrecta", async () => {
    const service = new AuthService(await makeRepoConUsuario());
    await expect(service.login({ email: "ana@example.com", password: "incorrecta" })).rejects.toMatchObject({ statusCode: 401 });
  });

  it("rechaza con 403 si el usuario está inactivo", async () => {
    const service = new AuthService(await makeRepoConUsuario("inactivo"));
    await expect(service.login({ email: "ana@example.com", password: "supersecreta123" })).rejects.toMatchObject({ statusCode: 403 });
  });
});
