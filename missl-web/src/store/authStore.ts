import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { USUARIO_DEMO } from '../data/catalogo';
import type { Usuario } from '../types';
import { simularLatencia, storageSeguro } from '../util/simular';

/**
 * Cuentas simuladas en el navegador. Es solo para demostrar el flujo en esta etapa:
 * en la integración full stack la autenticación (y el hash de contraseñas) la resuelve missl-api.
 */
interface Cuenta extends Usuario {
  password: string;
}

interface AuthState {
  cuentas: Cuenta[];
  usuario: Usuario | null;
  registrar: (datos: { nombre: string; email: string; password: string }) => Promise<Usuario>;
  ingresar: (datos: { email: string; password: string }) => Promise<Usuario>;
  salir: () => void;
  /** Marca el descuento de primera compra como usado. */
  registrarCompra: () => void;
}

const sinPassword = ({ password: _password, ...usuario }: Cuenta): Usuario => usuario;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      cuentas: [{ ...USUARIO_DEMO, primeraCompraUsada: false }],
      usuario: null,

      registrar: async ({ nombre, email, password }) => {
        await simularLatencia();
        const normalizado = email.trim().toLowerCase();
        if (get().cuentas.some((c) => c.email === normalizado)) {
          throw new Error('Ya existe una cuenta con ese email. Probá ingresar con tu contraseña.');
        }
        const cuenta: Cuenta = { nombre: nombre.trim(), email: normalizado, password, primeraCompraUsada: false };
        const usuario = sinPassword(cuenta);
        set({ cuentas: [...get().cuentas, cuenta], usuario });
        return usuario;
      },

      ingresar: async ({ email, password }) => {
        await simularLatencia();
        const cuenta = get().cuentas.find((c) => c.email === email.trim().toLowerCase() && c.password === password);
        if (!cuenta) throw new Error('El email o la contraseña no son correctos.');
        const usuario = sinPassword(cuenta);
        set({ usuario });
        return usuario;
      },

      salir: () => set({ usuario: null }),

      registrarCompra: () => {
        const { usuario, cuentas } = get();
        if (!usuario) return;
        set({
          usuario: { ...usuario, primeraCompraUsada: true },
          cuentas: cuentas.map((c) => (c.email === usuario.email ? { ...c, primeraCompraUsada: true } : c)),
        });
      },
    }),
    { name: 'missl_sesion', storage: createJSONStorage(() => storageSeguro('local')) },
  ),
);
