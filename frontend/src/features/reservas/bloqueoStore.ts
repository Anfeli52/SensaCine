import { create } from "zustand";

export interface Bloqueo {
  idFuncion: number;
  idsAsiento: number[];
  expiraEnMs: number;
}

interface BloqueoState {
  bloqueo: Bloqueo | null;
  setBloqueo: (idFuncion: number, idsAsiento: number[], segundosRestantes: number) => void;
  clear: () => void;
}

export const useBloqueoStore = create<BloqueoState>((set) => ({
  bloqueo: null,
  setBloqueo: (idFuncion, idsAsiento, segundosRestantes) =>
    set({ bloqueo: { idFuncion, idsAsiento, expiraEnMs: Date.now() + segundosRestantes * 1000 } }),
  clear: () => set({ bloqueo: null }),
}));
