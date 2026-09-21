import { Utensils } from "lucide-react";
import { Producto } from "../types";

interface MenuCardProps { producto: Producto; }

export function MenuCard({ producto }: MenuCardProps) {
    return (
        <article className="group overflow-hidden rounded-appleLg bg-white border border-[#e0e0e0] shadow-appleCard hover:shadow-appleCardHover hover:border-[#0071e3]/30 transition-all duration-200">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#f5f5f7]">
                {producto.imagen_url ? (
                    <img
                        src={producto.imagen_url}
                        alt={producto.nombre}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Utensils className="w-8 h-8 text-[#86868b]" />
                    </div>
                )}

                {producto.categoria && (
                    <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-applePill bg-white/90 backdrop-blur-sm text-[11px] font-semibold text-[#0071e3] shadow-sm">
                            {producto.categoria}
                        </span>
                    </div>
                )}
            </div>

            <div className="p-5">
                <div className="flex items-start gap-4">
                    <div className="shrink-0 w-11 h-11 rounded-applePill bg-[#f0f6ff] flex items-center justify-center">
                        <Utensils className="w-5 h-5 text-[#0071e3]" />
                    </div>

                    <div className="min-w-0 flex-1">
                        {producto.orden_menu !== null && (
                            <span className="text-[11px] font-semibold text-[#0071e3]">
                                MOMENTO {String(producto.orden_menu).padStart(2, "0")}
                            </span>
                        )}

                        <h2 className="text-[16px] font-semibold text-[#1d1d1f] tracking-tight">
                            {producto.nombre}
                        </h2>

                        {producto.descripcion && (
                            <p className="mt-2 text-[13px] leading-relaxed text-[#86868b]">
                                {producto.descripcion}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}