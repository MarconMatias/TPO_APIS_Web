/**
 * URL base de missl-api. Se configura con la variable de entorno VITE_API_URL (archivo .env),
 * así el front y el back se despliegan como repositorios independientes.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

/**
 * true: el front usa los datos simulados de src/mocks y no llama a missl-api.
 * Para usar el backend real: VITE_USE_MOCK=false en el archivo .env (o cambiar el default acá).
 */
export const USAR_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
