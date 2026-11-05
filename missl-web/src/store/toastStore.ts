import { create } from 'zustand';

const DURACION_MS = 4200;

export interface Aviso {
  id: number;
  mensaje: string;
  /** Enlace opcional dentro del aviso (ej.: "Ver carrito"). */
  accion?: { label: string; to: string };
}

interface ToastState {
  aviso: Aviso | null;
  mostrar: (mensaje: string, accion?: Aviso['accion']) => void;
  ocultar: () => void;
}

let timeoutId: ReturnType<typeof setTimeout> | undefined;
let secuencia = 0;

/** Aviso flotante global (abajo al centro). */
export const useToastStore = create<ToastState>((set) => ({
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
