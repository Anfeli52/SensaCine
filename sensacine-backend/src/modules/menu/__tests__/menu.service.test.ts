import { MenuService } from "../menu.service";
import { MenuRepository } from "../menu.repository";

const producto = {
  id: 1,
  idPelicula: 3,
  nombre: "Plato",
  descripcion: "Rico",
  categoria: "entrada",
  estado: "activo",
  ordenMenu: 1,
  imagenUrl: null,
} as any;

describe("MenuService", () => {
  let repo: jest.Mocked<Partial<MenuRepository>>;
  let service: MenuService;

  beforeEach(() => {
    repo = {
      peliculaExiste: jest.fn(),
      obtenerProductosPorPelicula: jest.fn(),
      obtenerTodosLosProductos: jest.fn(),
      obtenerProductoPorId: jest.fn(),
      ordenMenuExiste: jest.fn(),
      crearProducto: jest.fn(),
      actualizarProducto: jest.fn(),
      eliminarProducto: jest.fn(),
    };
    service = new MenuService(repo as MenuRepository);
  });

  describe("obtenerMenuPorPelicula", () => {
    it("lanza 404 si la película no existe", async () => {
      (repo.peliculaExiste as jest.Mock).mockResolvedValue(false);
      await expect(service.obtenerMenuPorPelicula(3)).rejects.toMatchObject({ statusCode: 404 });
    });

    it("devuelve los productos mapeados a DTO", async () => {
      (repo.peliculaExiste as jest.Mock).mockResolvedValue(true);
      (repo.obtenerProductosPorPelicula as jest.Mock).mockResolvedValue([producto]);
      const res = await service.obtenerMenuPorPelicula(3);
      expect(res[0]).toMatchObject({ id_producto: 1, id_pelicula: 3, orden_menu: 1 });
    });
  });

  it("obtenerTodosLosProductos mapea a DTO", async () => {
    (repo.obtenerTodosLosProductos as jest.Mock).mockResolvedValue([producto]);
    expect(await service.obtenerTodosLosProductos()).toHaveLength(1);
  });

  describe("obtenerProductoPorId", () => {
    it("lanza 404 si no existe", async () => {
      (repo.obtenerProductoPorId as jest.Mock).mockResolvedValue(null);
      await expect(service.obtenerProductoPorId(1)).rejects.toMatchObject({ statusCode: 404 });
    });
    it("devuelve el producto", async () => {
      (repo.obtenerProductoPorId as jest.Mock).mockResolvedValue(producto);
      expect((await service.obtenerProductoPorId(1)).nombre).toBe("Plato");
    });
  });

  describe("crearProducto", () => {
    const input = { idPelicula: 3, ordenMenu: 1 } as any;

    it("lanza 404 si la película no existe", async () => {
      (repo.peliculaExiste as jest.Mock).mockResolvedValue(false);
      await expect(service.crearProducto(input)).rejects.toMatchObject({ statusCode: 404 });
    });

    it("lanza 400 si el orden ya existe", async () => {
      (repo.peliculaExiste as jest.Mock).mockResolvedValue(true);
      (repo.ordenMenuExiste as jest.Mock).mockResolvedValue(true);
      await expect(service.crearProducto(input)).rejects.toMatchObject({ statusCode: 400 });
      expect(repo.crearProducto).not.toHaveBeenCalled();
    });

    it("crea el producto", async () => {
      (repo.peliculaExiste as jest.Mock).mockResolvedValue(true);
      (repo.ordenMenuExiste as jest.Mock).mockResolvedValue(false);
      (repo.crearProducto as jest.Mock).mockResolvedValue(producto);
      expect((await service.crearProducto(input)).id_producto).toBe(1);
    });
  });

  describe("actualizarProducto", () => {
    it("lanza 404 si el producto no existe", async () => {
      (repo.obtenerProductoPorId as jest.Mock).mockResolvedValue(null);
      await expect(service.actualizarProducto(1, {} as any)).rejects.toMatchObject({ statusCode: 404 });
    });

    it("lanza 400 si el orden choca con otro producto", async () => {
      (repo.obtenerProductoPorId as jest.Mock).mockResolvedValue(producto);
      (repo.ordenMenuExiste as jest.Mock).mockResolvedValue(true);
      await expect(service.actualizarProducto(1, { ordenMenu: 2 } as any)).rejects.toMatchObject({ statusCode: 400 });
    });

    it("lanza 404 si la nueva película no existe", async () => {
      (repo.obtenerProductoPorId as jest.Mock).mockResolvedValue(producto);
      (repo.ordenMenuExiste as jest.Mock).mockResolvedValue(false);
      (repo.peliculaExiste as jest.Mock).mockResolvedValue(false);
      await expect(service.actualizarProducto(1, { idPelicula: 99 } as any)).rejects.toMatchObject({ statusCode: 404 });
    });

    it("actualiza el producto", async () => {
      (repo.obtenerProductoPorId as jest.Mock).mockResolvedValue(producto);
      (repo.ordenMenuExiste as jest.Mock).mockResolvedValue(false);
      (repo.actualizarProducto as jest.Mock).mockResolvedValue({ ...producto, nombre: "Nuevo" });
      expect((await service.actualizarProducto(1, { nombre: "Nuevo" } as any)).nombre).toBe("Nuevo");
    });
  });

  describe("eliminarProducto", () => {
    it("lanza 404 si no existe", async () => {
      (repo.obtenerProductoPorId as jest.Mock).mockResolvedValue(null);
      await expect(service.eliminarProducto(1)).rejects.toMatchObject({ statusCode: 404 });
    });

    it("elimina el producto", async () => {
      (repo.obtenerProductoPorId as jest.Mock).mockResolvedValue(producto);
      expect(await service.eliminarProducto(1)).toMatchObject({ id: 1 });
    });

    it("traduce la violación de clave foránea (P2003) a 400", async () => {
      (repo.obtenerProductoPorId as jest.Mock).mockResolvedValue(producto);
      (repo.eliminarProducto as jest.Mock).mockRejectedValue({ code: "P2003" });
      await expect(service.eliminarProducto(1)).rejects.toMatchObject({ statusCode: 400 });
    });

    it("propaga otros errores", async () => {
      (repo.obtenerProductoPorId as jest.Mock).mockResolvedValue(producto);
      (repo.eliminarProducto as jest.Mock).mockRejectedValue(new Error("boom"));
      await expect(service.eliminarProducto(1)).rejects.toThrow("boom");
    });
  });
});
