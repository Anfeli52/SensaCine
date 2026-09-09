import { Link, useNavigate } from "react-router-dom";
import { Button } from "./Button";
import { useAuthStore } from "../../features/auth/authStore";
import { User, LogOut } from "lucide-react";

export function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, usuario, logout } = useAuthStore();

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
        <Link to="/" className="flex items-center group">
          <span className="text-[17px] font-semibold tracking-tight text-[#1d1d1f] hover:text-[#0071e3] transition-colors">
            SensaCine
          </span>
        </Link>

        {/* Clean Center Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-[13px] font-normal text-[#6e6e73]">
          <Link to="/" className="text-[#1d1d1f] hover:text-[#0071e3] transition-colors font-medium">
            Cartelera
          </Link>
          <a href="#peliculas" className="hover:text-[#1d1d1f] transition-colors">
            Películas
          </a>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#f5f5f7] rounded-applePill text-[12px] text-[#1d1d1f] font-medium border border-[#e5e5ea]">
                <User className="w-3.5 h-3.5 text-[#0071e3]" />
                <span className="max-w-[120px] truncate">{usuario?.nombre || "Mi Cuenta"}</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                type="button"
                className="text-[12px] px-3.5 py-1 font-normal bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] border-transparent"
                onClick={handleLogout}
                rightIcon={<LogOut className="w-3.5 h-3.5" />}
              >
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                size="sm"
                type="button"
                className="text-[12px] px-3.5 py-1 font-normal bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] border-transparent"
                onClick={handleLogin}
              >
                Iniciar Sesión
              </Button>

              <Button
                variant="primary"
                size="sm"
                type="button"
                className="text-[12px] px-3.5 py-1 font-normal bg-[#0071e3] hover:bg-[#0077ed] text-white"
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
