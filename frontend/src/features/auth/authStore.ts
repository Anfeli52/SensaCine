import { create } from "zustand";
import { Usuario } from "./types";

interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, usuario: Usuario) => void;
  logout: () => void;
  setUsuario: (usuario: Usuario) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  usuario: JSON.parse(localStorage.getItem("sensacine_user") || "null"),
  token: localStorage.getItem("sensacine_token") || null,
  isAuthenticated: !!localStorage.getItem("sensacine_token"),

  login: (token: string, usuario: Usuario) => {
    localStorage.setItem("sensacine_token", token);
    localStorage.setItem("sensacine_user", JSON.stringify(usuario));
    set({ token, usuario, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("sensacine_token");
    localStorage.removeItem("sensacine_user");
    set({ token: null, usuario: null, isAuthenticated: false });
  },

  setUsuario: (usuario: Usuario) => {
    localStorage.setItem("sensacine_user", JSON.stringify(usuario));
    set({ usuario });
  },
}));
