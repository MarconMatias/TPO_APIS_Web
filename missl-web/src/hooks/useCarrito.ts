import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useProductStore } from '../store/productStore';
import { armarLineas, calcularTotales } from '../util/precio';

/** Carrito listo para mostrar: líneas con producto + totales con el descuento de registro. */
export function useCarrito() {
  const items = useCartStore((s) => s.items);
  const productos = useProductStore((s) => s.productos);
  const usuario = useAuthStore((s) => s.usuario);

  const lineas = useMemo(() => armarLineas(items, productos), [items, productos]);
  const totales = useMemo(() => calcularTotales(lineas, usuario), [lineas, usuario]);

  return { lineas, totales, usuario };
}
