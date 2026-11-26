/** Reglas de validación del lado del cliente. Cada una devuelve el mensaje de error o null. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function requerido(valor, mensaje) {
  return valor.trim() ? null : mensaje;
}

export function email(valor) {
  if (!valor.trim()) return 'Ingresá tu email.';
  return EMAIL_RE.test(valor.trim()) ? null : 'El email no tiene un formato válido (ej.: nombre@correo.com).';
}

export function password(valor) {
  if (!valor) return 'Ingresá una contraseña.';
  if (valor.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  return /\d/.test(valor) && /[a-zA-Z]/.test(valor) ? null : 'La contraseña debe combinar letras y números.';
}

export function telefono(valor) {
  if (!valor.trim()) return 'Ingresá un teléfono de contacto.';
  // Misma regla que VentaRequest en missl-api: "+" solo al principio; números, espacios, guiones y paréntesis.
  if (!/^\+?[\d\s()-]+$/.test(valor.trim())) {
    return 'El teléfono solo puede tener números, espacios, guiones, paréntesis y un "+" al principio.';
  }
  const digitos = valor.replace(/\D/g, '').length;
  return digitos >= 8 && digitos <= 15 ? null : 'El teléfono debe tener entre 8 y 15 dígitos.';
}

export function largoMinimo(valor, min, mensaje) {
  return valor.trim().length >= min ? null : mensaje;
}

export function enteroEnRango(valor, min, max, campo) {
  if (valor.trim() === '') return `Ingresá ${campo}.`;
  const n = Number(valor);
  if (!Number.isInteger(n)) return `${capitalizar(campo)} debe ser un número entero.`;
  if (n < min || n > max) return `${capitalizar(campo)} debe estar entre ${min.toLocaleString('es-AR')} y ${max.toLocaleString('es-AR')}.`;
  return null;
}

function capitalizar(texto) {
  const limpio = texto.replace(/^(el|la|un|una) /, '');
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

/** Quita las claves sin error para que `Object.keys` refleje solo los campos inválidos. */
export function limpiarErrores(errores) {
  const resultado = {};
  for (const clave in errores) {
    const mensaje = errores[clave];
    if (mensaje) resultado[clave] = mensaje;
  }
  return resultado;
}

/**
 * Al enviar un formulario con errores, lleva el foco al primer campo inválido
 * (navegación por teclado / lectores de pantalla). Los ids de los campos son `${prefijo}-${campo}`.
 */
export function enfocarPrimerError(prefijo, errores) {
  const [primero] = Object.keys(errores);
  if (primero) document.getElementById(`${prefijo}-${primero}`)?.focus();
}
