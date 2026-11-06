import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ventasApi } from '../api/ventasApi';
import type { Confirmacion, VentaRequest } from '../types/venta';
import { storageSeguro } from '../util/storage';

/** Detalle de lo comprado tal como se vio en el checkout (ConfirmacionDTO no devuelve los ítems). */
export interface LineaComprada {
  nombre: string;
  talle: string;
  cantidad: number;
}

export interface UltimoPedido {
  confirmacion: Confirmacion;
  lineas: LineaComprada[];
  domicilio: string;
}

interface OrderState {
  ultimoPedido: UltimoPedido | null;
  /** POST /ventas y guarda la confirmación para mostrarla en /confirmacion. */
  confirmarCompra: (request: VentaRequest, lineas: LineaComprada[]) => Promise<Confirmacion>;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      ultimoPedido: null,
      confirmarCompra: async (request, lineas) => {
        const confirmacion = await ventasApi.crear(request);
        set({ ultimoPedido: { confirmacion, lineas, domicilio: request.domicilio } });
        return confirmacion;
      },
    }),
    // sessionStorage: la confirmación sobrevive a un F5 pero no queda guardada entre sesiones.
    { name: 'missl_pedido', storage: createJSONStorage(() => storageSeguro('session')) },
  ),
);
