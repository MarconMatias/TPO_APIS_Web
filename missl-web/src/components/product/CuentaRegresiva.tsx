import { useClockStore } from '../../store/clockStore';
import { duracionIso, formatCuentaRegresiva } from '../../util/cuentaRegresiva';

/** Cuenta regresiva viva hasta `fin` (epoch ms). No es región aria-live a propósito: anunciaría cada segundo. */
export function CuentaRegresiva({ fin, className }: { fin: number; className?: string }) {
  const ahora = useClockStore((s) => s.ahora);
  const restante = fin - ahora;
  return (
    <time className={`num ${className ?? ''}`} dateTime={duracionIso(restante)}>
      {formatCuentaRegresiva(restante)}
    </time>
  );
}
