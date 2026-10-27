import { BloqueoService } from "../bloqueo.service";
import { ConflictoBloqueoError, IBloqueoNotifier, IBloqueoRepository } from "../bloqueo.types";
import { AppError } from "../../../common/errors/AppError";

const asiento = (id: number, idSala = 1) => ({ id, idSala, fila: "A", numero: id }) as any;

describe("BloqueoService", () => {
  let repo: jest.Mocked<IBloqueoRepository>;
  let notifier: jest.Mocked<IBloqueoNotifier>;
  let service: BloqueoService;

  beforeEach(() => {
    repo = {
      getFuncionSala: jest.fn(),
      getAsientosByIds: jest.fn(),
      getIdsAsientosReservados: jest.fn(),
      getBloqueosUsuario: jest.fn(),
      reemplazarBloqueosUsuario: jest.fn(),
      liberarBloqueosUsuario: jest.fn(),
      eliminarVencidos: jest.fn(),
    };
    notifier = { asientosPendientes: jest.fn(), asientosLiberados: jest.fn() };
    service = new BloqueoService(repo, notifier);
  });

  describe("bloquear", () => {
    it("lanza 404 si la función no existe", async () => {
      repo.getFuncionSala.mockResolvedValue(null);
      await expect(service.bloquear(1, 2, [1])).rejects.toMatchObject({ statusCode: 404 });
    });

    it("lanza 400 si algún asiento no pertenece a la sala de la función", async () => {
      repo.getFuncionSala.mockResolvedValue({ id: 1, idSala: 1 });
      repo.getAsientosByIds.mockResolvedValue([asiento(1), asiento(2, 99)]);
      await expect(service.bloquear(1, 2, [1, 2])).rejects.toMatchObject({ statusCode: 400 });
    });

    it("lanza 409 si algún asiento ya está reservado", async () => {
      repo.getFuncionSala.mockResolvedValue({ id: 1, idSala: 1 });
      repo.getAsientosByIds.mockResolvedValue([asiento(1)]);
      repo.getIdsAsientosReservados.mockResolvedValue([1]);
      await expect(service.bloquear(1, 2, [1])).rejects.toMatchObject({ statusCode: 409 });
      expect(repo.reemplazarBloqueosUsuario).not.toHaveBeenCalled();
    });

    it("bloquea los asientos, elimina duplicados y notifica", async () => {
      const expiraEn = new Date(Date.now() + 60_000);
      repo.getFuncionSala.mockResolvedValue({ id: 1, idSala: 1 });
      repo.getAsientosByIds.mockResolvedValue([asiento(1), asiento(2)]);
      repo.getIdsAsientosReservados.mockResolvedValue([]);
      repo.reemplazarBloqueosUsuario.mockResolvedValue({
        bloqueos: [{ idAsiento: 1, idUsuario: 2, expiraEn }],
        liberados: [5],
      });

      const res = await service.bloquear(1, 2, [1, 2, 2]);

      expect(repo.getAsientosByIds).toHaveBeenCalledWith([1, 2]);
      expect(res.ids_asiento).toEqual([1, 2]);
      expect(res.segundos_restantes).toBeGreaterThan(0);
      expect(notifier.asientosLiberados).toHaveBeenCalledWith(1, [5]);
      expect(notifier.asientosPendientes).toHaveBeenCalledWith(1, [1, 2], 2);
    });

    it("traduce ConflictoBloqueoError a 409", async () => {
      repo.getFuncionSala.mockResolvedValue({ id: 1, idSala: 1 });
      repo.getAsientosByIds.mockResolvedValue([asiento(1)]);
      repo.getIdsAsientosReservados.mockResolvedValue([]);
      repo.reemplazarBloqueosUsuario.mockRejectedValue(new ConflictoBloqueoError([1]));
      await expect(service.bloquear(1, 2, [1])).rejects.toMatchObject({ statusCode: 409 });
      expect(notifier.asientosPendientes).not.toHaveBeenCalled();
    });

    it("propaga errores inesperados", async () => {
      repo.getFuncionSala.mockResolvedValue({ id: 1, idSala: 1 });
      repo.getAsientosByIds.mockResolvedValue([asiento(1)]);
      repo.getIdsAsientosReservados.mockResolvedValue([]);
      repo.reemplazarBloqueosUsuario.mockRejectedValue(new Error("boom"));
      await expect(service.bloquear(1, 2, [1])).rejects.toThrow("boom");
    });
  });

  describe("getMiBloqueo", () => {
    it("devuelve null si el usuario no tiene bloqueos", async () => {
      repo.getBloqueosUsuario.mockResolvedValue([]);
      expect(await service.getMiBloqueo(1, 2)).toBeNull();
    });

    it("devuelve el bloqueo vigente del usuario", async () => {
      const expiraEn = new Date(Date.now() + 30_000);
      repo.getBloqueosUsuario.mockResolvedValue([
        { idAsiento: 1, idUsuario: 2, expiraEn },
        { idAsiento: 2, idUsuario: 2, expiraEn },
      ]);
      const res = await service.getMiBloqueo(1, 2);
      expect(res?.ids_asiento).toEqual([1, 2]);
    });
  });

  describe("verificarBloqueoVigente", () => {
    const vigente = (...ids: number[]) =>
      ids.map((idAsiento) => ({ idAsiento, idUsuario: 2, expiraEn: new Date() }));

    it("no lanza si retiene exactamente los asientos pedidos", async () => {
      repo.getBloqueosUsuario.mockResolvedValue(vigente(1, 2));
      await expect(service.verificarBloqueoVigente(1, 2, [2, 1])).resolves.toBeUndefined();
    });

    it("lanza 409 si falta algún asiento", async () => {
      repo.getBloqueosUsuario.mockResolvedValue(vigente(1));
      await expect(service.verificarBloqueoVigente(1, 2, [1, 2])).rejects.toBeInstanceOf(AppError);
    });

    it("lanza 409 si retiene asientos de más", async () => {
      repo.getBloqueosUsuario.mockResolvedValue(vigente(1, 2));
      await expect(service.verificarBloqueoVigente(1, 2, [1])).rejects.toMatchObject({ statusCode: 409 });
    });

    it("lanza 409 si no se piden asientos", async () => {
      repo.getBloqueosUsuario.mockResolvedValue([]);
      await expect(service.verificarBloqueoVigente(1, 2, [])).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  describe("liberar", () => {
    it("notifica solo si había asientos liberados", async () => {
      repo.liberarBloqueosUsuario.mockResolvedValueOnce([1, 2]).mockResolvedValueOnce([]);
      await service.liberar(1, 2);
      await service.liberar(1, 2);
      expect(notifier.asientosLiberados).toHaveBeenCalledTimes(1);
      expect(notifier.asientosLiberados).toHaveBeenCalledWith(1, [1, 2]);
    });
  });

  describe("liberarVencidos", () => {
    it("notifica por función y devuelve el total liberado", async () => {
      repo.eliminarVencidos.mockResolvedValue(new Map([[1, [1, 2]], [2, [3]]]));
      expect(await service.liberarVencidos()).toBe(3);
      expect(notifier.asientosLiberados).toHaveBeenCalledTimes(2);
    });
  });
});
