import type {
  Admin2faRequest,
  AdminAuthResponse,
  AdminLoginRequest,
  AdminLoginResponse,
  ProductoAdmin,
  ProductoAltaRequest,
  PromocionAdmin,
  PromocionRequest,
} from '../types/admin';
import { http } from './client';

/** Panel de administración: login en dos pasos (contraseña + 2FA TOTP) y ABM con JWT de rol ADMIN. */
export const adminApi = {
  /** Paso 1: POST /admin/login → challengeId. */
  login: (request: AdminLoginRequest) => http.post<AdminLoginResponse>('/admin/login', request),

  /** Paso 2: POST /admin/2fa → JWT de administrador. */
  verificar2fa: (request: Admin2faRequest) => http.post<AdminAuthResponse>('/admin/2fa', request),

  listarProductos: () => http.get<ProductoAdmin[]>('/admin/productos', 'admin'),

  crearProducto: (request: ProductoAltaRequest) => http.post<ProductoAdmin>('/admin/productos', request, 'admin'),

  editarProducto: (id: number, request: ProductoAltaRequest) =>
    http.put<ProductoAdmin>(`/admin/productos/${id}`, request, 'admin'),

  /** Baja lógica en el backend (preserva las ventas históricas). */
  eliminarProducto: (id: number) => http.del<void>(`/admin/productos/${id}`, 'admin'),

  listarPromociones: () => http.get<PromocionAdmin[]>('/admin/productos/promociones', 'admin'),

  actualizarPromocion: (id: number, request: PromocionRequest) =>
    http.patch<PromocionAdmin>(`/admin/productos/${id}/promocion`, request, 'admin'),
};
