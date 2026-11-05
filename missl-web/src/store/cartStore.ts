import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ItemCarrito } from '../types';
import { storageSeguro } from '../util/simular';

interface CartState {
  items: ItemCarrito[];
  agregar: (productoId: string, talle: string) => void;
  incrementar: (index: number) => void;
  decrementar: (index: number) => void;
  quitar: (index: number) => void;
  /** Al borrar un producto del catálogo se lo saca también del carrito. */
  quitarProducto: (productoId: string) => void;
  vaciar: () => void;
}

const conCantidad = (items: ItemCarrito[], index: number, delta: number) =>
  items.map((item, n) => (n === index ? { ...item, cantidad: Math.max(1, item.cantidad + delta) } : item));

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (productoId, talle) => {
        const items = get().items;
        const index = items.findIndex((i) => i.productoId === productoId && i.talle === talle);
        set({ items: index >= 0 ? conCantidad(items, index, 1) : [...items, { productoId, talle, cantidad: 1 }] });
      },
      incrementar: (index) => set({ items: conCantidad(get().items, index, 1) }),
      decrementar: (index) => set({ items: conCantidad(get().items, index, -1) }),
      quitar: (index) => set({ items: get().items.filter((_, n) => n !== index) }),
      quitarProducto: (productoId) => set({ items: get().items.filter((i) => i.productoId !== productoId) }),
      vaciar: () => set({ items: [] }),
    }),
    { name: 'missl_carrito', storage: createJSONStorage(() => storageSeguro('local')) },
  ),
);

/** Selector de la cantidad total de unidades (para el contador del header). */
export const selectCantidadTotal = (s: CartState) => s.items.reduce((acc, i) => acc + i.cantidad, 0);
