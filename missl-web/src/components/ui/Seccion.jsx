import { Link } from 'react-router-dom';
import styles from './Seccion.module.scss';

/** Sección a todo el ancho con encabezado h2 subrayado y enlace opcional ({ to, label }, ej.: "Ver todo"). */
export function Seccion({ id, titulo, enlace, children }) {
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
