import { create } from 'zustand';

interface AuthState {
  autenticado: boolean;
  biometriaSuportada: boolean | null;
  privacidadeAtiva: boolean;
  lastActiveTime: number;
  setBiometriaSuportada: (suporta: boolean) => void;
  unlockApp: () => void;
  lockApp: () => void;
  togglePrivacidade: () => void;
  setLastActiveTime: (time: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  autenticado: false,
  biometriaSuportada: null,
  privacidadeAtiva: false,
  lastActiveTime: 0,
  setBiometriaSuportada: (suporta) => set({ biometriaSuportada: suporta }),
  unlockApp: () => set({ autenticado: true }),
  lockApp: () => set({ autenticado: false }),
  togglePrivacidade: () => set((state) => ({ privacidadeAtiva: !state.privacidadeAtiva })),
  setLastActiveTime: (time) => set({ lastActiveTime: time })
}));
