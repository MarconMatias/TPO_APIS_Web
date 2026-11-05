/** Simula la latencia de una llamada al backend para poder mostrar estados de espera. */
export function simularLatencia(ms = 900): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Storage tolerante: en modo privado o con el almacenamiento bloqueado, localStorage puede tirar. */
export function storageSeguro(tipo: 'local' | 'session'): Storage {
  try {
    const storage = tipo === 'local' ? window.localStorage : window.sessionStorage;
    const prueba = '__missl__';
    storage.setItem(prueba, prueba);
    storage.removeItem(prueba);
    return storage;
  } catch {
    const memoria = new Map<string, string>();
    return {
      get length() {
        return memoria.size;
      },
      clear: () => memoria.clear(),
      getItem: (k) => memoria.get(k) ?? null,
      key: (i) => [...memoria.keys()][i] ?? null,
      removeItem: (k) => void memoria.delete(k),
      setItem: (k, v) => void memoria.set(k, v),
    };
  }
}
