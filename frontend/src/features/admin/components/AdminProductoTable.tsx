import { useState } from "react";
import { AdminProducto } from "../types/producto.types";
import { Pelicula } from "../../catalogo/types";
import { Button } from "../../../shared/components/Button";
import { Search, Pencil, Trash2, Film, Plus, ListOrdered, UtensilsCrossed, ChevronDown } from "lucide-react";

interface AdminProductoTableProps {
    productos: AdminProducto[];
    peliculas: Pelicula[];
    onEdit: (producto: AdminProducto) => void;
    onDelete: (producto: AdminProducto) => void;
    onAddNew: () => void;
}

export function AdminProductoTable({
    productos,
    peliculas,
    onEdit,
    onDelete,
    onAddNew,
}: Readonly<AdminProductoTableProps>) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPeliculaId, setSelectedPeliculaId] = useState<string>("todas");

    const getPelicula = (idPelicula: number) => {
        return peliculas.find((pelicula) => pelicula.id === idPelicula);
    };

    const filteredProductos = productos.filter((producto) => {
        const pelicula = getPelicula(producto.id_pelicula);
        const movieTitle = pelicula?.titulo || "";

        const matchesSearch =
            producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            movieTitle.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesPelicula =
            selectedPeliculaId === "todas" ||
            String(producto.id_pelicula) === selectedPeliculaId;

        return matchesSearch && matchesPelicula;
    });

    const renderStatusBadge = (estado: string) => {
        if (estado === "activo") {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-applePill text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Activo</span>
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-applePill text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                <span>Inactivo</span>
            </span>
        );
    };

    return (
        <div className="bg-white rounded-appleXl border border-[#e5e5ea] shadow-appleCard overflow-hidden">
            {/* Table Controls */}
            <div className="p-4 sm:p-5 border-b border-[#f0f0f0] flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Search */}
                <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2" />

                    <input
                        type="text"
                        placeholder="Buscar por producto o película..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-[#f5f5f7] border border-transparent hover:border-[#e5e5ea] focus:border-[#0071e3] rounded-appleMd text-[13px] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none transition-colors"
                    />
                </div>

                {/* Movie Filter */}
                <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
                    <div className="flex items-center gap-1.5 bg-[#f5f5f7] px-3 py-1.5 rounded-appleMd border border-transparent hover:border-[#e5e5ea]">
                        <Film className="w-3.5 h-3.5 text-[#86868b]" />

                        <select
                            value={selectedPeliculaId}
                            onChange={(e) => setSelectedPeliculaId(e.target.value)}
                            className="appearance-none bg-transparent text-[12px] text-[#1d1d1f] font-medium focus:outline-none cursor-pointer"
                        >
                            <option value="todas">Todas las películas</option>

                            {peliculas.map((pelicula) => (
                                <option key={pelicula.id} value={String(pelicula.id)}>
                                    {pelicula.titulo}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="w-3 h-3 text-[#86868b] right-0 top-1/2 -translate-y-1/2" />

                    </div>
                </div>
            </div>

            {/* Table */}
            {filteredProductos.length === 0 ? (
                <div className="py-16 px-6 text-center">
                    <div className="w-12 h-12 rounded-applePill bg-[#f5f5f7] flex items-center justify-center mx-auto mb-3 text-[#86868b]">
                        <UtensilsCrossed className="w-6 h-6" />
                    </div>

                    <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-1">
                        No se encontraron productos
                    </h3>

                    <p className="text-[13px] text-[#86868b] max-w-sm mx-auto mb-5">
                        {searchTerm || selectedPeliculaId !== "todas"
                            ? "Prueba cambiando los filtros o el término de búsqueda."
                            : "Comienza agregando el primer producto gastronómico al menú."}
                    </p>

                    <Button
                        variant="primary"
                        size="sm"
                        onClick={onAddNew}
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                        Agregar Producto
                    </Button>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#f0f0f0] bg-[#fafafc] text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">
                                <th className="py-3.5 px-5">Producto</th>
                                <th className="py-3.5 px-4">Película</th>
                                <th className="py-3.5 px-4">Categoría</th>
                                <th className="py-3.5 px-4">Orden</th>
                                <th className="py-3.5 px-4">Estado</th>
                                <th className="py-3.5 px-5 text-right">Acciones</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#f0f0f0] text-[13px]">
                            {filteredProductos.map((producto) => {
                                const pelicula = getPelicula(producto.id_pelicula);

                                return (
                                    <tr
                                        key={producto.id_producto}
                                        className="hover:bg-[#fafafc] transition-colors group"
                                    >
                                        {/* Producto */}
                                        <td className="py-3.5 px-5">
                                            <div className="flex items-center gap-3.5">
                                                <div className="w-12 h-12 rounded-appleSm overflow-hidden bg-[#f0f0f5] flex-shrink-0 border border-[#e5e5ea] flex items-center justify-center shadow-sm">
                                                    {producto.imagen_url ? (
                                                        <img
                                                            src={producto.imagen_url}
                                                            alt={producto.nombre}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <UtensilsCrossed className="w-4 h-4 text-[#86868b]" />
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <h4 className="font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors line-clamp-1">
                                                        {producto.nombre}
                                                    </h4>

                                                    <span className="text-[11px] text-[#86868b] line-clamp-1">
                                                        {producto.descripcion || "Sin descripción"}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Película */}
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-1.5 text-[#1d1d1f] font-medium">
                                                <Film className="w-3.5 h-3.5 text-[#0071e3]" />

                                                <span className="max-w-[180px] truncate">
                                                    {pelicula?.titulo ||
                                                        `Película #${producto.id_pelicula}`}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Categoría */}
                                        <td className="py-3.5 px-4">
                                            <span className="text-[#1d1d1f] font-medium capitalize">
                                                {producto.categoria?.replace(/_/g, " ") || "Sin categoría"}
                                            </span>
                                        </td>

                                        {/* Orden */}
                                        <td className="py-3.5 px-4">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f5f5f7] rounded-applePill text-[#1d1d1f] font-medium">
                                                <ListOrdered className="w-3.5 h-3.5 text-[#0071e3]" />

                                                <span>
                                                    {producto.orden_menu ?? "-"}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Estado */}
                                        <td className="py-3.5 px-4">
                                            {renderStatusBadge(producto.estado)}
                                        </td>

                                        {/* Acciones */}
                                        <td className="py-3.5 px-5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => onEdit(producto)}
                                                    className="p-2 h-8 w-8 rounded-appleMd bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] border-transparent"
                                                    title="Editar producto"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </Button>

                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => onDelete(producto)}
                                                    className="p-2 h-8 w-8 rounded-appleMd bg-red-50 hover:bg-red-100 text-red-600 border-transparent"
                                                    title="Eliminar producto"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}