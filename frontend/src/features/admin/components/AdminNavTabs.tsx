import { Link, useLocation } from "react-router-dom";
import { Film, Calendar, Armchair, Users } from "lucide-react";


export function AdminNavTabs() {
  const location = useLocation();

  const tabs = [
    {
      id: "peliculas",
      label: "Catálogo de Películas",
      path: "/admin/peliculas",
      icon: Film,
    },
    {
      id: "funciones",
      label: "Programación de Funciones",
      path: "/admin/funciones",
      icon: Calendar,
    },
    {
      id: "salas",
      label: "Salas y Asientos",
      path: "/admin/salas",
      icon: Armchair,
    },
    { id: "usuarios", 
      label: "Gestión de Usuarios", 
      path: "/admin/usuarios", 
      icon: Users, 
    },
    { id: "productos", 
      label: "Catálogo de Productos Gastronómicos", 
      path: "/admin/productos", 
      icon: Users, 
    },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1.5 bg-[#f5f5f7] border border-[#e5e5ea] rounded-appleLg max-w-fit mb-8 overflow-x-auto shadow-sm">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = location.pathname.startsWith(tab.path);

        return (
          <Link
            key={tab.id}
            to={tab.path}
            className={`flex items-center gap-2 px-4 py-2 rounded-appleMd text-[13px] font-medium transition-all duration-200 whitespace-nowrap ${isActive
                ? "bg-white text-[#1d1d1f] shadow-sm font-semibold"
                : "text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-white/50"
              }`}
          >
            <Icon
              className={`w-4 h-4 transition-colors ${isActive ? "text-[#0071e3]" : "text-[#86868b]"
                }`}
            />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
