import { useCallback, useEffect, useState, type DependencyList } from 'react';
import { ApiError } from '../api/client';

interface EstadoApi<T> {
  datos: T | null;
  cargando: boolean;
  error: ApiError | null;
}

/**
 * Ejecuta una lectura a la API cada vez que cambian `deps` y expone los estados de carga y error.
 * - Ignora respuestas que llegan tarde (si el usuario cambió de filtro antes de que respondiera).
 * - Mantiene los datos anteriores mientras recarga, para no "parpadear" al cambiar el orden.
 * - `recargar()` vuelve a pedir los datos (botón "Reintentar" o después de guardar en el admin).
 */
export function useApi<T>(pedir: () => Promise<T>, deps: DependencyList) {
  const [estado, setEstado] = useState<EstadoApi<T>>({ datos: null, cargando: true, error: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let vigente = true;
    setEstado((previo) => ({ ...previo, cargando: true, error: null }));
    pedir()
      .then((datos) => {
        if (vigente) setEstado({ datos, cargando: false, error: null });
      })
      .catch((error: unknown) => {
        if (!vigente) return;
        const apiError = error instanceof ApiError ? error : new ApiError(0, ['Ocurrió un error inesperado.']);
        setEstado({ datos: null, cargando: false, error: apiError });
      });
    return () => {
      vigente = false;
    };
    // `pedir` cambia en cada render; las dependencias reales las declara quien usa el hook.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  return { ...estado, recargar };
}
