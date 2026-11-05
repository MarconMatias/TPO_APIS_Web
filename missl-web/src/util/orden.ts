import type { Producto } from '../types';
import { precioFinal } from './precio';

export const OPCIONES_ORDEN = [
  { valor: 'destacados', label: 'Destacados' },
  { valor: 'menor', label: 'Menor precio' },
  { valor: 'mayor', label: 'Mayor precio' },
  { valor: 'nombre', label: 'Nombre A–Z' },
] as const;

export type Orden = (typeof OPCIONES_ORDEN)[number]['valor'];

export function esOrden(valor: string | null): valor is Orden {
  return OPCIONES_ORDEN.some((o) => o.valor === valor);
}

export function ordenarProductos(productos: Producto[], orden: Orden): Producto[] {
  const copia = [...productos];
  switch (orden) {
    case 'menor':
      return copia.sort((a, b) => precioFinal(a) - precioFinal(b));
    case 'mayor':
      return copia.sort((a, b) => precioFinal(b) - precioFinal(a));
    case 'nombre':
      return copia.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    default:
      return copia.sort((a, b) => Number(b.tendencia) - Number(a.tendencia));
  }
}
