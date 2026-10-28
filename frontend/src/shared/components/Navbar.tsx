import { Link, useNavigate } from "react-router-dom";
import { Button } from "./Button";
import { useAuthStore } from "../../features/auth/authStore";
import { User, LogOut, ChefHat } from "lucide-react";

export function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, usuario, logout } = useAuthStore();

  const esCocina = usuario?.rol === "cocina";
  const estaEnCocina = location.pathname.startsWith("/cocina");

  const handleLogin = () => {
    navigate("/auth/login");
  };

  const handleRegister = () => {
    navigate("/auth/register");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Apple-style pure typographic logo */}
        <Link
          to={esCocina ? "/cocina" : "/"}
          className="group flex items-center gap-2"
        >
          <span className="text-[17px] font-semibold tracking-tight text-[#1d1d1f] hover:text-[#0071e3] transition-colors">
            SensaCine
          </span>
          {esCocina && (
            <span className="hidden rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 sm:inline-flex">
              Cocina
            </span>
          )}
        </Link>

        {esCocina ? (
          <nav className="flex items-center">
            <Link
              to="/cocina"
              className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${estaEnCocina
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
            >
              <ChefHat className="h-4 w-4" />
              Panel de cocina
            </Link>
          </nav>
        ) : (
          <nav className="hidden items-center gap-7 text-[13px] font-normal text-[#6e6e73] md:flex">
            <Link
              to="/"
              className="font-medium text-[#1d1d1f] transition-colors hover:text-[#0071e3]"
            >
              Cartelera
            </Link>

            <a
              href="/#peliculas"
              className="transition-colors hover:text-[#1d1d1f]"
            >
              Películas
            </a>

            {usuario?.rol === "cliente" && (
              <Link
                to="/reservas/historial"
                className="font-medium text-[#1d1d1f] transition-colors hover:text-[#0071e3]"
              >
                Mis reservas
              </Link>
            )}

            {usuario?.rol === "admin" && (
              <>
                <Link
                  to="/admin/peliculas"
                  className="flex items-center gap-1.5 font-semibold text-[#0071e3] transition-colors hover:text-[#0077ed]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0071e3]" />
                  Gestión Admin
                </Link>

              </>
            )}
          </nav>
        )}

        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-1.5 rounded-full border border-[#e5e5ea] bg-[#f5f5f7] px-3 py-1 text-[12px] font-medium text-[#1d1d1f]">
                <User className="h-3.5 w-3.5 text-[#0071e3]" />

                <span className="max-w-[120px] truncate">
                  {usuario?.nombre || "Mi Cuenta"}
                </span>

                {usuario?.rol === "admin" && (
                  <span className="ml-1 rounded-full bg-[#0071e3]/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#0071e3]">
                    Admin
                  </span>
                )}

                {esCocina && (
                  <span className="ml-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                    Cocina
                  </span>
                )}
              </div>

              <Button
                variant="secondary"
                size="sm"
                type="button"
                className="border-transparent bg-[#f5f5f7] px-3.5 py-1 text-[12px] font-normal text-[#1d1d1f] hover:bg-[#e8e8ed]"
                onClick={handleLogout}
                rightIcon={<LogOut className="h-3.5 w-3.5" />}
              >
                <span className="hidden sm:inline">Cerrar Sesión</span>
                <span className="sm:hidden">Salir</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                size="sm"
                type="button"
                className="border-transparent bg-[#f5f5f7] px-3.5 py-1 text-[12px] font-normal text-[#1d1d1f] hover:bg-[#e8e8ed]"
                onClick={handleLogin}
              >
                Iniciar Sesión
              </Button>

              <Button
                variant="primary"
                size="sm"
                type="button"
                className="bg-[#0071e3] px-3.5 py-1 text-[12px] font-normal text-white hover:bg-[#0077ed]"
                onClick={handleRegister}
              >
                Registrarse
              </Button>
            </>
          )}
        </div>
      </div>
    </header>

  );
}
