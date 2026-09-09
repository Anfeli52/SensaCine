import React, { useState } from "react";
import { useRegister } from "../hooks/useRegister";
import { Button } from "../../../shared/components/Button";
import { Lock, Mail, User, AlertCircle, CheckCircle } from "lucide-react";

export function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const registerMutation = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    registerMutation.mutate(
      { nombre, email, password },
      {
        onSuccess: () => {
          setIsSuccess(true);
          setTimeout(() => {
            onSuccess?.();
          }, 1200);
        },
        onError: (err: any) => {
          const message =
            err.response?.data?.message ||
            "Error al crear la cuenta. Por favor verifica tus datos.";
          setErrorMessage(message);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-appleMd text-red-600 text-[13px]">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isSuccess && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-appleMd text-green-700 text-[13px]">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>¡Cuenta creada con éxito! Redirigiendo...</span>
        </div>
      )}

      <div>
        <label className="block text-[12px] font-medium text-[#6e6e73] mb-1">
          Nombre Completo
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            placeholder="Juan Pérez"
            className="w-full bg-[#f5f5f7] border border-[#e0e0e0] rounded-appleMd py-2 pl-9 pr-4 text-[13px] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:border-[#0071e3] transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-[12px] font-medium text-[#6e6e73] mb-1">
          Correo Electrónico
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="usuario@ejemplo.com"
            className="w-full bg-[#f5f5f7] border border-[#e0e0e0] rounded-appleMd py-2 pl-9 pr-4 text-[13px] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:border-[#0071e3] transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-[12px] font-medium text-[#6e6e73] mb-1">
          Contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            minLength={6}
            className="w-full bg-[#f5f5f7] border border-[#e0e0e0] rounded-appleMd py-2 pl-9 pr-4 text-[13px] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:border-[#0071e3] transition-all"
          />
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={registerMutation.isPending || isSuccess}
        >
          Crear Cuenta
        </Button>
      </div>
    </form>
  );
}
