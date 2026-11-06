import type { FiltrosCatalogo, Producto, ProductoDetalle } from '../types/producto';
import { http } from './client';

/** Catálogo público (sin sesión). */
export const productosApi = {
  /** GET /productos?categoria=&marca=&stock=&orden= */
  listar(filtros: FiltrosCatalogo = {}): Promise<Producto[]> {
    const params = new URLSearchParams();
    if (filtros.categoria) params.set('categoria', filtros.categoria);
    if (filtros.marca) params.set('marca', filtros.marca);
    if (filtros.stock) params.set('stock', 'true');
    if (filtros.orden) params.set('orden', filtros.orden);
    const query = params.toString();
    return http.get<Producto[]>(`/productos${query ? `?${query}` : ''}`);
  },

  /** GET /productos/{id}: ficha con talles (stock por talle) y sugeridos. */
  detalle(id: number): Promise<ProductoDetalle> {
    return http.get<ProductoDetalle>(`/productos/${id}`);
  },
};
