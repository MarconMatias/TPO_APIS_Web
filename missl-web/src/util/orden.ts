import type { Orden } from '../types/producto';

/** Opciones del parámetro ?orden= de GET /productos (el ordenamiento lo hace el backend). */
export const OPCIONES_ORDEN: { valor: Orden; label: string }[] = [
  { valor: 'destacados', label: 'Destacados' },
  { valor: 'menor', label: 'Menor precio' },
  { valor: 'mayor', label: 'Mayor precio' },
  { valor: 'nombre', label: 'Nombre A–Z' },
  { valor: 'disponibilidad', label: 'Disponibilidad' },
];

export function esOrden(valor: string | null): valor is Orden {
  return OPCIONES_ORDEN.some((o) => o.valor === valor);
}
