import { useNavigate, Link } from "react-router-dom";
import { LoginForm } from "../components/LoginForm";

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-white">
      <div className="w-full max-w-md bg-[#fafafc] border border-[#e0e0e0] rounded-appleXl p-8 shadow-appleCard">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block mb-3">
            <span className="text-2xl font-bold tracking-tight text-[#1d1d1f]">
              SensaCine
            </span>
          </Link>
          <h1 className="text-xl font-bold text-[#1d1d1f] tracking-tight">Iniciar Sesión</h1>
          <p className="text-[13px] text-[#86868b] mt-1">
            Accede a tu cuenta de SensaCine
          </p>
        </div>

        <LoginForm onSuccess={() => navigate("/")} />

        <div className="mt-6 text-center text-[12px] text-[#86868b]">
          ¿No tienes una cuenta?{" "}
          <Link to="/auth/register" className="text-[#0071e3] hover:underline font-medium">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
