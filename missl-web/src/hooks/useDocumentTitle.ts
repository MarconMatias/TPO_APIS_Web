import { useEffect } from 'react';

/** Título de la pestaña por vista: ayuda a orientarse con lectores de pantalla y en el historial. */
export function useDocumentTitle(titulo: string) {
  useEffect(() => {
    document.title = titulo ? `${titulo} · MISSL` : 'MISSL';
  }, [titulo]);
}
