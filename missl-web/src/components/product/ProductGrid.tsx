import type { Producto } from '../../types/producto';
import { ProductCard } from './ProductCard';
import styles from './ProductGrid.module.scss';

/** Grilla de productos: 4 columnas en desktop, 2 en tablet y mobile. */
export function ProductGrid({ productos, className = '' }: { productos: Producto[]; className?: string }) {
  return (
    <ul className={`${styles.grid} ${className}`}>
      {productos.map((p) => (
        <li key={p.id}>
          <ProductCard producto={p} />
        </li>
      ))}
    </ul>
  );
}
