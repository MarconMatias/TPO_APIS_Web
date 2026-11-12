import type { Categoria } from '../types/producto';
import type { MedioPago } from '../types/venta';

/**
 * Datos simulados (hardcodeados) para usar el front sin missl-api.
 * Solo se usan cuando USAR_MOCK está activo (ver src/config.ts).
 */

export interface ProductoMock {
  id: number;
  sku: string;
  nombre: string;
  marca: string;
  categoria: Categoria;
  precio: number;
  enStock: boolean;
  esTendencia: boolean;
  descripcion: string | null;
  /** Stock por talle (solo cuenta si enStock; por encargo se puede pedir cualquier talle). */
  stock: Record<string, number>;
  promoPct: number;
  promoHoras: number;
  /** Timestamp (ms) en que termina la promo; null = sin promo. */
  promoFin: number | null;
  activo: boolean;
}

export interface CuentaMock {
  nombre: string;
  email: string;
  password: string;
  descuentoDisponible: boolean;
}

export interface VentaMock {
  codigo: string;
  email: string;
  fecha: string;
  medioPago: MedioPago;
  subtotal: number;
  descuento: number;
  total: number;
  estado: 'PENDIENTE' | 'ENTREGADO';
}

export const TALLES_POR_CATEGORIA: Record<Categoria, string[]> = {
  ZAPATILLAS: ['38', '39', '40', '41', '42', '43'],
  INDUMENTARIA: ['S', 'M', 'L', 'XL'],
  CARTERAS: ['Único'],
};

export const ADMIN_MOCK = { email: 'admin@missl.com.ar', password: 'missl2026' };

const HORA = 3_600_000;

type Semilla = Omit<ProductoMock, 'id' | 'sku' | 'stock' | 'promoHoras' | 'promoFin' | 'activo'> & { promoHoras?: number };

const SEMILLAS: Semilla[] = [
  { nombre: 'Gel-Kayano 14', marca: 'Asics', categoria: 'ZAPATILLAS', precio: 289900, promoPct: 15, promoHoras: 24, enStock: true, esTendencia: true, descripcion: 'Silueta running de 2005 recuperada en malla y cuero sintético, con GEL en talón y antepié. Colorway cream / pure silver.' },
  { nombre: '550 White Green', marca: 'New Balance', categoria: 'ZAPATILLAS', precio: 249900, promoPct: 0, enStock: true, esTendencia: true, descripcion: 'Básquet de los 80 en cuero blanco con detalles verdes y suela de goma. Calza fiel al talle.' },
  { nombre: '9060 Rain Cloud', marca: 'New Balance', categoria: 'ZAPATILLAS', precio: 319900, promoPct: 0, enStock: false, esTendencia: true, descripcion: 'Reinterpretación del 99X con entresuela ABZORB y SBS. Gris cemento con panel de malla.' },
  { nombre: 'Mexico 66', marca: 'Onitsuka Tiger', categoria: 'ZAPATILLAS', precio: 219900, promoPct: 0, enStock: true, esTendencia: false, descripcion: 'Clásico japonés en cuero blanco con las tiras Onitsuka azul y rojo. Suela EVA delgada.' },
  { nombre: 'Dunk Low Panda', marca: 'Nike', categoria: 'ZAPATILLAS', precio: 259900, promoPct: 0, enStock: false, esTendencia: true, descripcion: 'Cuero blanco y negro, corte bajo, cuello acolchado. El par más pedido del catálogo.' },
  { nombre: 'Samba OG', marca: 'Adidas', categoria: 'ZAPATILLAS', precio: 209900, promoPct: 10, promoHoras: 48, enStock: true, esTendencia: false, descripcion: 'Cuero negro con las tres tiras en blanco, puntera de gamuza y suela de goma.' },
  { nombre: 'Superstar Penstar', marca: 'Golden Goose', categoria: 'ZAPATILLAS', precio: 689900, promoPct: 0, enStock: false, esTendencia: false, descripcion: 'Cuero italiano con estrella lateral y tratamiento vintage hecho a mano.' },
  { nombre: 'Hoodie Essentials FW', marca: 'Essentials', categoria: 'INDUMENTARIA', precio: 149900, promoPct: 0, enStock: true, esTendencia: false, descripcion: 'Buzo oversize de algodón peinado 480 g con logo de goma en el pecho y capucha doble.' },
  { nombre: 'Box Logo Hoodie', marca: 'Supreme', categoria: 'INDUMENTARIA', precio: 429900, promoPct: 0, enStock: false, esTendencia: false, descripcion: 'Frisa pesada con box logo bordado, puños acanalados y bolsillo canguro.' },
  { nombre: 'Beta LT Jacket', marca: 'Arcteryx', categoria: 'INDUMENTARIA', precio: 899900, promoPct: 0, enStock: true, esTendencia: false, descripcion: 'Shell Gore-Tex de tres capas, capucha StormHood y costuras termoselladas.' },
  { nombre: 'Tabby 26', marca: 'Coach', categoria: 'CARTERAS', precio: 389900, promoPct: 0, enStock: true, esTendencia: false, descripcion: 'Cuero glovetanned con cierre turnlock, correa corta y bandolera desmontable.' },
  { nombre: 'Bedford Legacy', marca: 'Michael Kors', categoria: 'CARTERAS', precio: 219900, promoPct: 20, promoHoras: 12, enStock: true, esTendencia: false, descripcion: 'Cuero saffiano con herrajes dorados y tres compartimentos internos.' },
];

export function skuPara(categoria: Categoria, id: number): string {
  return `${categoria.slice(0, 3)}-${String(id).padStart(3, '0')}`;
}

/** Stock por talle "variado" pero determinístico; algunos talles quedan en 0 para ver el estado agotado. */
export function stockInicial(categoria: Categoria, id: number): Record<string, number> {
  return Object.fromEntries(TALLES_POR_CATEGORIA[categoria].map((t, i) => [t, (id * 7 + i * 3) % 5]));
}

export function productosIniciales(ahora: number): ProductoMock[] {
  return SEMILLAS.map(({ promoHoras = 24, ...s }, i) => {
    const id = i + 1;
    return {
      ...s,
      id,
      sku: skuPara(s.categoria, id),
      stock: stockInicial(s.categoria, id),
      promoHoras,
      promoFin: s.promoPct > 0 ? ahora + promoHoras * HORA - 19 * 60_000 : null,
      activo: true,
    };
  });
}

export const CUENTAS_INICIALES: CuentaMock[] = [
  { nombre: 'Cliente Demo', email: 'demo@missl.com.ar', password: 'missl2026', descuentoDisponible: true },
  { nombre: 'Camila Duarte', email: 'camila.duarte@gmail.com', password: 'missl1234', descuentoDisponible: false },
];

export const VENTAS_INICIALES: VentaMock[] = [
  { codigo: 'MS-48213', email: 'camila.duarte@gmail.com', fecha: '2026-09-18T15:42:00Z', medioPago: 'MERCADOPAGO', subtotal: 249900, descuento: 12495, total: 237405, estado: 'ENTREGADO' },
  { codigo: 'MS-51077', email: 'camila.duarte@gmail.com', fecha: '2026-10-30T11:05:00Z', medioPago: 'TRANSFERENCIA', subtotal: 389900, descuento: 0, total: 389900, estado: 'PENDIENTE' },
];
