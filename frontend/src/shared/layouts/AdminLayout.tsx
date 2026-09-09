import { Outlet, Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuthStore } from "../../features/auth/authStore";

export function AdminLayout() {
  const { logout, usuario } = useAuthStore();

  return (
    <div className="min-h-screen bg-white flex flex-col text-[#1d1d1f]">
      <header className="h-14 border-b border-[#e0e0e0] px-6 flex items-center justify-between bg-[#f5f5f7]">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-semibold text-[#1d1d1f] tracking-tight">SensaCine Admin</span>
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-[12px] text-[#86868b]">
            {usuario?.nombre} ({usuario?.rol})
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-1 text-[12px] text-red-600 hover:text-red-700"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>
      </header>

      <main className="flex-grow p-6 max-w-[1200px] mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
