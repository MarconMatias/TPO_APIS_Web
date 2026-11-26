import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { storageSeguro } from '../util/storage';

/**
 * Sesión del cliente: JWT de rol CLIENTE emitido por missl-api + datos de la cuenta
 * ({ nombre, email, descuentoDisponible }). Las peticiones las hace cada componente con fetch().
 * Se persiste en localStorage para no pedir login en cada recarga.
 */
export const useAuthStore = create()(
  persist(
    (set) => ({
      token: null,
      cliente: null,

      /** Después de POST /auth/registro o POST /auth/login. */
      iniciarSesion: (token, cliente) => set({ token, cliente }),

      /** Después de GET /auth/me (ej.: para saber si ya usó el 5% de bienvenida). */
      actualizarCliente: (cliente) => set({ cliente }),

      salir: () => set({ token: null, cliente: null }),
    }),
    // v2: el formato de la cuenta cambió (descuentoDisponible); una sesión guardada con el formato viejo se descarta.
    { name: 'missl_sesion_cliente_v2', storage: createJSONStorage(() => storageSeguro('local')) },
  ),
);
