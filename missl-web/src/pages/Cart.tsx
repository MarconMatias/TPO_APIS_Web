import { Link, useNavigate } from 'react-router-dom';
import { ResumenPedido } from '../components/cart/ResumenPedido';
import { Cargando, ErrorDeCarga } from '../components/ui/Carga';
import { EmptyState } from '../components/ui/EmptyState';
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder';
import { PageHeader } from '../components/ui/PageHeader';
import { useCarrito } from '../hooks/useCarrito';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import type { LineaCarrito } from '../types/carrito';
import { entregaCorta, formatPrecio } from '../util/precio';
import styles from './Cart.module.scss';

export function Cart() {
  useDocumentTitle('Carrito');
  const navigate = useNavigate();
  const mostrarAviso = useToastStore((s) => s.mostrar);
  const { lineas, totales, cliente, hayItems, cargando, error, recargar } = useCarrito();

  const iniciarCompra = () => {
    if (!cliente) {
      mostrarAviso('Necesitás una cuenta antes de iniciar la compra');
      navigate('/cuenta?volver=/checkout');
      return;
    }
    navigate('/checkout');
  };

  const contenido = () => {
    if (!hayItems) {
      return (
        <EmptyState titulo="Tu carrito está vacío." texto="Explorá el catálogo o mirá lo que tenemos para entrega inmediata.">
          <Link to="/catalogo" className="btn">Ver catálogo</Link>
          <Link to="/entrega-inmediata" className="btn ghost">Entrega inmediata</Link>
        </EmptyState>
      );
    }
    if (error) return <ErrorDeCarga error={error} onReintentar={recargar} titulo="No pudimos actualizar los precios del carrito" />;
    if (cargando) return <Cargando texto="Actualizando precios…" />;

    return (
      <section className={`${styles.layout} band`} aria-label="Detalle de la compra">
        <section aria-labelledby="h-items">
          <h2 id="h-items" className="sr-only">Productos en el carrito</h2>
          <ul>
            {lineas.map((linea) => (
              <li key={`${linea.productoId}-${linea.talle}`}>
                <LineaItem linea={linea} />
              </li>
            ))}
          </ul>
        </section>

        <ResumenPedido lineas={lineas} totales={totales} cliente={cliente}>
          <button type="button" className="btn block" onClick={iniciarCompra}>
            {cliente ? 'Continuar al pago' : 'Iniciar compra'}
          </button>
        </ResumenPedido>
      </section>
    );
  };

  return (
    <>
      <PageHeader id="h-carrito" eyebrow="MISSL · Tu compra" titulo="Carrito" />
      {contenido()}
    </>
  );
}

function LineaItem({ linea }: { linea: LineaCarrito }) {
  const incrementar = useCartStore((s) => s.incrementar);
  const decrementar = useCartStore((s) => s.decrementar);
  const quitar = useCartStore((s) => s.quitar);
  const mostrarAviso = useToastStore((s) => s.mostrar);
  const { producto, cantidad, talle, index } = linea;
  const enMinimo = cantidad <= 1;

  return (
    <article className={styles.line}>
      <ImagePlaceholder texto="Foto" decorativa className={styles.foto} imagenUrl={producto.imagenUrl} />
      <hgroup>
        <p className={`eyebrow ${styles.marca}`}>{producto.marca}</p>
        <h3>
          <Link to={`/producto/${producto.id}`}>{producto.nombre}</Link>
        </h3>
        <p className={styles.sub}>
          Talle {talle} · {entregaCorta(producto)}
        </p>
      </hgroup>

      <p className={styles.qty} role="group" aria-label={`Cantidad de ${producto.nombre}`}>
        {/* aria-disabled (no disabled) para que el foco no se pierda al llegar a 1. */}
        <button
          type="button"
          aria-label={`Restar una unidad de ${producto.nombre}`}
          aria-disabled={enMinimo}
          onClick={() => !enMinimo && decrementar(index)}
        >
          −
        </button>
        <output className="num" aria-live="polite">{cantidad}</output>
        <button type="button" aria-label={`Sumar una unidad de ${producto.nombre}`} onClick={() => incrementar(index)}>
          +
        </button>
      </p>

      <p className={styles.precio}>
        <data className="num" value={Math.round(linea.subtotal)}>{formatPrecio(linea.subtotal)}</data>
        <button
          type="button"
          className="link-btn"
          onClick={() => {
            quitar(index);
            mostrarAviso(`${producto.nombre} (talle ${talle}) se quitó del carrito`);
          }}
        >
          Quitar<span className="sr-only"> {producto.nombre} talle {talle}</span>
        </button>
      </p>
    </article>
  );
}
