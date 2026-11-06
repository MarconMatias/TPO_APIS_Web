import type { ApiError } from '../../api/client';
import styles from './Carga.module.scss';

/** Estado de espera mientras responde la API (role="status": se anuncia sin interrumpir). */
export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return (
    <p className={`${styles.cargando} band`} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      {texto}
    </p>
  );
}

interface ErrorDeCargaProps {
  error: ApiError;
  onReintentar: () => void;
  titulo?: string;
}

/** Error al leer de la API, con el mensaje del backend y la opción de reintentar. */
export function ErrorDeCarga({ error, onReintentar, titulo = 'No pudimos cargar esta sección' }: ErrorDeCargaProps) {
  return (
    <section className={`${styles.error} band`} role="alert" aria-label={titulo}>
      <h2>{titulo}</h2>
      <p>{error.message}</p>
      <p>
        <button type="button" className="btn" onClick={onReintentar}>Reintentar</button>
      </p>
    </section>
  );
}
