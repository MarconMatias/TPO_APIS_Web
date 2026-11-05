import type { ReactNode } from 'react';
import styles from './EmptyState.module.scss';

interface EmptyStateProps {
  titulo: string;
  texto: string;
  /** Nivel del título según dónde se use (h1 si es el contenido principal de la vista). */
  nivel?: 'h1' | 'h2';
  children?: ReactNode;
}

/** Estado vacío / sin resultados con su acción para salir de él. */
export function EmptyState({ titulo, texto, nivel: Titulo = 'h2', children }: EmptyStateProps) {
  return (
    <section className={`${styles.empty} band`} aria-label={titulo}>
      <Titulo>{titulo}</Titulo>
      <p>{texto}</p>
      {children && <p className={styles.acciones}>{children}</p>}
    </section>
  );
}
