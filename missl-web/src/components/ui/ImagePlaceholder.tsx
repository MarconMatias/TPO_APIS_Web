import type { ReactNode } from 'react';
import styles from './ImagePlaceholder.module.scss';

interface ImagePlaceholderProps {
  texto: string;
  className?: string;
  /** true cuando la imagen repite información que ya está en texto (ej.: dentro de una tarjeta). */
  decorativa?: boolean;
  children?: ReactNode;
}

/**
 * Lugar reservado para una foto. Con fotos reales va un <img alt="..."> dentro del <figure>
 * (o alt="" si es decorativa).
 */
export function ImagePlaceholder({ texto, className = '', decorativa = false, children }: ImagePlaceholderProps) {
  return (
    <figure className={`${styles.ph} ${className}`} aria-hidden={decorativa || undefined}>
      <figcaption>{texto}</figcaption>
      {children}
    </figure>
  );
}
