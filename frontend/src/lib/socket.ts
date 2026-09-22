import { io } from "socket.io-client";
import { useAuthStore } from "../features/auth/authStore";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || undefined;

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: (cb) => cb({ token: useAuthStore.getState().token }),
});
