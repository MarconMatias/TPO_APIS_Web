import type { Producto } from '../../types/producto';
import { formatPrecio } from '../../util/precio';

interface PreciosProps {
  producto: Producto;
  className?: string;
  /** Muestra el porcentaje como badge visible (ficha de producto). */
  conBadge?: boolean;
}

/** <data> guarda el valor numérico; <s> marca el precio anterior. precioFinal y promo los calcula el backend. */
export function Precios({ producto, className = '', conBadge = false }: PreciosProps) {
  const { precio, precioFinal, promoActiva, promoPct } = producto;

  return (
    <p className={`prices num ${className}`}>
      <data value={Math.round(precioFinal)}>{formatPrecio(precioFinal)}</data>
      {promoActiva && (
        <>
          <s>
            <span className="sr-only">Precio anterior: </span>
            {formatPrecio(precio)}
          </s>
          <span className={conBadge ? 'badge solid' : 'sr-only'}>
            <span aria-hidden="true">−{promoPct}%</span>
            <span className="sr-only">{promoPct}% de descuento</span>
          </span>
        </>
      )}
    </p>
  );
}
