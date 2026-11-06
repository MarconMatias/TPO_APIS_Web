import type { Confirmacion, VentaRequest } from '../types/venta';
import { http } from './client';

/** Checkout: requiere sesión de cliente (no hay compra como invitado). */
export const ventasApi = {
  /** POST /ventas → 201 con la confirmación. El backend calcula precios, descuento y total. */
  crear: (request: VentaRequest) => http.post<Confirmacion>('/ventas', request, 'cliente'),
};
