/**
 * URL base de missl-api. Se configura con la variable de entorno VITE_API_URL (archivo .env),
 * así el front y el back se despliegan como repositorios independientes.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';
