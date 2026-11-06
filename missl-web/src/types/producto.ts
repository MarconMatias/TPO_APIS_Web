/** Tipos espejo de los DTO de missl-api (com.missl.api.dto). Los importes llegan como number (BigDecimal → JSON). */

export type Categoria = 'ZAPATILLAS' | 'INDUMENTARIA' | 'CARTERAS';

/** ProductoResumenDTO: tarjeta de catálogo, home y sugeridos. */
export interface Producto {
  id: number;
  sku: string;
  nombre: string;
  marca: string;
  categoria: Categoria;
  precio: number;
  /** Precio con la promoción vigente aplicada (lo calcula el backend). */
  precioFinal: number;
  promoActiva: boolean;
  promoPct: number;
  /** Milisegundos que le quedan a la promoción; null si no hay promo activa. */
  promoRestanteMs: number | null;
  enStock: boolean;
  esTendencia: boolean;
  imagenUrl: string | null;
  deliveryLabel: string;
}

/** TalleDTO */
export interface Talle {
  talle: string;
  stockUnidades: number;
}

/** ProductoDetalleDTO: GET /productos/{id} */
export interface ProductoDetalle {
  producto: Producto;
  descripcion: string | null;
  talles: Talle[];
  sugeridos: Producto[];
}

/** Valores que acepta el parámetro ?orden= de GET /productos. */
export type Orden = 'destacados' | 'menor' | 'mayor' | 'nombre' | 'disponibilidad';

export interface FiltrosCatalogo {
  categoria?: Categoria | null;
  marca?: string | null;
  stock?: boolean | null;
  orden?: Orden | null;
}
