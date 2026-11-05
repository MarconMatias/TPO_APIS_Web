import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Pedido } from '../types';
import { simularLatencia, storageSeguro } from '../util/simular';

interface OrderState {
  ultimoPedido: Pedido | null;
  /** Simula POST /ventas: espera la "acreditación" y devuelve el pedido con su código. */
  confirmarPago: (datos: Omit<Pedido, 'codigo'>) => Promise<Pedido>;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      ultimoPedido: null,
      confirmarPago: async (datos) => {
        await simularLatencia(1400);
        const pedido: Pedido = { ...datos, codigo: '#MSL-' + String(Date.now()).slice(-5) };
        set({ ultimoPedido: pedido });
        return pedido;
      },
    }),
    // sessionStorage: la confirmación sobrevive a un F5 pero no queda guardada entre sesiones.
    { name: 'missl_pedido', storage: createJSONStorage(() => storageSeguro('session')) },
  ),
);
