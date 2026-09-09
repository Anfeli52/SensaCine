import { useMutation } from "@tanstack/react-query";
import { loginApi } from "../api/authApi";
import { useAuthStore } from "../authStore";
import { LoginDTO } from "../types";

export function useLogin() {
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (dto: LoginDTO) => loginApi(dto),
    onSuccess: (data) => {
      login(data.token, data.usuario);
    },
  });
}
