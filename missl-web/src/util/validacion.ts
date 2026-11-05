/** Reglas de validación del lado del cliente. Cada una devuelve el mensaje de error o null. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function requerido(valor: string, mensaje: string): string | null {
  return valor.trim() ? null : mensaje;
}

export function email(valor: string): string | null {
  if (!valor.trim()) return 'Ingresá tu email.';
  return EMAIL_RE.test(valor.trim()) ? null : 'El email no tiene un formato válido (ej.: nombre@correo.com).';
}

export function password(valor: string): string | null {
  if (!valor) return 'Ingresá una contraseña.';
  if (valor.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  return /\d/.test(valor) && /[a-zA-Z]/.test(valor) ? null : 'La contraseña debe combinar letras y números.';
}

export function telefono(valor: string): string | null {
  if (!valor.trim()) return 'Ingresá un teléfono de contacto.';
  if (/[^\d\s()+-]/.test(valor)) return 'El teléfono solo puede tener números, espacios, guiones y paréntesis.';
  const digitos = valor.replace(/\D/g, '').length;
  return digitos >= 8 && digitos <= 15 ? null : 'El teléfono debe tener entre 8 y 15 dígitos.';
}

export function largoMinimo(valor: string, min: number, mensaje: string): string | null {
  return valor.trim().length >= min ? null : mensaje;
}

export function enteroEnRango(valor: string, min: number, max: number, campo: string): string | null {
  if (valor.trim() === '') return `Ingresá ${campo}.`;
  const n = Number(valor);
  if (!Number.isInteger(n)) return `${capitalizar(campo)} debe ser un número entero.`;
  if (n < min || n > max) return `${capitalizar(campo)} debe estar entre ${min.toLocaleString('es-AR')} y ${max.toLocaleString('es-AR')}.`;
  return null;
}

function capitalizar(texto: string): string {
  const limpio = texto.replace(/^(el|la|un|una) /, '');
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

/** Quita las claves sin error para que `Object.keys` refleje solo los campos inválidos. */
export function limpiarErrores<K extends string>(errores: Record<K, string | null>): Partial<Record<K, string>> {
  const resultado: Partial<Record<K, string>> = {};
  for (const clave in errores) {
    const mensaje = errores[clave];
    if (mensaje) resultado[clave] = mensaje;
  }
  return resultado;
}
