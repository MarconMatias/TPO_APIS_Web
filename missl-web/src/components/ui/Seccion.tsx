import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './Seccion.module.scss';

interface SeccionProps {
  id: string;
  titulo: string;
  enlace?: { to: string; label: string };
  children: ReactNode;
}

/** Sección a todo el ancho con encabezado h2 subrayado y enlace opcional ("Ver todo"). */
export function Seccion({ id, titulo, enlace, children }: SeccionProps) {
  return (
    <section className={`${styles.sec} band`} aria-labelledby={id}>
      <header className={styles.head}>
        <h2 id={id}>{titulo}</h2>
        {enlace && <Link to={enlace.to}>{enlace.label}</Link>}
      </header>
      {children}
    </section>
  );
}
