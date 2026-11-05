/** "HH:MM:SS" a partir de los milisegundos restantes. */
export function formatCuentaRegresiva(ms: number): string {
  const restante = Math.max(0, ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  const horas = Math.floor(restante / 3_600_000);
  const minutos = Math.floor(restante / 60_000) % 60;
  const segundos = Math.floor(restante / 1000) % 60;
  return `${pad(horas)}:${pad(minutos)}:${pad(segundos)}`;
}

/** Duración ISO 8601 para el atributo datetime de <time> (ej.: PT23H41M5S). */
export function duracionIso(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `PT${Math.floor(s / 3600)}H${Math.floor(s / 60) % 60}M${s % 60}S`;
}
