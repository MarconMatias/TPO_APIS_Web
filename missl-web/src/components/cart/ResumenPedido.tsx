import type { ReactNode } from 'react';
import { DESCUENTO_REGISTRO_PCT } from '../../data/catalogo';
import type { LineaCarrito, Usuario } from '../../types';
import { formatPrecio, type Totales } from '../../util/precio';
import styles from './ResumenPedido.module.scss';

interface ResumenPedidoProps {
  lineas: LineaCarrito[];
  totales: Totales;
  usuario: Usuario | null;
  /** En el checkout se listan los ítems; en el carrito ya están a la izquierda. */
  conItems?: boolean;
  /** Acción principal (ej.: "Iniciar compra"). */
  children?: ReactNode;
}

function textoDescuento(totales: Totales, usuario: Usuario | null): string {
  if (totales.aplicaDescuento) return '− ' + formatPrecio(totales.descuento);
  if (usuario) return 'Ya usado';
  return `Registrate y ahorrá ${DESCUENTO_REGISTRO_PCT}%`;
}

/** Resumen compartido entre el carrito y el checkout. */
export function ResumenPedido({ lineas, totales, usuario, conItems = false, children }: ResumenPedidoProps) {
  return (
    <aside className={styles.summary} aria-labelledby="resumen-titulo">
      <h2 id="resumen-titulo">Resumen</h2>

      {conItems && (
        <ul className={`${styles.items} num`}>
          {lineas.map((l) => (
            <li key={l.index}>
              <span>
                {l.producto.nombre} · T{l.talle} × {l.cantidad}
              </span>
              <data value={Math.round(l.subtotal)}>{formatPrecio(l.subtotal)}</data>
            </li>
          ))}
        </ul>
      )}

      <dl className={`${styles.totals} num`}>
        <dt>Subtotal</dt>
        <dd>{formatPrecio(totales.subtotal)}</dd>
        <dt>{totales.aplicaDescuento ? `Descuento registro (${DESCUENTO_REGISTRO_PCT}%)` : 'Descuento por registro'}</dt>
        <dd>{textoDescuento(totales, usuario)}</dd>
        <dt>Envío</dt>
        <dd>Gratis</dd>
        <dt className={styles.total}>Total</dt>
        <dd className={styles.total}>{formatPrecio(totales.total)}</dd>
      </dl>

      {children}

      <p className="note">
        {usuario
          ? 'Pago con Mercado Pago, débito o transferencia. Sin crédito, sin cuotas.'
          : `Necesitás una cuenta para comprar: al registrarte se aplica el ${DESCUENTO_REGISTRO_PCT}% de descuento en tu primera compra.`}
      </p>
    </aside>
  );
}
