import type { Categoria } from './producto';

/** Tipos espejo de los DTO de administración de missl-api (/api/admin). */

/** AdminLoginRequest: paso 1 del login (email + contraseña). */
export interface AdminLoginRequest {
  email: string;
  password: string;
}

/** AdminLoginResponse: desafío para el paso 2FA. */
export interface AdminLoginResponse {
  challengeId: string;
}

/** Admin2faRequest: paso 2 (código TOTP de 6 dígitos). */
export interface Admin2faRequest {
  challengeId: string;
  codigo: string;
}

/** AdminAuthResponse: JWT de rol ADMIN. */
export interface AdminAuthResponse {
  token: string;
  email: string;
}

/** ProductoAdminDTO: fila del ABM. */
export interface ProductoAdmin {
  id: number;
  sku: string;
  nombre: string;
  marca: string;
  categoria: Categoria;
  precio: number;
  enStock: boolean;
  esTendencia: boolean;
  descripcion: string | null;
}

/** ProductoAltaRequest: alta y modificación. */
export interface ProductoAltaRequest {
  nombre: string;
  marca: string;
  categoria: Categoria;
  precio: number;
  enStock: boolean;
  descripcion: string | null;
}

/** PromocionAdminDTO: tendencias y descuentos. */
export interface PromocionAdmin {
  id: number;
  nombre: string;
  marca: string;
  esTendencia: boolean;
  descuentoPct: number;
  descuentoHoras: number;
  restanteMs: number | null;
}

/** PromocionRequest: PATCH /admin/productos/{id}/promocion. */
export interface PromocionRequest {
  descuentoPct: number;
  horas: number;
  esTendencia: boolean;
}
