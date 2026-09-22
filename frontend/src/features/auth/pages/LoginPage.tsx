import { Link, useNavigate } from "react-router-dom";
import { Clapperboard } from "lucide-react";

import { LoginForm } from "../components/LoginForm";
import backgroundImage from "../../../image/imagen.jfif";

export const LoginPage = () => {
  const navigate = useNavigate();

  return (
    <main
      className="relative min-h-screen w-full overflow-hidden bg-[#07111f] bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})`, }}>
      <div className="absolute inset-0 bg-[#07111f]/45" />

      <div className="relative z-10 flex min-h-screen w-full items-center px-6 py-8 sm:px-10 lg:px-16">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-20">

          <section className="flex flex-col justify-center text-white">

            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#087ea4] shadow-lg shadow-[#087ea4]/30">
                <Clapperboard
                  className="h-6 w-6"
                  strokeWidth={2}
                />
              </div>

              <span className="text-2xl font-bold tracking-tight">
                SensaCine
              </span>
            </div>
            <div className="max-w-2xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-[#5cc9e8]">
                Bienvenido
              </p>

              <h1 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                La función
                <br />

                <span className="text-[#5cc9e8]">
                  está por comenzar.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
                Inicia sesión y continúa disfrutando de una
                experiencia donde el cine y la gastronomía
                se encuentran.
              </p>
            </div>

            <div className="mt-10 flex items-center gap-3">
              <div className="h-px w-16 bg-[#087ea4]" />
              <div className="h-1.5 w-1.5 rounded-full bg-[#5cc9e8]" />
              <div className="h-px w-10 bg-white/30" />
            </div>
          </section>
          <section className="w-full max-w-md justify-self-center lg:justify-self-end">

            <div className="rounded-[2rem] border border-white/30 bg-white p-7 shadow-2xl shadow-black/40 sm:p-9">

              <div className="mb-8">

                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f6fa]">
                  <Clapperboard
                    className="h-5 w-5 text-[#087ea4]"
                    strokeWidth={2}
                  />
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
                  Bienvenido
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Ingresa a tu cuenta para continuar.
                </p>
              </div>

              <LoginForm onSuccess={() => navigate("/")}/>

              <div className="mt-7 border-t border-slate-100 pt-6 text-center">
                <p className="text-sm text-slate-500">
                  ¿No tienes una cuenta?{" "}

                  <Link
                    to="/auth/register"
                    className="font-semibold text-[#087ea4] transition-colors hover:text-[#066a89]"
                  >
                    Crear cuenta
                  </Link>
                </p>
              </div>

            </div>
          </section>

        </div>
      </div>
    </main>
  );
};

