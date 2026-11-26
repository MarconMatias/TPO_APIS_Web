import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { storageSeguro } from '../util/storage';

/**
 * Último pedido confirmado, para mostrarlo en /confirmacion:
 * { confirmacion, lineas: [{ nombre, talle, cantidad }], domicilio }.
 * Las líneas se guardan tal como se vieron en el checkout (la confirmación de POST /ventas no devuelve los ítems).
 */
export const useOrderStore = create()(
  persist(
    (set) => ({
      ultimoPedido: null,
      guardarPedido: (pedido) => set({ ultimoPedido: pedido }),
    }),
    // sessionStorage: la confirmación sobrevive a un F5 pero no queda guardada entre sesiones.
    { name: 'missl_pedido', storage: createJSONStorage(() => storageSeguro('session')) },
  ),
);
