import { DESCUENTO_REGISTRO_PCT } from '../constants/negocio';

/** "$ 289.900" */
export function formatPrecio(valor) {
  return '$ ' + Math.round(valor).toLocaleString('es-AR');
}

/** Versión corta de deliveryLabel (la larga la arma el backend). */
export function entregaCorta(p) {
  return p.enStock ? 'Entrega inmediata' : 'Por encargo · 3 semanas';
}

/**
 * Combina los ítems guardados (id + talle) con el catálogo vigente; descarta productos dados de baja.
 * Cada línea: { productoId, talle, cantidad, index, producto, subtotal }.
 */
export function armarLineas(items, productos) {
  return items.flatMap((item, index) => {
    const producto = productos.find((p) => p.id === item.productoId);
    return producto ? [{ ...item, index, producto, subtotal: producto.precioFinal * item.cantidad }] : [];
  });
}

/**
 * Estimación para mostrar antes de pagar: { subtotal, descuento, total, aplicaDescuento }.
 * El importe definitivo lo calcula missl-api en POST /ventas
 * (mismo criterio: 5% si el cliente todavía no usó su descuento de bienvenida).
 */
export function calcularTotales(lineas, cliente) {
  const subtotal = lineas.reduce((acc, l) => acc + l.subtotal, 0);
  const aplicaDescuento = cliente !== null && cliente.descuentoDisponible;
  const descuento = aplicaDescuento ? (subtotal * DESCUENTO_REGISTRO_PCT) / 100 : 0;
  return { subtotal, descuento, total: subtotal - descuento, aplicaDescuento };
}
