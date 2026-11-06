import { DESCUENTO_REGISTRO_PCT } from '../constants/negocio';
import type { ItemCarrito, LineaCarrito } from '../types/carrito';
import type { Cliente } from '../types/cliente';
import type { Producto } from '../types/producto';

/** "$ 289.900" */
export function formatPrecio(valor: number): string {
  return '$ ' + Math.round(valor).toLocaleString('es-AR');
}

/** Versión corta de deliveryLabel (la larga la arma el backend). */
export function entregaCorta(p: Producto): string {
  return p.enStock ? 'Entrega inmediata' : 'Por encargo · 3 semanas';
}

/** Combina los ítems guardados (id + talle) con el catálogo vigente; descarta productos dados de baja. */
export function armarLineas(items: ItemCarrito[], productos: Producto[]): LineaCarrito[] {
  return items.flatMap((item, index) => {
    const producto = productos.find((p) => p.id === item.productoId);
    return producto ? [{ ...item, index, producto, subtotal: producto.precioFinal * item.cantidad }] : [];
  });
}

export interface Totales {
  subtotal: number;
  descuento: number;
  total: number;
  aplicaDescuento: boolean;
}

/**
 * Estimación para mostrar antes de pagar. El importe definitivo lo calcula missl-api en POST /ventas
 * (mismo criterio: 5% si el cliente todavía no usó su descuento de bienvenida).
 */
export function calcularTotales(lineas: LineaCarrito[], cliente: Cliente | null): Totales {
  const subtotal = lineas.reduce((acc, l) => acc + l.subtotal, 0);
  const aplicaDescuento = cliente !== null && !cliente.descuentoRegistroUsado;
  const descuento = aplicaDescuento ? (subtotal * DESCUENTO_REGISTRO_PCT) / 100 : 0;
  return { subtotal, descuento, total: subtotal - descuento, aplicaDescuento };
}
