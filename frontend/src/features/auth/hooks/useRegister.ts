import { useMutation } from "@tanstack/react-query";
import { registerApi } from "../api/authApi";
import { RegisterDTO } from "../types";

export function useRegister() {
  return useMutation({
    mutationFn: (dto: RegisterDTO) => registerApi(dto),
  });
}
