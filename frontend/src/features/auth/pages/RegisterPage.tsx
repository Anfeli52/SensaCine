import { useNavigate, Link } from "react-router-dom";
import { RegisterForm } from "../components/RegisterForm";

export function RegisterPage() {
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
          <h1 className="text-xl font-bold text-[#1d1d1f] tracking-tight">Crear Cuenta</h1>
          <p className="text-[13px] text-[#86868b] mt-1">
            Únete a SensaCine y disfruta de la mejor cartelera
          </p>
        </div>

        <RegisterForm onSuccess={() => navigate("/auth/login")} />

        <div className="mt-6 text-center text-[12px] text-[#86868b]">
          ¿Ya tienes una cuenta?{" "}
          <Link to="/auth/login" className="text-[#0071e3] hover:underline font-medium">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
