import { useEffect, useMemo } from 'react';
import { productosApi } from '../api/productosApi';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { armarLineas, calcularTotales } from '../util/precio';
import { useApi } from './useApi';

/**
 * Carrito listo para mostrar: los ítems guardados se combinan con GET /productos para tener
 * precios y promociones vigentes. Los productos dados de baja se quitan del carrito.
 */
export function useCarrito() {
  const items = useCartStore((s) => s.items);
  const conservarSolo = useCartStore((s) => s.conservarSolo);
  const cliente = useAuthStore((s) => s.cliente);
  const catalogo = useApi(() => productosApi.listar(), []);

  const productos = catalogo.datos;
  useEffect(() => {
    if (productos) conservarSolo(productos.map((p) => p.id));
  }, [productos, conservarSolo]);

  const lineas = useMemo(() => armarLineas(items, productos ?? []), [items, productos]);
  const totales = useMemo(() => calcularTotales(lineas, cliente), [lineas, cliente]);

  return {
    lineas,
    totales,
    cliente,
    hayItems: items.length > 0,
    cargando: catalogo.cargando && !productos,
    error: catalogo.error,
    recargar: catalogo.recargar,
  };
}
