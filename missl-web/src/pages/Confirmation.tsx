import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui/EmptyState';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useOrderStore } from '../store/orderStore';
import { formatPrecio } from '../util/precio';
import styles from './Confirmation.module.scss';

/** Paso 3: comprobante del pedido recién pagado. */
export function Confirmation() {
  useDocumentTitle('Compra confirmada');
  const pedido = useOrderStore((s) => s.ultimoPedido);

  if (!pedido) {
    return (
      <EmptyState nivel="h1" titulo="No hay un pedido reciente" texto="Cuando completes una compra, vas a ver acá el comprobante.">
        <Link to="/catalogo" className="btn">Ver catálogo</Link>
      </EmptyState>
    );
  }

  return (
    <section className={`${styles.confirm} band`} aria-labelledby="h-confirmacion">
      <hgroup>
        <p className={`eyebrow ${styles.ok}`}>
          <span aria-hidden="true">✓ </span>Pago acreditado
        </p>
        <h1 id="h-confirmacion">Gracias por tu compra.</h1>
      </hgroup>
      <p>Te enviamos el comprobante a {pedido.email}. Podés seguir el estado del pedido desde tu cuenta.</p>

      <dl className={`${styles.kv} num`}>
        <dt>Pedido</dt>
        <dd>{pedido.codigo}</dd>
        <dt>Productos</dt>
        <dd>
          <ul>
            {pedido.lineas.map((l) => (
              <li key={`${l.nombre}-${l.talle}`}>
                {l.nombre} · talle {l.talle} × {l.cantidad}
              </li>
            ))}
          </ul>
        </dd>
        {pedido.descuento > 0 && (
          <>
            <dt>Descuento</dt>
            <dd>− {formatPrecio(pedido.descuento)}</dd>
          </>
        )}
        <dt>Total</dt>
        <dd>{formatPrecio(pedido.total)}</dd>
        <dt>Medio de pago</dt>
        <dd>{pedido.medioPago}</dd>
        <dt>Envío a</dt>
        <dd>{pedido.direccion}</dd>
        <dt>Entrega estimada</dt>
        <dd>{pedido.entregaEstimada}</dd>
      </dl>

      <p className={styles.botones}>
        <Link to="/" className="btn">Volver al inicio</Link>
        <Link to="/catalogo" className="btn ghost">Seguir comprando</Link>
      </p>
    </section>
  );
}
