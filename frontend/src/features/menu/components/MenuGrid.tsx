import { UtensilsCrossed } from "lucide-react";
import { Producto } from "../types";
import { MenuCard } from "./MenuCard";

interface MenuGridProps {
  productos: Producto[];
}

export function MenuGrid({ productos }: MenuGridProps) {
  if (productos.length === 0) {
    return (
      <div className="rounded-appleLg border border-[#e0e0e0] bg-white p-10 text-center">
        <div className="w-12 h-12 mx-auto rounded-applePill bg-[#f5f5f7] flex items-center justify-center mb-3">
          <UtensilsCrossed className="w-5 h-5 text-[#86868b]" />
        </div>

        <h2 className="text-[16px] font-semibold text-[#1d1d1f]">
          Menú próximamente
        </h2>

        <p className="mt-1 text-[13px] text-[#86868b]">
          Aún no hay productos gastronómicos disponibles para esta película.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {productos.map((producto) => (
        <MenuCard key={producto.id_producto} producto={producto} />
      ))}
    </div>
  );
}