import { DESCUENTO_REGISTRO_PCT } from '../../constants/negocio';
import { formatPrecio } from '../../util/precio';
import styles from './ResumenPedido.module.scss';

function textoDescuento(totales, cliente) {
  if (totales.aplicaDescuento) return '− ' + formatPrecio(totales.descuento);
  if (cliente) return 'Ya usado';
  return `Registrate y ahorrá ${DESCUENTO_REGISTRO_PCT}%`;
}

/**
 * Resumen compartido entre el carrito y el checkout.
 * - `conItems`: en el checkout se listan los ítems; en el carrito ya están a la izquierda.
 * - `children`: acción principal (ej.: "Iniciar compra").
 */
export function ResumenPedido({ lineas, totales, cliente, conItems = false, children }) {
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
        <dd>{textoDescuento(totales, cliente)}</dd>
        <dt>Envío</dt>
        <dd>Gratis</dd>
        <dt className={styles.total}>Total</dt>
        <dd className={styles.total}>{formatPrecio(totales.total)}</dd>
      </dl>

      {children}

      <p className="note">
        {cliente
          ? 'Pago con Mercado Pago, débito o transferencia. Sin crédito, sin cuotas.'
          : `Necesitás una cuenta para comprar: al registrarte se aplica el ${DESCUENTO_REGISTRO_PCT}% de descuento en tu primera compra.`}
      </p>
    </aside>
  );
}
