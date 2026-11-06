import type { Producto } from './producto';

/** Lo que se guarda del carrito en el navegador: solo id + talle + cantidad (los precios los da la API). */
export interface ItemCarrito {
  productoId: number;
  talle: string;
  cantidad: number;
}

/** Ítem del carrito combinado con los datos actuales del producto (GET /productos). */
export interface LineaCarrito extends ItemCarrito {
  index: number;
  producto: Producto;
  subtotal: number;
}
