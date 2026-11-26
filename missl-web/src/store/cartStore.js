import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { storageSeguro } from '../util/storage';

const conCantidad = (items, index, delta) =>
  items.map((item, n) => (n === index ? { ...item, cantidad: Math.max(1, item.cantidad + delta) } : item));

/**
 * Carrito del lado del cliente (no hay endpoint de carrito en missl-api): guarda solo
 * { productoId, talle, cantidad }; precios y descuentos se toman siempre de la API.
 */
export const useCartStore = create()(
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
      /** Saca del carrito los productos que ya no están publicados (baja en el backend). */
      conservarSolo: (idsVigentes) => {
        const items = get().items;
        const filtrados = items.filter((i) => idsVigentes.includes(i.productoId));
        if (filtrados.length !== items.length) set({ items: filtrados });
      },
      vaciar: () => set({ items: [] }),
    }),
    { name: 'missl_carrito_v2', storage: createJSONStorage(() => storageSeguro('local')) },
  ),
);

/** Selector de la cantidad total de unidades (para el contador del header). */
export const selectCantidadTotal = (s) => s.items.reduce((acc, i) => acc + i.cantidad, 0);
