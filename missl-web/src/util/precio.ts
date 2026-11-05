import { DESCUENTO_REGISTRO_PCT } from '../data/catalogo';
import type { ItemCarrito, LineaCarrito, Producto, Usuario } from '../types';

/** "$ 289.900" */
export function formatPrecio(valor: number): string {
  return '$ ' + Math.round(valor).toLocaleString('es-AR');
}

export function precioFinal(p: Producto): number {
  return p.descuento > 0 ? p.precio * (1 - p.descuento / 100) : p.precio;
}

export function etiquetaEntrega(p: Producto, corta = false): string {
  if (p.enStock) return corta ? 'Entrega inmediata' : 'Entrega inmediata · 24 a 72 h';
  return 'Por encargo · 3 semanas';
}

/** Combina los ítems guardados (id + talle) con el catálogo vigente; descarta productos borrados. */
export function armarLineas(items: ItemCarrito[], productos: Producto[]): LineaCarrito[] {
  return items.flatMap((item, index) => {
    const producto = productos.find((p) => p.id === item.productoId);
    return producto ? [{ ...item, index, producto, subtotal: precioFinal(producto) * item.cantidad }] : [];
  });
}

export interface Totales {
  subtotal: number;
  descuento: number;
  total: number;
  aplicaDescuento: boolean;
}

export function calcularTotales(lineas: LineaCarrito[], usuario: Usuario | null): Totales {
  const subtotal = lineas.reduce((acc, l) => acc + l.subtotal, 0);
  const aplicaDescuento = usuario !== null && !usuario.primeraCompraUsada;
  const descuento = aplicaDescuento ? (subtotal * DESCUENTO_REGISTRO_PCT) / 100 : 0;
  return { subtotal, descuento, total: subtotal - descuento, aplicaDescuento };
}
