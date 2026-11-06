import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { authApi } from '../api/authApi';
import type { Cliente, ClienteLoginRequest, ClienteRegistroRequest } from '../types/cliente';
import { storageSeguro } from '../util/storage';

interface AuthState {
  /** JWT de rol CLIENTE emitido por missl-api. */
  token: string | null;
  cliente: Cliente | null;
  registrar: (datos: ClienteRegistroRequest) => Promise<Cliente>;
  ingresar: (datos: ClienteLoginRequest) => Promise<Cliente>;
  /** Vuelve a pedir la cuenta (ej.: después de comprar, para saber si ya usó el 5%). */
  refrescarPerfil: () => Promise<void>;
  salir: () => void;
}

/** Sesión del cliente. Se persiste en localStorage para no pedir login en cada recarga. */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      cliente: null,

      registrar: async (datos) => {
        const { token, cliente } = await authApi.registrar(datos);
        set({ token, cliente });
        return cliente;
      },

      ingresar: async (datos) => {
        const { token, cliente } = await authApi.ingresar(datos);
        set({ token, cliente });
        return cliente;
      },

      refrescarPerfil: async () => {
        const cliente = await authApi.perfil();
        set({ cliente });
      },

      salir: () => set({ token: null, cliente: null }),
    }),
    { name: 'missl_sesion_cliente', storage: createJSONStorage(() => storageSeguro('local')) },
  ),
);
