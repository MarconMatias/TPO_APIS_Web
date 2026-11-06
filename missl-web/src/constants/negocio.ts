import type { Categoria } from '../types/producto';
import type { MedioPago } from '../types/venta';

/**
 * Constantes de presentación del negocio. No son datos simulados: los productos, precios,
 * talles con stock, promociones y descuentos vienen siempre de missl-api.
 */

/** Solo informativo: el descuento real lo calcula y aplica el backend (missl.descuento-registro-pct). */
export const DESCUENTO_REGISTRO_PCT = 5;

/** Etiqueta y slug de URL (/catalogo/zapatillas) de cada categoría del backend. */
export const CATEGORIAS: Record<Categoria, { label: string; slug: string }> = {
  ZAPATILLAS: { label: 'Zapatillas', slug: 'zapatillas' },
  INDUMENTARIA: { label: 'Indumentaria', slug: 'indumentaria' },
  CARTERAS: { label: 'Carteras', slug: 'carteras' },
};

export const LISTA_CATEGORIAS = Object.keys(CATEGORIAS) as Categoria[];

export function categoriaPorSlug(slug: string | undefined): Categoria | null {
  return LISTA_CATEGORIAS.find((c) => CATEGORIAS[c].slug === slug) ?? null;
}

export const MEDIOS_PAGO: Record<MedioPago, { label: string; ayuda: string }> = {
  MERCADOPAGO: { label: 'Mercado Pago', ayuda: 'Dinero en cuenta o débito vinculado' },
  DEBITO: { label: 'Tarjeta de débito', ayuda: 'Procesado por la API de pagos, sin cuotas' },
  TRANSFERENCIA: { label: 'Transferencia bancaria', ayuda: 'CBU enviado por email, acredita en 24 h' },
};

/** Guía de talles (contenido editorial, no stock). */
export const TABLAS_TALLES: Record<Categoria, { head: string[]; rows: string[][] }> = {
  ZAPATILLAS: {
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
  INDUMENTARIA: {
    head: ['Talle', 'Pecho (cm)', 'Largo (cm)', 'Manga (cm)'],
    rows: [
      ['S', '104', '66', '61'],
      ['M', '110', '69', '63'],
      ['L', '116', '72', '65'],
      ['XL', '122', '75', '67'],
    ],
  },
  CARTERAS: {
    head: ['Medida', 'Valor'],
    rows: [
      ['Ancho', '26 cm'],
      ['Alto', '18 cm'],
      ['Profundidad', '9 cm'],
      ['Correa', '55 a 110 cm'],
    ],
  },
};
