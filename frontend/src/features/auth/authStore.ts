import { create } from "zustand";
import { queryClient } from "../../lib/queryClient";
import { useBloqueoStore } from "../reservas/bloqueoStore";
import { Usuario } from "./types";

// Todo lo que está en memoria (consultas cacheadas y reserva temporal en curso) pertenece a UN usuario.
// Se vacía al cerrar e iniciar sesión: si no, la caché de React Query (5 min) mostraría al nuevo usuario
// las reservas, tarjetas y demás datos de la cuenta anterior sin volver a pedirlos al servidor.
function limpiarDatosDeSesion() {
  void queryClient.cancelQueries();
  queryClient.clear();
  useBloqueoStore.getState().clear();
}

interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, usuario: Usuario) => void;
  logout: () => void;
  setUsuario: (usuario: Usuario) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  usuario: JSON.parse(localStorage.getItem("sensacine_user") || "null"),
  token: localStorage.getItem("sensacine_token") || null,
  isAuthenticated: !!localStorage.getItem("sensacine_token"),

  login: (token: string, usuario: Usuario) => {
    limpiarDatosDeSesion();
    localStorage.setItem("sensacine_token", token);
    localStorage.setItem("sensacine_user", JSON.stringify(usuario));
    set({ token, usuario, isAuthenticated: true });
  },

  logout: () => {
    // Varias peticiones pueden recibir 401 a la vez y llamar a logout varias veces: solo la primera limpia
    if (!get().isAuthenticated) return;
    localStorage.removeItem("sensacine_token");
    localStorage.removeItem("sensacine_user");
    set({ token: null, usuario: null, isAuthenticated: false });
    limpiarDatosDeSesion();
  },

  setUsuario: (usuario: Usuario) => {
    localStorage.setItem("sensacine_user", JSON.stringify(usuario));
    set({ usuario });
  },
}));
