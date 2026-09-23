import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Modal } from "../../../shared/components/Modal";
import { Button } from "../../../shared/components/Button";
import { AdminProducto, CreateProductoInput } from "../types/producto.types";
import { Pelicula } from "../../catalogo/types";
import { Film, UtensilsCrossed, ListOrdered, Image, AlertCircle, AlertTriangle, CheckCircle2, FileText } from "lucide-react";

interface AdminProductoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateProductoInput) => Promise<void>;
    productoToEdit?: AdminProducto | null;
    peliculas: Pelicula[];
    existingProductos?: AdminProducto[];
    isLoading?: boolean;
}

export function AdminProductoModal({
    isOpen,
    onClose,
    onSubmit,
    productoToEdit,
    peliculas,
    existingProductos = [],
    isLoading = false,
}: Readonly<AdminProductoModalProps>) {
    const isEditing = !productoToEdit ? false : true;

    const [nombre, setNombre] = useState<string>("");
    const [descripcion, setDescripcion] = useState<string>("");
    const [categoria, setCategoria] = useState<string>("");
    const [idPelicula, setIdPelicula] = useState<number>(peliculas[0]?.id || 0);
    const [ordenMenu, setOrdenMenu] = useState<number>(1);
    const [imagenUrl, setImagenUrl] = useState<string>("");
    const [estado, setEstado] = useState<"activo" | "inactivo">("activo");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const selectedPelicula = peliculas.find((pelicula) => pelicula.id === idPelicula);

    const detectedOrderConflict = (() => {
        if (!idPelicula || !ordenMenu) return null;

        return (
            existingProductos.find((producto) => {
                if (producto.id_pelicula !== idPelicula) return false;

                if (
                    isEditing &&
                    producto.id_producto === productoToEdit?.id_producto
                ) {
                    return false;
                }

                return producto.orden_menu === ordenMenu;
            }) || null
        );
    })();

    useEffect(() => {
        if (productoToEdit) {
            setNombre(productoToEdit.nombre);
            setDescripcion(productoToEdit.descripcion || "");
            setCategoria(productoToEdit.categoria || "");
            setIdPelicula(productoToEdit.id_pelicula);
            setOrdenMenu(productoToEdit.orden_menu || 1);
            setImagenUrl(productoToEdit.imagen_url || "");
            setEstado(productoToEdit.estado);
        } else {
            const firstPelicula = peliculas[0];

            setNombre("");
            setDescripcion("");
            setCategoria("");
            setIdPelicula(firstPelicula?.id || 0);
            setOrdenMenu(1);
            setImagenUrl("");
            setEstado("activo");
        }

        setErrorMsg(null);
    }, [productoToEdit, isOpen, peliculas]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        if (!nombre.trim()) {
            setErrorMsg("El nombre del producto es obligatorio.");
            return;
        }

        if (!descripcion.trim()) {
            setErrorMsg("La descripción del producto es obligatoria.");
            return;
        }

        if (!categoria.trim()) {
            setErrorMsg("La categoría del producto es obligatoria.");
            return;
        }

        if (!idPelicula) {
            setErrorMsg("Debes seleccionar una película.");
            return;
        }

        if (!ordenMenu || ordenMenu <= 0) {
            setErrorMsg("El número de orden debe ser mayor a 0.");
            return;
        }

        if (!imagenUrl.trim()) {
            setErrorMsg("La imagen del producto es obligatoria.");
            return;
        }

        if (detectedOrderConflict) {
            setErrorMsg(
                `El orden ${ordenMenu} ya está ocupado por "${detectedOrderConflict.nombre}" en esta película.`
            );
            return;
        }

        try {
            await onSubmit({
                nombre: nombre.trim(),
                descripcion: descripcion.trim(),
                categoria: categoria.trim(),
                estado,
                idPelicula,
                ordenMenu,
                imagenUrl: imagenUrl.trim(),
            });

            onClose();
        } catch (err: any) {
            const serverMsg =
                err?.response?.data?.error ||
                err?.response?.data?.message ||
                "Error al guardar el producto gastronómico.";

            setErrorMsg(serverMsg);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                isEditing
                    ? "Editar Producto Gastronómico"
                    : "Agregar Producto al Menú"
            }
            maxWidth="xl"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {errorMsg && (
                    <div className="p-3.5 rounded-appleMd bg-red-50 border border-red-200 text-red-700 text-[13px] flex items-center gap-2.5">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {detectedOrderConflict && (
                    <div className="p-4 rounded-appleLg bg-amber-50 border border-amber-200 text-amber-900 text-[13px] space-y-1">
                        <div className="flex items-center gap-2 font-semibold text-amber-950">
                            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <span>Orden de Menú Repetido</span>
                        </div>

                        <p className="text-[12px] text-amber-800">
                            El número de orden{" "}
                            <strong>{ordenMenu}</strong> ya está asignado al producto{" "}
                            <strong>"{detectedOrderConflict.nombre}"</strong> para esta
                            película.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
             
                    <div className="md:col-span-6 space-y-4">
                        {/* Película */}
                        <div>
                            <label
                                htmlFor="idPeliculaProducto"
                                className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5 flex items-center gap-1.5"
                            >
                                <Film className="w-3.5 h-3.5 text-[#0071e3]" />
                                Película del Catálogo <span className="text-red-500">*</span>
                            </label>

                            <select
                                id="idPeliculaProducto"
                                value={idPelicula}
                                onChange={(e) => {
                                    setIdPelicula(Number(e.target.value));
                                    setErrorMsg(null);
                                }}
                                required
                                className="w-full px-3.5 py-2.5 bg-[#f5f5f7] border border-[#e5e5ea] rounded-appleMd text-[13px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
                            >
                                {peliculas.map((pelicula) => (
                                    <option key={pelicula.id} value={pelicula.id}>
                                        {pelicula.titulo}
                                    </option>
                                ))}
                            </select>

                            {selectedPelicula && (
                                <div className="flex items-center gap-3 p-2.5 bg-[#fafafc] border border-[#e5e5ea] rounded-appleMd mt-2">
                                    {selectedPelicula.posterUrl ? (
                                        <img
                                            src={selectedPelicula.posterUrl}
                                            alt={selectedPelicula.titulo}
                                            className="w-8 h-11 object-cover rounded-appleXs shadow-sm flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-8 h-11 bg-gray-200 rounded-appleXs flex items-center justify-center">
                                            <Film className="w-4 h-4 text-gray-500" />
                                        </div>
                                    )}

                                    <div className="text-[12px] overflow-hidden">
                                        <p className="font-semibold text-[#1d1d1f] truncate">
                                            {selectedPelicula.titulo}
                                        </p>

                                        <p className="text-[11px] text-[#86868b]">
                                            {selectedPelicula.genero || "General"} ·{" "}
                                            {selectedPelicula.duracionMinutos} min
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Nombre */}
                        <div>
                            <label
                                htmlFor="nombreProducto"
                                className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5 flex items-center gap-1.5"
                            >
                                <UtensilsCrossed className="w-3.5 h-3.5 text-[#0071e3]" />
                                Nombre del Producto <span className="text-red-500">*</span>
                            </label>

                            <input
                                id="nombreProducto"
                                type="text"
                                value={nombre}
                                onChange={(e) => {
                                    setNombre(e.target.value);
                                    setErrorMsg(null);
                                }}
                                maxLength={150}
                                required
                                placeholder="Ej. Palomitas de caramelo"
                                className="w-full px-3.5 py-2.5 bg-[#f5f5f7] border border-[#e5e5ea] rounded-appleMd text-[13px] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
                            />
                        </div>

                        {/* Categoría */}
                        <div>
                            <label
                                htmlFor="categoriaProducto"
                                className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5 flex items-center gap-1.5"
                            >
                                <UtensilsCrossed className="w-3.5 h-3.5 text-[#0071e3]" />
                                Categoría <span className="text-red-500">*</span>
                            </label>

                            <select
                                id="categoriaProducto"
                                value={categoria}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                    setCategoria(e.target.value);
                                    setErrorMsg(null);
                                }}
                                required
                                className="w-full px-3.5 py-2.5 bg-[#f5f5f7] border border-[#e5e5ea] rounded-appleMd text-[13px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
                            >
                                <option value="">Selecciona una categoría</option>
                                <option value="Entrada">Entrada</option>
                                <option value="Plato Principal">Plato principal</option>
                                <option value="Postre">Postre</option>
                                <option value="Bebida">Bebida</option>
                                <option value="Snack">Snack</option>
                            </select>
                        </div>

                        {/* Estado */}
                        <div>
                            <label
                                htmlFor="estadoProducto"
                                className="block text-[12px] font-medium text-[#6e6e73] mb-1.5"
                            >
                                Estado del Producto
                            </label>

                            <select
                                id="estadoProducto"
                                value={estado}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                    setEstado(e.target.value as "activo" | "inactivo");
                                    setErrorMsg(null);
                                }}
                                className="w-full px-3 py-2 bg-[#f5f5f7] border border-[#e5e5ea] rounded-appleMd text-[13px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
                            >
                                <option value="activo">🟢 Activo</option>
                                <option value="inactivo">🔴 Inactivo</option>
                            </select>
                        </div>
                    </div>

                    <div className="md:col-span-6 space-y-4">
                        {/* Descripción */}
                        <div>
                            <label
                                htmlFor="descripcionProducto"
                                className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5 flex items-center gap-1.5"
                            >
                                <FileText className="w-3.5 h-3.5 text-[#0071e3]" />
                                Descripción <span className="text-red-500">*</span>
                            </label>

                            <textarea
                                id="descripcionProducto"
                                value={descripcion}
                                onChange={(e) => {
                                    setDescripcion(e.target.value);
                                    setErrorMsg(null);
                                }}
                                rows={5}
                                required
                                placeholder="Describe los ingredientes o características del producto..."
                                className="w-full px-3.5 py-2.5 bg-[#f5f5f7] border border-[#e5e5ea] rounded-appleMd text-[13px] text-[#1d1d1f] placeholder:text-[#86868b] resize-none focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
                            />
                        </div>

                        {/* Orden */}
                        <div>
                            <label
                                htmlFor="ordenMenu"
                                className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5 flex items-center gap-1.5"
                            >
                                <ListOrdered className="w-3.5 h-3.5 text-[#0071e3]" />
                                Orden en el Menú <span className="text-red-500">*</span>
                            </label>

                            <input
                                id="ordenMenu"
                                type="number"
                                min="1"
                                step="1"
                                value={ordenMenu || ""}
                                onChange={(e) => {
                                    setOrdenMenu(Number(e.target.value));
                                    setErrorMsg(null);
                                }}
                                required
                                className="w-full px-3.5 py-2.5 bg-[#f5f5f7] border border-[#e5e5ea] rounded-appleMd text-[13px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
                            />

                            <p className="text-[11px] text-[#86868b] mt-1.5">
                                Define la posición del producto dentro de la experiencia
                                gastronómica.
                            </p>
                        </div>

                        {/* Imagen */}
                        <div>
                            <label
                                htmlFor="imagenUrl"
                                className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5 flex items-center gap-1.5"
                            >
                                <Image className="w-3.5 h-3.5 text-[#0071e3]" />
                                URL de la Imagen <span className="text-red-500">*</span>
                            </label>

                            <input
                                id="imagenUrl"
                                type="url"
                                value={imagenUrl}
                                onChange={(e) => {
                                    setImagenUrl(e.target.value);
                                    setErrorMsg(null);
                                }}
                                maxLength={500}
                                required
                                placeholder="https://ejemplo.com/imagen.jpg"
                                className="w-full px-3.5 py-2.5 bg-[#f5f5f7] border border-[#e5e5ea] rounded-appleMd text-[13px] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
                            />
                        </div>

                        {/* Preview de imagen */}
                        {imagenUrl.trim() && (
                            <div className="flex items-center gap-3 p-2.5 bg-[#fafafc] border border-[#e5e5ea] rounded-appleMd">
                                <img
                                    src={imagenUrl}
                                    alt="Vista previa del producto"
                                    className="w-16 h-16 object-cover rounded-appleXs shadow-sm"
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                    }}
                                />

                                <div className="text-[11px] text-[#86868b]">
                                    <p className="font-semibold text-[#1d1d1f]">
                                        Vista previa
                                    </p>
                                    <p>Imagen del producto gastronómico</p>
                                </div>
                            </div>
                        )}

                        {/* Resumen */}
                        <div className="p-3 bg-[#fafafc] border border-[#e5e5ea] rounded-appleLg text-[11px] text-[#6e6e73] space-y-1">
                            <div className="flex items-center gap-1 text-[#1d1d1f] font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Resumen del Producto
                            </div>

                            <p>
                                Película:{" "}
                                <strong>
                                    {selectedPelicula?.titulo || "No seleccionada"}
                                </strong>
                            </p>

                            <p>
                                Orden: <strong>{ordenMenu || "-"}</strong>
                            </p>

                            <p>
                                Estado: <strong>{estado}</strong>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Botones */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f0f0f0]">
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={onClose}
                        disabled={isLoading}
                        className="text-[13px] px-4"
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        isLoading={isLoading}
                        className="text-[13px] px-5 bg-[#0071e3] hover:bg-[#0077ed]"
                    >
                        {isEditing ? "Guardar Cambios" : "Agregar Producto"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}