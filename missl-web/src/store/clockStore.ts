import { create } from 'zustand';

/** Reloj compartido: un único setInterval alimenta todas las cuentas regresivas. */
export const useClockStore = create<{ ahora: number }>(() => ({ ahora: Date.now() }));

setInterval(() => useClockStore.setState({ ahora: Date.now() }), 1000);
