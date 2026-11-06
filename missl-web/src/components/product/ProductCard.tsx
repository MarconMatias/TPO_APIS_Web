import { Link } from 'react-router-dom';
import type { Producto } from '../../types/producto';
import { ImagePlaceholder } from '../ui/ImagePlaceholder';
import { Precios } from './Precios';
import styles from './ProductCard.module.scss';

/** Tarjeta de producto: <article> con un único enlace a la ficha. La foto es decorativa (repite el nombre). */
export function ProductCard({ producto }: { producto: Producto }) {
  return (
    <article className={styles.card}>
      <Link to={`/producto/${producto.id}`}>
        <ImagePlaceholder texto={producto.nombre} decorativa className={styles.foto} imagenUrl={producto.imagenUrl}>
          <span className={styles.badges}>
            {producto.promoActiva && <span className="badge solid">−{producto.promoPct}%</span>}
            {producto.enStock && <span className="badge">En stock</span>}
          </span>
        </ImagePlaceholder>
        <hgroup>
          <p className={styles.marca}>{producto.marca}</p>
          <h3>{producto.nombre}</h3>
        </hgroup>
        <Precios producto={producto} />
        <p className={styles.meta}>{producto.deliveryLabel}</p>
      </Link>
    </article>
  );
}
