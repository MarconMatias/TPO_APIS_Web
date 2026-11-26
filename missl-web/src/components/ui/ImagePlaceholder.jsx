import styles from './ImagePlaceholder.module.scss';

/**
 * Foto del producto, o un lugar reservado con rayas mientras el backend no tenga imagen cargada.
 * - `decorativa`: true cuando la imagen repite información que ya está en texto (ej.: dentro de una tarjeta).
 * - `imagenUrl`: imagenUrl del producto (missl-api). Si es null se muestra el lugar reservado con el texto.
 */
export function ImagePlaceholder({ texto, className = '', decorativa = false, imagenUrl, children }) {
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
