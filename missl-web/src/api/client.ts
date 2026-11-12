import { API_BASE_URL, USAR_MOCK } from '../config';
import { ErrorMock, mockRequest } from '../mocks/mockApi';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import type { ApiErrorBody } from '../types/api';

/** Qué JWT adjuntar: el del cliente (compras, perfil), el del administrador (/admin/**) o ninguno (catálogo). */
export type Sesion = 'cliente' | 'admin' | 'ninguna';

const ERROR_CONEXION = 'No pudimos conectarnos con el servidor. Revisá tu conexión e intentá de nuevo.';

/** Error normalizado: mismo formato que ApiError de missl-api (status + mensajes). */
export class ApiError extends Error {
  readonly status: number;
  readonly mensajes: string[];

  constructor(status: number, mensajes: string[]) {
    super(mensajes.join(' '));
    this.name = 'ApiError';
    this.status = status;
    this.mensajes = mensajes;
  }
}

interface Opciones {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  sesion?: Sesion;
}

function tokenDe(sesion: Sesion): string | null {
  if (sesion === 'cliente') return useAuthStore.getState().token;
  if (sesion === 'admin') return useAdminAuthStore.getState().token;
  return null;
}

/** 401 con token = sesión vencida o inválida: se cierra para que las rutas protegidas redirijan al login. */
function cerrarSesionVencida(sesion: Sesion) {
  if (sesion === 'cliente') useAuthStore.getState().salir();
  if (sesion === 'admin') useAdminAuthStore.getState().salir();
  useToastStore.getState().mostrar('Tu sesión expiró. Volvé a ingresar para continuar.');
}

/**
 * Único punto de salida HTTP hacia missl-api: arma la URL, serializa el body, adjunta el JWT
 * (Authorization: Bearer) y convierte cualquier error en un ApiError con mensajes legibles.
 */
async function request<T>(path: string, { method = 'GET', body, sesion = 'ninguna' }: Opciones = {}): Promise<T> {
  const token = tokenDe(sesion);
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  if (USAR_MOCK) {
    try {
      return (await mockRequest(method, path, body, token)) as T;
    } catch (e) {
      if (!(e instanceof ErrorMock)) throw e;
      if (e.status === 401 && token) cerrarSesionVencida(sesion);
      throw new ApiError(e.status, e.mensajes);
    }
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, [ERROR_CONEXION]);
  }

  if (respuesta.status === 204) return undefined as T;

  const esJson = respuesta.headers.get('content-type')?.includes('application/json');
  const datos: unknown = esJson ? await respuesta.json().catch(() => null) : null;

  if (!respuesta.ok) {
    const cuerpo = datos as Partial<ApiErrorBody> | null;
    const mensajes = cuerpo?.mensajes?.length ? cuerpo.mensajes : [`Ocurrió un error inesperado (${respuesta.status}).`];
    if (respuesta.status === 401 && token) cerrarSesionVencida(sesion);
    throw new ApiError(respuesta.status, mensajes);
  }
  return datos as T;
}

export const http = {
  get: <T>(path: string, sesion?: Sesion) => request<T>(path, { sesion }),
  post: <T>(path: string, body: unknown, sesion?: Sesion) => request<T>(path, { method: 'POST', body, sesion }),
  put: <T>(path: string, body: unknown, sesion?: Sesion) => request<T>(path, { method: 'PUT', body, sesion }),
  patch: <T>(path: string, body: unknown, sesion?: Sesion) => request<T>(path, { method: 'PATCH', body, sesion }),
  del: <T>(path: string, sesion?: Sesion) => request<T>(path, { method: 'DELETE', sesion }),
};
