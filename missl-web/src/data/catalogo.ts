import type { Categoria, Producto } from '../types';

/** Datos de ejemplo: en la etapa full stack vienen de missl-api. */

export const DESCUENTO_REGISTRO_PCT = 5;

export const CATEGORIAS: Record<Categoria, { label: string; talles: string[] }> = {
  zapatillas: { label: 'Zapatillas', talles: ['38', '39', '40', '41', '42', '43'] },
  indumentaria: { label: 'Indumentaria', talles: ['S', 'M', 'L', 'XL'] },
  carteras: { label: 'Carteras', talles: ['Único'] },
};

export const LISTA_CATEGORIAS = Object.keys(CATEGORIAS) as Categoria[];

export function esCategoria(valor: string | undefined): valor is Categoria {
  return valor !== undefined && valor in CATEGORIAS;
}

export const TABLAS_TALLES: Record<Categoria, { head: string[]; rows: string[][] }> = {
  zapatillas: {
    head: ['AR / EU', 'US Hombre', 'US Mujer', 'CM'],
    rows: [
      ['38', '6', '7.5', '24.0'],
      ['39', '6.5', '8', '24.5'],
      ['40', '7.5', '9', '25.5'],
      ['41', '8', '9.5', '26.0'],
      ['42', '9', '10.5', '27.0'],
      ['43', '9.5', '11', '27.5'],
    ],
  },
  indumentaria: {
    head: ['Talle', 'Pecho (cm)', 'Largo (cm)', 'Manga (cm)'],
    rows: [
      ['S', '104', '66', '61'],
      ['M', '110', '69', '63'],
      ['L', '116', '72', '65'],
      ['XL', '122', '75', '67'],
    ],
  },
  carteras: {
    head: ['Medida', 'Valor'],
    rows: [
      ['Ancho', '26 cm'],
      ['Alto', '18 cm'],
      ['Profundidad', '9 cm'],
      ['Correa', '55 a 110 cm'],
    ],
  },
};

export const PRODUCTOS_INICIALES: Producto[] = [
  { id: 'zk1', nombre: 'Gel-Kayano 14', marca: 'Asics', categoria: 'zapatillas', precio: 289900, descuento: 15, enStock: true, tendencia: true, descripcion: 'Silueta running de 2005 recuperada en malla y cuero sintético, con GEL en talón y antepié. Colorway cream / pure silver.' },
  { id: 'zk2', nombre: '550 White Green', marca: 'New Balance', categoria: 'zapatillas', precio: 249900, descuento: 0, enStock: true, tendencia: true, descripcion: 'Básquet de los 80 en cuero blanco con detalles verdes y suela de goma. Calza fiel al talle.' },
  { id: 'zk3', nombre: '9060 Rain Cloud', marca: 'New Balance', categoria: 'zapatillas', precio: 319900, descuento: 0, enStock: false, tendencia: true, descripcion: 'Reinterpretación del 99X con entresuela ABZORB y SBS. Gris cemento con panel de malla.' },
  { id: 'zk4', nombre: 'Mexico 66', marca: 'Onitsuka Tiger', categoria: 'zapatillas', precio: 219900, descuento: 0, enStock: true, tendencia: false, descripcion: 'Clásico japonés en cuero blanco con las tiras Onitsuka azul y rojo. Suela EVA delgada.' },
  { id: 'zk5', nombre: 'Dunk Low Panda', marca: 'Nike', categoria: 'zapatillas', precio: 259900, descuento: 0, enStock: false, tendencia: true, descripcion: 'Cuero blanco y negro, corte bajo, cuello acolchado. El par más pedido del catálogo.' },
  { id: 'zk7', nombre: 'Samba OG', marca: 'Adidas', categoria: 'zapatillas', precio: 209900, descuento: 10, enStock: true, tendencia: false, descripcion: 'Cuero negro con las tres tiras en blanco, puntera de gamuza y suela de goma.' },
  { id: 'zk10', nombre: 'Superstar Penstar', marca: 'Golden Goose', categoria: 'zapatillas', precio: 689900, descuento: 0, enStock: false, tendencia: false, descripcion: 'Cuero italiano con estrella lateral y tratamiento vintage hecho a mano.' },
  { id: 'in1', nombre: 'Hoodie Essentials FW', marca: 'Essentials', categoria: 'indumentaria', precio: 149900, descuento: 0, enStock: true, tendencia: false, descripcion: 'Buzo oversize de algodón peinado 480 g con logo de goma en el pecho y capucha doble.' },
  { id: 'in2', nombre: 'Box Logo Hoodie', marca: 'Supreme', categoria: 'indumentaria', precio: 429900, descuento: 0, enStock: false, tendencia: false, descripcion: 'Frisa pesada con box logo bordado, puños acanalados y bolsillo canguro.' },
  { id: 'in4', nombre: 'Beta LT Jacket', marca: 'Arcteryx', categoria: 'indumentaria', precio: 899900, descuento: 0, enStock: true, tendencia: false, descripcion: 'Shell Gore-Tex de tres capas, capucha StormHood y costuras termoselladas.' },
  { id: 'ca2', nombre: 'Tabby 26', marca: 'Coach', categoria: 'carteras', precio: 389900, descuento: 0, enStock: true, tendencia: false, descripcion: 'Cuero glovetanned con cierre turnlock, correa corta y bandolera desmontable.' },
  { id: 'ca4', nombre: 'Bedford Legacy', marca: 'Michael Kors', categoria: 'carteras', precio: 219900, descuento: 20, enStock: true, tendencia: false, descripcion: 'Cuero saffiano con herrajes dorados y tres compartimentos internos.' },
];

/** Cierre simulado de la promoción vigente (en la app real lo informa el backend). */
export const FIN_PROMOCION = Date.now() + 23 * 3_600_000 + 41 * 60_000;

/** Cuenta de prueba para evaluar el ingreso sin registrarse. */
export const USUARIO_DEMO = { nombre: 'Cliente Demo', email: 'demo@missl.com.ar', password: 'missl2026' };
