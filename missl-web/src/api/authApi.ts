import type { Cliente, ClienteAuthResponse, ClienteLoginRequest, ClienteRegistroRequest } from '../types/cliente';
import { http } from './client';

/** Cuentas de cliente (JWT de rol CLIENTE). */
export const authApi = {
  /** POST /auth/registro → 201 con token. 409 si el email ya tiene cuenta. */
  registrar: (request: ClienteRegistroRequest) => http.post<ClienteAuthResponse>('/auth/registro', request),

  /** POST /auth/login → token. 401 si las credenciales no son correctas. */
  ingresar: (request: ClienteLoginRequest) => http.post<ClienteAuthResponse>('/auth/login', request),

  /** GET /auth/me: datos actualizados de la cuenta (ej.: si ya usó el descuento). */
  perfil: () => http.get<Cliente>('/auth/me', 'cliente'),
};
