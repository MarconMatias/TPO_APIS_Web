import { ERROR_CONEXION } from '../../config';
import styles from './Carga.module.scss';

/** Estado de espera mientras responde la API (role="status": se anuncia sin interrumpir). */
export function Cargando({ texto = 'Cargando…' }) {
  return (
    <p className={`${styles.cargando} band`} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      {texto}
    </p>
  );
}

/** Error al leer de la API, con la opción de reintentar. */
export function ErrorDeCarga({ onReintentar, titulo = 'No pudimos cargar esta sección', mensaje = ERROR_CONEXION }) {
  return (
    <section className={`${styles.error} band`} role="alert" aria-label={titulo}>
      <h2>{titulo}</h2>
      <p>{mensaje}</p>
      <p>
        <button type="button" className="btn" onClick={onReintentar}>Reintentar</button>
      </p>
    </section>
  );
}
