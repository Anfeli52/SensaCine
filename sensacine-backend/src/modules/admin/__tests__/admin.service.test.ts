import { AdminService } from "../admin.service";
import { AdminRepository } from "../admin.repository";

const usuario = {
  id: 1,
  nombre: "Ana",
  email: "ana@test.com",
  rol: "cliente",
  estado: "activo",
  fechaRegistro: new Date("2026-01-01"),
  passwordHash: "secreto",
};
const dto = { id: 1, nombre: "Ana", email: "ana@test.com", rol: "cliente", estado: "activo", fechaRegistro: usuario.fechaRegistro };

describe("AdminService", () => {
  let repo: jest.Mocked<Partial<AdminRepository>>;
  let service: AdminService;

  beforeEach(() => {
    repo = { obtenerUsuarios: jest.fn(), actualizarRol: jest.fn(), actualizarEstado: jest.fn() };
    service = new AdminService(repo as AdminRepository);
  });

  it("obtenerUsuarios nunca expone el passwordHash", async () => {
    (repo.obtenerUsuarios as jest.Mock).mockResolvedValue([usuario]);
    const res = await service.obtenerUsuarios();
    expect(res).toEqual([dto]);
    expect(res[0]).not.toHaveProperty("passwordHash");
  });

  it("actualizarRol devuelve el usuario como DTO", async () => {
    (repo.actualizarRol as jest.Mock).mockResolvedValue(usuario);
    expect(await service.actualizarRol(1, "admin" as any)).toEqual(dto);
    expect(repo.actualizarRol).toHaveBeenCalledWith(1, "admin");
  });

  it("actualizarEstado devuelve el usuario como DTO", async () => {
    (repo.actualizarEstado as jest.Mock).mockResolvedValue(usuario);
    expect(await service.actualizarEstado(1, "inactivo")).toEqual(dto);
  });
});
