import type { Confirmacion, VentaCliente, VentaRequest } from '../types/venta';
import { http } from './client';

/** Ventas del cliente: requieren sesión (no hay compra como invitado). */
export const ventasApi = {
  /** POST /ventas → confirmación. El backend calcula precios, descuento y total. */
  crear: (request: VentaRequest) => http.post<Confirmacion>('/ventas', request, 'cliente'),

  /** GET /ventas/mias: historial de compras del cliente autenticado. */
  mias: () => http.get<VentaCliente[]>('/ventas/mias', 'cliente'),
};
