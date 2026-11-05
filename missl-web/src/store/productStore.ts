import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { PRODUCTOS_INICIALES } from '../data/catalogo';
import type { Producto, ProductoInput } from '../types';
import { simularLatencia, storageSeguro } from '../util/simular';

interface ProductState {
  productos: Producto[];
  /** Alta (id null) o modificación. Simula la latencia de la API para mostrar "Guardando…". */
  guardar: (id: string | null, datos: ProductoInput) => Promise<Producto>;
  eliminar: (id: string) => void;
  restablecer: () => void;
}

/** Catálogo local: reemplaza a GET/POST/PUT/DELETE /productos mientras no hay backend conectado. */
export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      productos: PRODUCTOS_INICIALES,

      guardar: async (id, datos) => {
        await simularLatencia(700);
        if (id) {
          const actualizado = { ...datos, id };
          set({ productos: get().productos.map((p) => (p.id === id ? actualizado : p)) });
          return actualizado;
        }
        const nuevo = { ...datos, id: 'n' + Date.now().toString(36) };
        set({ productos: [nuevo, ...get().productos] });
        return nuevo;
      },

      eliminar: (id) => set({ productos: get().productos.filter((p) => p.id !== id) }),

      restablecer: () => set({ productos: PRODUCTOS_INICIALES }),
    }),
    {
      name: 'missl_productos',
      storage: createJSONStorage(() => storageSeguro('local')),
      partialize: (s) => ({ productos: s.productos }),
    },
  ),
);
