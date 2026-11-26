import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { storageSeguro } from '../util/storage';

/**
 * Sesión de administrador: login en dos pasos con 2FA (TOTP) obligatorio.
 * - challengeId: desafío pendiente entre el paso 1 (contraseña) y el paso 2 (código 2FA).
 * - token: JWT de rol ADMIN (vence a los 15 minutos según missl-api).
 */
export const useAdminAuthStore = create()(
  persist(
    (set) => ({
      token: null,
      email: null,
      challengeId: null,

      /** Después de POST /admin/login. */
      guardarDesafio: (challengeId) => set({ challengeId }),

      /** missl-api admite hasta 5 códigos por desafío: si venció o se agotaron, hay que repetir el paso 1. */
      descartarDesafio: () => set({ challengeId: null }),

      /** Después de POST /admin/2fa. */
      iniciarSesion: (token, email) => set({ token, email, challengeId: null }),

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
