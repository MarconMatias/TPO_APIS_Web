import { useState } from 'react';
import { useClockStore } from '../../store/clockStore';
import { duracionIso, formatCuentaRegresiva } from '../../util/cuentaRegresiva';

/**
 * Cuenta regresiva viva a partir de promoRestanteMs (missl-api). El fin se fija una sola vez al montar.
 * No es región aria-live a propósito: anunciaría cada segundo.
 */
export function CuentaRegresiva({ restanteMs, className }: { restanteMs: number; className?: string }) {
  const [fin] = useState(() => Date.now() + restanteMs);
  const ahora = useClockStore((s) => s.ahora);
  const restante = fin - ahora;
  return (
    <time className={`num ${className ?? ''}`} dateTime={duracionIso(restante)}>
      {formatCuentaRegresiva(restante)}
    </time>
  );
}
