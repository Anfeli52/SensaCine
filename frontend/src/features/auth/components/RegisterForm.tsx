import { type FormEvent, useState } from "react";
import { useRegister } from "../hooks/useRegister";

import { Input } from "../../../shared/components/Input";
import { ButtonA } from "../../../shared/components/Button";

export const RegisterForm = ({
  onSuccess,
}: {
  onSuccess?: () => void;
}) => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const registerMutation = useRegister();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    registerMutation.mutate(
      {
        nombre,
        email,
        password,
      },
      {
        onSuccess: () => {
          setSuccessMessage(
            "Usuario registrado correctamente."
          );

          setNombre("");
          setEmail("");
          setPassword("");

          setTimeout(() => {
            onSuccess?.();
          }, 1200);
        },

        onError: (error: any) => {
          if (error.response?.status === 409) {
            setErrorMessage(
              "Ya existe un usuario registrado con este email."
            );
          } else {
            setErrorMessage(
              "No fue posible registrar el usuario."
            );
          }
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      <Input label="Nombre" name="nombre" type="text" value={nombre} placeholder="Juan Pérez" onChange={(event) => setNombre(event.target.value)} required/>
      <Input label="Correo electrónico" name="email" type="email" value={email} placeholder="usuario@ejemplo.com" onChange={(event) => setEmail(event.target.value)} required/>
      <Input label="Contraseña" name="password" type="password" value={password} placeholder="••••••••" onChange={(event) => setPassword(event.target.value)} minLength={6} required/>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm leading-5 text-red-600">
            {errorMessage}
          </p>
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm leading-5 text-emerald-600">
            {successMessage}
          </p>
        </div>
      )}

      <div className="pt-2">
        <ButtonA
          type="submit"
          isLoading={registerMutation.isPending}
        >
          Registrarse
        </ButtonA>
      </div>

    </form>
  );
};