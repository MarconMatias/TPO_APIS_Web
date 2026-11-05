import type { ReactNode } from 'react';
import styles from './PageHeader.module.scss';

interface PageHeaderProps {
  id: string;
  eyebrow: string;
  titulo: string;
  bajada?: ReactNode;
  children?: ReactNode;
}

/** Encabezado de página: eyebrow + h1 (único por vista) + bajada opcional. */
export function PageHeader({ id, eyebrow, titulo, bajada, children }: PageHeaderProps) {
  return (
    <header className={`${styles.pageHead} band`}>
      <hgroup>
        <p className="eyebrow">{eyebrow}</p>
        <h1 id={id}>{titulo}</h1>
        {bajada && <p className={styles.bajada}>{bajada}</p>}
      </hgroup>
      {children}
    </header>
  );
}
