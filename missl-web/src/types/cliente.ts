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

/** ClienteDTO */
export interface Cliente {
  id: number;
  nombre: string;
  email: string;
  /** El 5% de bienvenida aplica solo mientras sea false (lo controla el backend). */
  descuentoRegistroUsado: boolean;
}

/** ClienteAuthResponse */
export interface ClienteAuthResponse {
  token: string;
  cliente: Cliente;
}
