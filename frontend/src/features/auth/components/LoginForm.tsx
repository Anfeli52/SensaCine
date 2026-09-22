import { type FormEvent, useState } from "react";
import { useLogin } from "../hooks/useLogin";

import { Input } from "../../../shared/components/Input";
import { ButtonA } from "../../../shared/components/Button";

export const LoginForm = ({
  onSuccess,
}: {
  onSuccess?: () => void;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = useLogin();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    loginMutation.mutate(
      {
        email,
        password,
      },
      {
        onSuccess: () => {
          onSuccess?.();
        },
        onError: () => {
          setError("Credenciales incorrectas");
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input type="email" label="Email" name="email" value={email} placeholder="usuario@ejemplo.com" onChange={(event) => setEmail(event.target.value)} required/>
      <Input type="password" label="Contraseña" name="password" value={password} placeholder="••••••••" onChange={(event) => setPassword(event.target.value)} required/>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <span className="text-sm text-red-600">
            {error}
          </span>
        </div>
      )}

      <div className="pt-2">
        <ButtonA type="submit" isLoading={loginMutation.isPending}>
          Iniciar sesión
        </ButtonA>
      </div>
    </form>
  );
};