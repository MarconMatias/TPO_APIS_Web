/** Tipos espejo de los DTO de ventas de missl-api (POST /api/ventas). */

export type MedioPago = 'MERCADOPAGO' | 'DEBITO' | 'TRANSFERENCIA';

/** VentaItemRequest */
export interface VentaItemRequest {
  productoId: number;
  talle: string;
  cantidad: number;
}

/** VentaRequest: el cliente sale del JWT, no va en el body. */
export interface VentaRequest {
  items: VentaItemRequest[];
  medioPago: MedioPago;
  domicilio: string;
  telefono: string;
}

/** ConfirmacionDTO */
export interface Confirmacion {
  codigo: string;
  subtotal: number;
  descuento: number;
  total: number;
  medioPago: MedioPago;
  emailCliente: string;
  emailAdminNotificado: string;
  estado: 'PENDIENTE' | 'ENTREGADO';
  entregaEstimada: string;
}
