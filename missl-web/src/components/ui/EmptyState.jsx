import styles from './EmptyState.module.scss';

/**
 * Estado vacío / sin resultados con su acción para salir de él.
 * `nivel`: 'h1' si es el contenido principal de la vista, 'h2' (default) si es una sección.
 */
export function EmptyState({ titulo, texto, nivel: Titulo = 'h2', children }) {
  return (
    <section className={`${styles.empty} band`} aria-label={titulo}>
      <Titulo>{titulo}</Titulo>
      <p>{texto}</p>
      {children && <p className={styles.acciones}>{children}</p>}
    </section>
  );
}
