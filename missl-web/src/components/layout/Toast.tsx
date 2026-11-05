import { Link } from 'react-router-dom';
import { useToastStore } from '../../store/toastStore';
import styles from './Toast.module.scss';

/**
 * Aviso flotante. La región role="status" queda siempre montada (vacía cuando no hay aviso)
 * para que los lectores de pantalla anuncien cada mensaje nuevo.
 */
export function Toast() {
  const aviso = useToastStore((s) => s.aviso);
  const ocultar = useToastStore((s) => s.ocultar);

  return (
    <p role="status" className={styles.region}>
      {aviso && (
        <span key={aviso.id} className={styles.toast}>
          <span>{aviso.mensaje}</span>
          {aviso.accion && (
            <Link to={aviso.accion.to} onClick={ocultar} className={styles.accion}>
              {aviso.accion.label}
            </Link>
          )}
          <button type="button" onClick={ocultar} className={styles.cerrar} aria-label="Cerrar aviso">
            ×
          </button>
        </span>
      )}
    </p>
  );
}
