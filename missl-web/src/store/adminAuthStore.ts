import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { adminApi } from '../api/adminApi';
import { storageSeguro } from '../util/storage';

interface AdminAuthState {
  /** JWT de rol ADMIN (vence a los 15 minutos según missl-api). */
  token: string | null;
  email: string | null;
  /** Desafío pendiente entre el paso 1 (contraseña) y el paso 2 (código 2FA). */
  challengeId: string | null;
  login: (email: string, password: string) => Promise<void>;
  verificar2fa: (codigo: string) => Promise<void>;
  salir: () => void;
}

/** Sesión de administrador: login en dos pasos con 2FA (TOTP) obligatorio. */
export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      token: null,
      email: null,
      challengeId: null,

      login: async (email, password) => {
        const { challengeId } = await adminApi.login({ email, password });
        set({ challengeId });
      },

      verificar2fa: async (codigo) => {
        const challengeId = get().challengeId ?? '';
        try {
          const { token, email } = await adminApi.verificar2fa({ challengeId, codigo });
          set({ token, email, challengeId: null });
        } catch (error) {
          // missl-api permite hasta 5 intentos por desafío. Si venció o se agotaron los intentos,
          // el mensaje pide volver a iniciar sesión: ahí se descarta el desafío y hay que repetir el paso 1.
          if (error instanceof Error && /iniciar sesion/i.test(error.message)) set({ challengeId: null });
          throw error;
        }
      },

      salir: () => set({ token: null, email: null, challengeId: null }),
    }),
    {
      name: 'missl_sesion_admin',
      // sessionStorage: la sesión de administrador no sobrevive al cierre del navegador.
      storage: createJSONStorage(() => storageSeguro('session')),
      partialize: (s) => ({ token: s.token, email: s.email }),
    },
  ),
);
