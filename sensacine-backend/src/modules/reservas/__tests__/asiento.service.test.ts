import { AsientoService } from "../asiento.service";
import { IAsientoNotifier, IAsientoRepository } from "../asiento.types";

const asiento = (id: number) => ({ id, idSala: 1, fila: "A", numero: id }) as any;

describe("AsientoService", () => {
  let repo: jest.Mocked<IAsientoRepository>;
  let notifier: jest.Mocked<IAsientoNotifier>;
  let service: AsientoService;

  beforeEach(() => {
    repo = {
      getAsientosBySala: jest.fn(),
      getFuncionSala: jest.fn(),
      getIdsAsientosOcupados: jest.fn(),
      getBloqueosActivos: jest.fn(),
    };
    notifier = { asientosOcupados: jest.fn(), asientosLiberados: jest.fn() };
    service = new AsientoService(repo, notifier);
  });

  it("getAsientosBySala mapea a DTO", async () => {
    repo.getAsientosBySala.mockResolvedValue([asiento(1)]);
    expect(await service.getAsientosBySala(1)).toEqual([{ id: 1, id_sala: 1, fila: "A", numero: 1 }]);
  });

  it("getDisponibilidadByFuncion lanza 404 si la función no existe", async () => {
    repo.getFuncionSala.mockResolvedValue(null);
    await expect(service.getDisponibilidadByFuncion(1, 1)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("calcula el estado de cada asiento y el bloqueo propio", async () => {
    const expiraEn = new Date(Date.now() + 60_000);
    repo.getFuncionSala.mockResolvedValue({ id: 7, idSala: 1 });
    repo.getAsientosBySala.mockResolvedValue([asiento(1), asiento(2), asiento(3)]);
    repo.getIdsAsientosOcupados.mockResolvedValue([1]);
    repo.getBloqueosActivos.mockResolvedValue([
      { idAsiento: 2, idUsuario: 10, expiraEn },
      { idAsiento: 1, idUsuario: 10, expiraEn }, // ocupado: no cuenta como bloqueo propio
    ]);

    const res = await service.getDisponibilidadByFuncion(7, 10);

    expect(res.asientos.map((a) => a.estado)).toEqual(["ocupado", "pendiente", "disponible"]);
    expect(res.mi_bloqueo?.ids_asiento).toEqual([2]);
    expect(res.mi_bloqueo?.segundos_restantes).toBeGreaterThan(0);
  });

  it("mi_bloqueo es null si el bloqueo es de otro usuario", async () => {
    repo.getFuncionSala.mockResolvedValue({ id: 7, idSala: 1 });
    repo.getAsientosBySala.mockResolvedValue([asiento(1)]);
    repo.getIdsAsientosOcupados.mockResolvedValue([]);
    repo.getBloqueosActivos.mockResolvedValue([{ idAsiento: 1, idUsuario: 99, expiraEn: new Date() }]);
    expect((await service.getDisponibilidadByFuncion(7, 10)).mi_bloqueo).toBeNull();
  });

  it("delega las notificaciones", () => {
    service.notificarOcupados(1, [1]);
    service.notificarLiberados(1, [2]);
    expect(notifier.asientosOcupados).toHaveBeenCalledWith(1, [1]);
    expect(notifier.asientosLiberados).toHaveBeenCalledWith(1, [2]);
  });
});
