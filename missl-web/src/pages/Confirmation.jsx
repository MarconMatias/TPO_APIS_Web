import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui/EmptyState';
import { MEDIOS_PAGO } from '../constants/negocio';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useOrderStore } from '../store/orderStore';
import { formatPrecio } from '../util/precio';
import styles from './Confirmation.module.scss';

/** Paso 3: comprobante con la ConfirmacionDTO que devolvió POST /ventas. */
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

  const { confirmacion: c, lineas, domicilio } = pedido;

  return (
    <section className={`${styles.confirm} band`} aria-labelledby="h-confirmacion">
      <hgroup>
        <p className={`eyebrow ${styles.ok}`}>
          <span aria-hidden="true">✓ </span>Pago acreditado
        </p>
        <h1 id="h-confirmacion">Gracias por tu compra.</h1>
      </hgroup>
      <p>
        Te enviamos el comprobante a {c.emailCliente} y avisamos al equipo de ventas ({c.emailAdminNotificado}). Las
        compras confirmadas no admiten cancelación.
      </p>

      <dl className={`${styles.kv} num`}>
        <dt>Pedido</dt>
        <dd>{c.codigo}</dd>
        <dt>Estado</dt>
        <dd>{c.estado === 'PENDIENTE' ? 'Pendiente de entrega' : 'Entregado'}</dd>
        <dt>Productos</dt>
        <dd>
          <ul>
            {lineas.map((l) => (
              <li key={`${l.nombre}-${l.talle}`}>
                {l.nombre} · talle {l.talle} × {l.cantidad}
              </li>
            ))}
          </ul>
        </dd>
        <dt>Subtotal</dt>
        <dd>{formatPrecio(c.subtotal)}</dd>
        {c.descuento > 0 && (
          <>
            <dt>Descuento de bienvenida</dt>
            <dd>− {formatPrecio(c.descuento)}</dd>
          </>
        )}
        <dt>Total</dt>
        <dd>{formatPrecio(c.total)}</dd>
        <dt>Medio de pago</dt>
        <dd>{MEDIOS_PAGO[c.medioPago]?.label ?? c.medioPago}</dd>
        <dt>Envío a</dt>
        <dd>{domicilio}</dd>
        <dt>Entrega estimada</dt>
        <dd>{c.entregaEstimada}</dd>
      </dl>

      <p className={styles.botones}>
        <Link to="/" className="btn">Volver al inicio</Link>
        <Link to="/catalogo" className="btn ghost">Seguir comprando</Link>
      </p>
    </section>
  );
}
