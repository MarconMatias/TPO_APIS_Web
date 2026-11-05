import type { Producto } from '../../types';
import { formatPrecio, precioFinal } from '../../util/precio';

interface PreciosProps {
  producto: Producto;
  className?: string;
  /** Muestra el porcentaje como badge visible (ficha de producto). */
  conBadge?: boolean;
}

/** <data> guarda el valor numérico; <s> marca el precio anterior que ya no vale. */
export function Precios({ producto, className = '', conBadge = false }: PreciosProps) {
  const final = precioFinal(producto);
  const { descuento } = producto;

  return (
    <p className={`prices num ${className}`}>
      <data value={Math.round(final)}>{formatPrecio(final)}</data>
      {descuento > 0 && (
        <>
          <s>
            <span className="sr-only">Precio anterior: </span>
            {formatPrecio(producto.precio)}
          </s>
          <span className={conBadge ? 'badge solid' : 'sr-only'}>
            <span aria-hidden="true">−{descuento}%</span>
            <span className="sr-only">{descuento}% de descuento</span>
          </span>
        </>
      )}
    </p>
  );
}
