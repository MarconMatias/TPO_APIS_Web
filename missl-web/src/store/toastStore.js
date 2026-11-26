import { create } from 'zustand';

const DURACION_MS = 4200;

let timeoutId;
let secuencia = 0;

/**
 * Aviso flotante global (abajo al centro): { id, mensaje, accion? }.
 * `accion` es un enlace opcional dentro del aviso (ej.: { label: 'Ver carrito', to: '/carrito' }).
 */
export const useToastStore = create((set) => ({
  aviso: null,
  mostrar: (mensaje, accion) => {
    secuencia += 1;
    set({ aviso: { id: secuencia, mensaje, accion } });
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => set({ aviso: null }), DURACION_MS);
  },
  ocultar: () => {
    clearTimeout(timeoutId);
    set({ aviso: null });
  },
}));
