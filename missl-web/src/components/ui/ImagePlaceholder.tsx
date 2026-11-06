import type { ReactNode } from 'react';
import styles from './ImagePlaceholder.module.scss';

interface ImagePlaceholderProps {
  texto: string;
  className?: string;
  /** true cuando la imagen repite información que ya está en texto (ej.: dentro de una tarjeta). */
  decorativa?: boolean;
  /** imagenUrl del producto (missl-api). Si es null se muestra el lugar reservado con el texto. */
  imagenUrl?: string | null;
  children?: ReactNode;
}

/** Foto del producto, o un lugar reservado con rayas mientras el backend no tenga imagen cargada. */
export function ImagePlaceholder({ texto, className = '', decorativa = false, imagenUrl, children }: ImagePlaceholderProps) {
  return (
    <figure className={`${styles.ph} ${className}`} aria-hidden={decorativa || undefined}>
      {imagenUrl ? (
        <img src={imagenUrl} alt={decorativa ? '' : texto} loading="lazy" className={styles.img} />
      ) : (
        <figcaption>{texto}</figcaption>
      )}
      {children}
    </figure>
  );
}
