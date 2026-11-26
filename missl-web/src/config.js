/**
 * URL base de missl-api. Se configura con la variable de entorno VITE_API_URL (archivo .env),
 * así el front y el back se despliegan como repositorios independientes.
 * Cada componente arma sus peticiones con fetch(`${API_BASE_URL}/...`).
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

/** Mensaje para cuando fetch() no llega al servidor (backend apagado, sin conexión, CORS). */
export const ERROR_CONEXION = 'No pudimos conectarnos con el servidor. Revisá tu conexión e intentá de nuevo.';

/** Mensaje para respuestas de error sin cuerpo con "mensajes" (formato ApiError de missl-api). */
export const ERROR_INESPERADO = 'Ocurrió un error inesperado. Probá de nuevo.';
