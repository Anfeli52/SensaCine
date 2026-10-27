import { ReservasAdminService } from "../reservasAdmin.service";
import { ReservasAdminRepository } from "../reservasAdmin.repository";

describe("ReservasAdminService", () => {
  let repo: jest.Mocked<Partial<ReservasAdminRepository>>;
  let service: ReservasAdminService;

  beforeEach(() => {
    repo = { getAll: jest.fn(), getById: jest.fn(), updateEstado: jest.fn() };
    service = new ReservasAdminService(repo as ReservasAdminRepository);
  });

  it("getAllReservas y getReservaById delegan en el repositorio", async () => {
    (repo.getAll as jest.Mock).mockResolvedValue([{ id: 1 }]);
    (repo.getById as jest.Mock).mockResolvedValue({ id: 1 });
    expect(await service.getAllReservas()).toEqual([{ id: 1 }]);
    expect(await service.getReservaById(1)).toEqual({ id: 1 });
  });

  it("updateEstado rechaza estados inválidos con 400", async () => {
    await expect(service.updateEstado(1, "Inventado")).rejects.toMatchObject({ statusCode: 400 });
    expect(repo.getById).not.toHaveBeenCalled();
  });

  it("updateEstado lanza 404 si la reserva no existe", async () => {
    (repo.getById as jest.Mock).mockResolvedValue(null);
    await expect(service.updateEstado(1, "Cancelado")).rejects.toMatchObject({ statusCode: 404 });
  });

  it("updateEstado actualiza una reserva existente", async () => {
    (repo.getById as jest.Mock).mockResolvedValue({ id: 1 });
    (repo.updateEstado as jest.Mock).mockResolvedValue({ id: 1, estado: "Cancelado" });
    expect(await service.updateEstado(1, "Cancelado")).toEqual({ id: 1, estado: "Cancelado" });
    expect(repo.updateEstado).toHaveBeenCalledWith(1, "Cancelado");
  });
});
