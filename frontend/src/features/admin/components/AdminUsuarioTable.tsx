import { useState } from "react";
import { Search, User, ShieldCheck, ChefHat, UserRound, UserX, UserCheck, ChevronDown } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Rol, UsuarioAdmin } from "../types/usuario.types";
import { AdminUsuarioEstadoModal } from "./AdminUsuarioEstadoModal";

interface AdminUsuarioTableProps {
    usuarios: UsuarioAdmin[];
    onChangeRol: (id: number, rol: Rol) => void;
    onChangeEstado: (id: number, estado: "activo" | "inactivo") => void;
    isUpdatingRol: boolean;
    isUpdatingEstado: boolean;
}

export function AdminUsuarioTable({
    usuarios,
    onChangeRol,
    onChangeEstado,
    isUpdatingRol,
    isUpdatingEstado,
}: Readonly<AdminUsuarioTableProps>) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRol, setSelectedRol] = useState<string>("todos");
    const [selectedEstado, setSelectedEstado] = useState<string>("todos");
    const [usuarioAConfirmar, setUsuarioAConfirmar] = useState<UsuarioAdmin | null>(null);

    const filteredUsuarios = usuarios.filter((usuario) => {
        const search = searchTerm.toLowerCase();

        const matchesSearch =
            usuario.nombre.toLowerCase().includes(search) ||
            usuario.email.toLowerCase().includes(search);

        const matchesRol = selectedRol === "todos" || usuario.rol === selectedRol;
        const matchesEstado = selectedEstado === "todos" || usuario.estado === selectedEstado;

        return matchesSearch && matchesRol && matchesEstado;
    });

    const getRolLabel = (rol: Rol) => {
        switch (rol) {
            case "admin":
                return "Administrador";
            case "cocina":
                return "Cocina";
            case "cliente":
                return "Cliente";
        }
    };

    const getRolIcon = (rol: Rol) => {
        switch (rol) {
            case "admin":
                return <ShieldCheck className="w-3.5 h-3.5" />;
            case "cocina":
                return <ChefHat className="w-3.5 h-3.5" />;
            case "cliente":
                return <UserRound className="w-3.5 h-3.5" />;
        }
    };

    const getEstadoLabel = (estado: string) => {
        return estado === "activo" ? "Activo" : "Inactivo";
    };

    return (
        <div className="bg-white rounded-appleXl border border-[#e5e5ea] shadow-appleCard overflow-hidden">
            {/* Table Controls */}
            <div className="p-4 sm:p-5 border-b border-[#f0f0f0] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2" />

                    <input
                        type="text"
                        placeholder="Buscar por nombre o correo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-[#f5f5f7] border border-transparent hover:border-[#e5e5ea] focus:border-[#0071e3] rounded-appleMd text-[13px] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none transition-colors"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                    <div className="flex items-center gap-1.5 bg-[#f5f5f7] px-3 py-1.5 rounded-appleMd border border-transparent hover:bg-[#eeeeF2] transition-colors">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#0071e3]" />

                        <div className="relative">
                            <select
                                value={selectedRol}
                                onChange={(e) => setSelectedRol(e.target.value)}
                                className="appearance-none bg-transparent text-[12px] text-[#1d1d1f] font-medium focus:outline-none cursor-pointer border-0 outline-none pr-5"
                            >
                                <option value="todos">Todos los roles</option>
                                <option value="cliente">Cliente</option>
                                <option value="cocina">Cocina</option>
                                <option value="admin">Administrador</option>
                            </select>

                            <ChevronDown className="w-3 h-3 text-[#86868b] absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#f5f5f7] px-3 py-1.5 rounded-appleMd border border-transparent hover:bg-[#eeeeF2] transition-colors">
                        <UserCheck className="w-3.5 h-3.5 text-[#0071e3]" />

                        <div className="relative">
                            <select
                                value={selectedEstado}
                                onChange={(e) => setSelectedEstado(e.target.value)}
                                className="appearance-none bg-transparent text-[12px] text-[#1d1d1f] font-medium focus:outline-none cursor-pointer border-0 outline-none pr-5"
                            >
                                <option value="todos">Todos los estados</option>
                                <option value="activo">Activos</option>
                                <option value="inactivo">Inactivos</option>
                            </select>

                            <ChevronDown className="w-3 h-3 text-[#86868b] absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            {filteredUsuarios.length === 0 ? (
                <div className="py-16 px-6 text-center">
                    <div className="w-12 h-12 rounded-applePill bg-[#f5f5f7] flex items-center justify-center mx-auto mb-3 text-[#86868b]">
                        <User className="w-6 h-6" />
                    </div>

                    <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-1">
                        No se encontraron usuarios
                    </h3>

                    <p className="text-[13px] text-[#86868b] max-w-sm mx-auto">
                        Prueba cambiando los términos de búsqueda o los filtros.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#f0f0f0] bg-[#fafafc] text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">
                                <th className="py-3.5 px-5">Usuario</th>
                                <th className="py-3.5 px-4">Rol</th>
                                <th className="py-3.5 px-4">Estado</th>
                                <th className="py-3.5 px-4">Registro</th>
                                <th className="py-3.5 px-5 text-right">Acciones</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#f0f0f0] text-[13px]">
                            {filteredUsuarios.map((usuario) => (
                                <tr
                                    key={usuario.id}
                                    className="hover:bg-[#fafafc] transition-colors group"
                                >
                                    {/* Usuario */}
                                    <td className="py-3.5 px-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-applePill bg-[#f5f5f7] border border-[#e5e5ea] flex items-center justify-center flex-shrink-0">
                                                <User className="w-4 h-4 text-[#86868b]" />
                                            </div>

                                            <div>
                                                <h4 className="font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors">
                                                    {usuario.nombre}
                                                </h4>

                                                <span className="text-[11px] text-[#86868b]">
                                                    {usuario.email}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Rol */}
                                    <td className="py-3.5 px-4">
                                        <div className="flex items-center gap-2">
                                            <div className="text-[#0071e3]">
                                                {getRolIcon(usuario.rol)}
                                            </div>

                                            <select
                                                value={usuario.rol}
                                                onChange={(e) =>
                                                    onChangeRol(
                                                        usuario.id,
                                                        e.target.value as Rol
                                                    )
                                                }
                                                disabled={isUpdatingRol}
                                                className="bg-[#f5f5f7] border border-transparent hover:border-[#e5e5ea] focus:border-[#0071e3] rounded-appleMd px-2.5 py-1.5 text-[12px] font-medium text-[#1d1d1f] focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <option value="cliente">Cliente</option>
                                                <option value="cocina">Cocina</option>
                                                <option value="admin">Administrador</option>
                                            </select>
                                        </div>
                                    </td>

                                    {/* Estado */}
                                    <td className="py-3.5 px-4">
                                        {usuario.estado === "activo" ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-applePill text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                Activo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-applePill text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                                Inactivo
                                            </span>
                                        )}
                                    </td>

                                    {/* Fecha */}
                                    <td className="py-3.5 px-4 text-[#6e6e73]">
                                        {new Date(usuario.fechaRegistro).toLocaleDateString(
                                            "es-CO"
                                        )}
                                    </td>

                                    {/* Acciones */}
                                    <td className="py-3.5 px-5 text-right">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => {
                                                if (usuario.estado === "activo") {
                                                    setUsuarioAConfirmar(usuario);
                                                    return;
                                                }

                                                onChangeEstado(usuario.id, "activo");
                                            }}
                                            disabled={isUpdatingEstado}
                                            className={`text-[12px] px-3 ${usuario.estado === "activo"
                                                ? "bg-red-50 hover:bg-red-100 text-red-600"
                                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                                                } border-transparent`}
                                            title={
                                                usuario.estado === "activo"
                                                    ? "Desactivar usuario"
                                                    : "Activar usuario"
                                            }
                                        >
                                            {usuario.estado === "activo" ? (
                                                <>
                                                    <UserX className="w-3.5 h-3.5 mr-1.5" />
                                                    Desactivar
                                                </>
                                            ) : (
                                                <>
                                                    <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                                                    Activar
                                                </>
                                            )}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <AdminUsuarioEstadoModal
                usuario={usuarioAConfirmar}
                isUpdating={isUpdatingEstado}
                onCancel={() => setUsuarioAConfirmar(null)}
                onConfirm={() => {
                    if (!usuarioAConfirmar) {
                        return;
                    }

                    onChangeEstado(usuarioAConfirmar.id, "inactivo");
                    setUsuarioAConfirmar(null);
                }}
            />
        </div>

    );
}