/** Tipos espejo de los DTO de cuentas de cliente de missl-api (/api/auth). */

/** ClienteRegistroRequest */
export interface ClienteRegistroRequest {
  nombre: string;
  email: string;
  password: string;
}

/** ClienteLoginRequest */
export interface ClienteLoginRequest {
  email: string;
  password: string;
}

/** ClienteDTO (GET /auth/me): mismos datos de cuenta que ClienteAuthResponse, sin el token. */
export interface Cliente {
  nombre: string;
  email: string;
  /** true mientras no haya usado el 5% de bienvenida (lo controla el backend). */
  descuentoDisponible: boolean;
}

/** ClienteAuthResponse (registro y login). */
export interface ClienteAuthResponse extends Cliente {
  token: string;
}
