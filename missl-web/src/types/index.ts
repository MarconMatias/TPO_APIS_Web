export type Categoria = 'zapatillas' | 'indumentaria' | 'carteras';

export interface Producto {
  id: string;
  nombre: string;
  marca: string;
  categoria: Categoria;
  /** Precio de lista en ARS. */
  precio: number;
  /** Porcentaje de descuento activo (0 = sin promoción). */
  descuento: number;
  /** true: stock físico para entrega inmediata; false: por encargo. */
  enStock: boolean;
  tendencia: boolean;
  descripcion: string;
}

/** Datos editables desde el panel de administración. */
export type ProductoInput = Omit<Producto, 'id'>;

export interface ItemCarrito {
  productoId: string;
  talle: string;
  cantidad: number;
}

/** Ítem del carrito ya combinado con los datos del producto. */
export interface LineaCarrito extends ItemCarrito {
  index: number;
  producto: Producto;
  subtotal: number;
}

export interface Usuario {
  nombre: string;
  email: string;
  /** El 5% de registro aplica solo a la primera compra. */
  primeraCompraUsada: boolean;
}

export type MedioPago = 'Mercado Pago' | 'Tarjeta de débito' | 'Transferencia bancaria';

export interface Pedido {
  codigo: string;
  lineas: { nombre: string; talle: string; cantidad: number; subtotal: number }[];
  subtotal: number;
  descuento: number;
  total: number;
  medioPago: MedioPago;
  direccion: string;
  email: string;
  entregaEstimada: string;
}
